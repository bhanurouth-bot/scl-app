from django.db import models
from students.models import Student

class Transaction(models.Model):
    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('ONLINE', 'Online/Card'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='CASH')
    date = models.DateTimeField(auto_now_add=True)
    
    # Store a receipt number (e.g., TXN-2026-0001)
    receipt_number = models.CharField(max_length=20, unique=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate receipt number if missing
        if not self.receipt_number:
            import uuid
            self.receipt_number = f"TXN-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_number} - ${self.amount}"