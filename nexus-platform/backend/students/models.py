from django.db import models
from core.models import User  # Assuming we link to a user later

class Student(models.Model):
    # Basic Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=20, unique=True) # e.g., "STD-2026-001"
    
    # Academic Info
    grade = models.CharField(max_length=10) # e.g., "10th"
    section = models.CharField(max_length=5) # e.g., "A"
    roll_number = models.IntegerField()
    
    # Financial Status (The "Selling Point" feature)
    fees_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"