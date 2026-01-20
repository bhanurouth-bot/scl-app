from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
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
    # FIXED: Changed '-created_at' to '-issue_date'
    queryset = Invoice.objects.all().order_by('-issue_date')
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Returns Dashboard Financial Stats"""
        total_rev = sum(i.total_amount for i in self.queryset)
        collected = sum(i.paid_amount for i in self.queryset)
        pending = sum(i.balance_due for i in self.queryset)
        
        return Response({
            "total_revenue": total_rev,
            "collected": collected,
            "pending": pending
        })

    @action(detail=False, methods=['post'])
    def bulk_generate(self, request):
        """
        Generates Invoices for all students in a specific class
        based on the Fee Structures defined for that class.
        """
        serializer = BulkInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            cls = serializer.validated_data['classroom']
            year = serializer.validated_data['academic_year']
            due_date = serializer.validated_data['due_date']

            # 1. Get all students in this class
            students = Student.objects.filter(classroom=cls)
            
            # 2. Get Fee Structure for this class & year
            structures = FeeStructure.objects.filter(classroom=cls, academic_year=year)
            
            if not structures.exists():
                return Response({"error": "No Fee Structure found for this class."}, status=400)

            created_count = 0
            
            with transaction.atomic():
                for student in students:
                    # Create Invoice Header
                    inv = Invoice.objects.create(
                        student=student,
                        academic_year=year,
                        due_date=due_date,
                        total_amount=0 # Will update after items
                    )
                    
                    # Create Line Items from Structure
                    total = 0
                    for struct in structures:
                        InvoiceItem.objects.create(
                            invoice=inv,
                            fee_head=struct.fee_head,
                            amount=struct.amount
                        )
                        total += struct.amount
                    
                    # Update Invoice Total
                    inv.total_amount = total
                    inv.balance_due = total
                    inv.save()
                    created_count += 1

            return Response({"message": f"Generated {created_count} invoices successfully."})
        
        return Response(serializer.errors, status=400)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-payment_date')
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)