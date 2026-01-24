from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse  # <--- Required for PDF response
from django.db import transaction
from django.db.models import Sum
from decimal import Decimal
import io

# --- ReportLab Imports for PDF ---
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

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
        stats = Invoice.objects.aggregate(
            total_rev=Sum('total_amount'),
            collected=Sum('paid_amount'),
            pending=Sum('balance_due')
        )
        
        return Response({
            "total_revenue": stats['total_rev'] or 0,
            "collected": stats['collected'] or 0,
            "pending": stats['pending'] or 0
        })

    @action(detail=False, methods=['post'])
    def bulk_generate(self, request):
        """
        Generates Invoices for all students in a specific class.
        """
        serializer = BulkInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            cls = serializer.validated_data['classroom']
            year = serializer.validated_data['academic_year']
            due_date = serializer.validated_data['due_date']

            students = Student.objects.filter(classroom=cls)
            if not students.exists():
                return Response({"error": f"No students found in {cls}."}, status=400)
            
            structures = FeeStructure.objects.filter(classroom=cls, academic_year=year)
            if not structures.exists():
                return Response({"error": f"No Fee Structure defined for {cls}."}, status=400)

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
                        inv.balance_due = total
                        inv.save()
                        created_count += 1
            except Exception as e:
                return Response({"error": str(e)}, status=500)

            return Response({"message": f"Generated {created_count} invoices successfully."})
        
        return Response(serializer.errors, status=400)

    # --- NEW: PDF DOWNLOAD ACTION ---
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        invoice = self.get_object()
        
        # Create a file-like buffer to receive PDF data.
        buffer = io.BytesIO()

        # Create the PDF object, using the buffer as its "file."
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # --- HEADER ---
        p.setFillColor(colors.darkblue)
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, height - 50, "NEXUS INSTITUTE")
        
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 70, "123 Education Lane, Tech City")
        p.drawString(50, height - 85, "Phone: +1 234 567 890")

        p.setFont("Helvetica-Bold", 16)
        p.drawRightString(width - 50, height - 50, "INVOICE")
        p.setFont("Helvetica", 10)
        p.drawRightString(width - 50, height - 70, f"#{invoice.invoice_number}")
        p.drawRightString(width - 50, height - 85, f"Date: {invoice.issue_date}")

        p.line(50, height - 100, width - 50, height - 100)

        # --- BILL TO ---
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, height - 130, "Bill To:")
        p.setFont("Helvetica", 12)
        student_name = f"{invoice.student.user.first_name} {invoice.student.user.last_name}"
        p.drawString(50, height - 145, student_name)
        p.drawString(50, height - 160, f"ID: {invoice.student.student_id}")
        
        classroom_str = "N/A"
        if invoice.student.classroom:
            classroom_str = f"Grade {invoice.student.classroom.grade_level}-{invoice.student.classroom.section}"
        p.drawString(50, height - 175, f"Class: {classroom_str}")

        # --- STATUS ---
        status_color = colors.green if invoice.status == 'PAID' else colors.red
        p.setFillColor(status_color)
        p.setFont("Helvetica-Bold", 14)
        p.drawRightString(width - 50, height - 145, f"STATUS: {invoice.status}")
        p.setFillColor(colors.black)

        # --- TABLE HEADER ---
        y = height - 220
        p.setFillColor(colors.lightgrey)
        p.rect(50, y, width - 100, 20, fill=1, stroke=0)
        p.setFillColor(colors.black)
        p.setFont("Helvetica-Bold", 10)
        p.drawString(60, y + 6, "FEE DESCRIPTION")
        p.drawRightString(width - 60, y + 6, "AMOUNT")

        # --- ITEMS ---
        y -= 20
        p.setFont("Helvetica", 10)
        for item in invoice.items.all():
            p.drawString(60, y - 10, item.fee_head.name)
            p.drawRightString(width - 60, y - 10, str(item.amount))
            p.line(50, y - 15, width - 50, y - 15)
            y -= 25

        # --- TOTALS ---
        y -= 20
        p.setFont("Helvetica-Bold", 12)
        p.drawString(350, y, "Total Amount:")
        p.drawRightString(width - 60, y, str(invoice.total_amount))
        
        y -= 20
        p.drawString(350, y, "Paid Amount:")
        p.drawRightString(width - 60, y, str(invoice.paid_amount))
        
        y -= 20
        p.setFillColor(colors.red if invoice.balance_due > 0 else colors.green)
        p.drawString(350, y, "Balance Due:")
        p.drawRightString(width - 60, y, str(invoice.balance_due))

        # Close the PDF object cleanly
        p.showPage()
        p.save()

        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-payment_date')
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": str(e)}, status=400)