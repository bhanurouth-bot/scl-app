from django.db import models
from django.utils import timezone
from core.models import AcademicYear, Classroom
from students.models import Student

class FeeHead(models.Model):
    """
    Master Data for Fee Types.
    e.g., "Tuition Fee", "Transport Fee", "Library Fine", "Exam Fee".
    """
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class FeeStructure(models.Model):
    """
    Defines how much a specific Class pays for a specific Fee Head.
    e.g., "Grade 10 pays $500 for Tuition in 2025-2026".
    """
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, help_text="Apply this fee to this specific class")
    fee_head = models.ForeignKey(FeeHead, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True, help_text="Default due date for this fee")

    class Meta:
        unique_together = ['academic_year', 'classroom', 'fee_head']

    def __str__(self):
        return f"{self.classroom} - {self.fee_head}: {self.amount}"

class Invoice(models.Model):
    """
    The Bill generated for a Student.
    It links to multiple Fee Items (Line Items).
    """
    STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Fully Paid'),
        ('OVERDUE', 'Overdue'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    
    # Financial Snapshots (Denormalized for performance)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='UNPAID')

    def save(self, *args, **kwargs):
        # Auto-generate Invoice Number: INV-YYYY-STUDENTID-ID
        if not self.invoice_number:
            # Logic to generate unique ID can be more complex in production
            import uuid
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate status
        self.balance_due = self.total_amount - self.paid_amount
        if self.balance_due <= 0:
            self.status = 'PAID'
            self.balance_due = 0 # Prevent negative balance
        elif self.paid_amount > 0:
            self.status = 'PARTIAL'
        else:
            self.status = 'UNPAID'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.student.user.get_full_name()}"

class InvoiceItem(models.Model):
    """
    Line items for the Invoice.
    e.g. 
    1. Tuition Fee - $500
    2. Bus Fee - $100
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    fee_head = models.ForeignKey(FeeHead, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.fee_head.name}: {self.amount}"

class Transaction(models.Model):
    """
    A Payment made against an Invoice.
    """
    METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('ONLINE', 'Online / Card'),
        ('CHEQUE', 'Cheque / Draft'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='CASH')
    
    transaction_reference = models.CharField(
        max_length=100, 
        blank=True, 
        help_text="Bank Ref / Cheque No / Stripe ID"
    )
    
    remarks = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Trigger Invoice update
        self.update_invoice()

    def update_invoice(self):
        # Recalculate invoice totals
        total_paid = sum(t.amount for t in self.invoice.transactions.all())
        self.invoice.paid_amount = total_paid
        self.invoice.save()

    def __str__(self):
        return f"{self.amount} ({self.payment_method}) - {self.invoice.invoice_number}"