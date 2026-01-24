from django.db import models
from students.models import Student
from django.conf import settings

class IDCardLog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    card_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"ID Card - {self.student.student_id}"

class CertificateLog(models.Model):
    CERT_TYPES = [
        ('BONAFIDE', 'Bonafide Certificate'),
        ('CHARACTER', 'Character Certificate'),
        ('TRANSFER', 'Transfer/Leaving Certificate'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certificates')
    certificate_type = models.CharField(max_length=20, choices=CERT_TYPES)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    issued_at = models.DateField(auto_now_add=True)
    reference_number = models.CharField(max_length=50, unique=True, blank=True)
    remarks = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            # Generate Ref: REF-TYPE-YEAR-ID (e.g., REF-BON-2026-001)
            import datetime
            year = datetime.date.today().year
            code = self.certificate_type[:3]
            self.reference_number = f"REF-{code}-{year}-{self.student.student_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.certificate_type} - {self.student.student_id}"