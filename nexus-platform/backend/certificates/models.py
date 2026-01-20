from django.db import models
from students.models import Student
from django.conf import settings

class Certificate(models.Model):
    TYPE_CHOICES = [
        ('ID_CARD', 'Student ID Card'),
        ('TRANSFER', 'Transfer Certificate (TC)'),
        ('CHARACTER', 'Character Certificate'),
        ('REPORT', 'Report Card'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    cert_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)
    
    # We generate a unique validation code for every document
    validation_code = models.CharField(max_length=20, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.validation_code:
            import uuid
            self.validation_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_cert_type_display()} - {self.student.first_name}"