from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
from .models import FeeHead, FeeStructure, Invoice, InvoiceItem, Transaction
from students.models import Student
from .serializers import (
    FeeHeadSerializer, FeeStructureSerializer, 
    InvoiceSerializer, TransactionSerializer, BulkInvoiceSerializer
)

class FeeHeadViewSet(viewsets.ModelViewSet):
    queryset = FeeHead.objects.all()
    serializer_class = FeeHeadSerializer

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-issue_date')
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Returns Dashboard Financial Stats using DB Aggregation for accuracy.
        """
        # Use Django Aggregation to sum up columns directly in the DB
        # This avoids the "Decimal vs Float" python error and is much faster
        stats = Invoice.objects.aggregate(
            total_rev=Sum('total_amount'),
            collected=Sum('paid_amount'),
            pending=Sum('balance_due')
        )
        
        # Handle case where table is empty (returns None) -> convert to 0
        total_rev = stats['total_rev'] or 0
        collected = stats['collected'] or 0
        pending = stats['pending'] or 0
        
        return Response({
            "total_revenue": total_rev,
            "collected": collected,
            "pending": pending
        })

    @action(detail=False, methods=['post'])
    def bulk_generate(self, request):
        """
        Generates Invoices for all students in a specific class.
        """
        print("--- Bulk Invoice Request Data ---")
        print(request.data)

        serializer = BulkInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            cls = serializer.validated_data['classroom']
            year = serializer.validated_data['academic_year']
            due_date = serializer.validated_data['due_date']

            # 1. Check for Students
            students = Student.objects.filter(classroom=cls)
            if not students.exists():
                return Response({"error": f"No students found in {cls}. Add students first."}, status=400)
            
            # 2. Check for Fee Structure
            structures = FeeStructure.objects.filter(classroom=cls, academic_year=year)
            if not structures.exists():
                return Response({
                    "error": f"No Fee Structure defined for {cls} in this academic year. Please go to Fee Structures and add a rule."
                }, status=400)

            created_count = 0
            
            try:
                with transaction.atomic():
                    for student in students:
                        # Create Invoice Header
                        inv = Invoice.objects.create(
                            student=student,
                            academic_year=year,
                            due_date=due_date,
                            total_amount=Decimal('0.00')
                        )
                        
                        # Create Line Items
                        total = Decimal('0.00')
                        for struct in structures:
                            InvoiceItem.objects.create(
                                invoice=inv,
                                fee_head=struct.fee_head,
                                amount=struct.amount
                            )
                            total += struct.amount
                        
                        # Update Invoice Total
                        inv.total_amount = total
                        inv.balance_due = total # Initially, balance = total
                        inv.save()
                        created_count += 1
            except Exception as e:
                print(f"CRITICAL ERROR: {e}")
                return Response({"error": str(e)}, status=500)

            return Response({"message": f"Generated {created_count} invoices successfully."})
        
        print("VALIDATION ERROR:", serializer.errors)
        return Response(serializer.errors, status=400)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-payment_date')
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        # We override create to ensure we catch any errors during payment recording
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=400)