from django.db import models
from django.conf import settings
from core.models import Classroom, AcademicYear

class Student(models.Model):
    """
    The Student Profile.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )

    # Academic Identity
    student_id = models.CharField(max_length=20, unique=True, help_text="Admission Number (e.g. ADM-2025-001)")
    roll_number = models.PositiveIntegerField()
    
    # Classroom Mapping
    classroom = models.ForeignKey(
        Classroom, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="students"
    )
    
    admission_year = models.ForeignKey(AcademicYear, on_delete=models.SET_NULL, null=True)

    # Personal Details (Specific to students)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')])
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    
    # Guardian Info
    guardian_name = models.CharField(max_length=255)
    guardian_phone = models.CharField(max_length=20)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['classroom', 'roll_number']
        unique_together = ['classroom', 'roll_number'] 

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"