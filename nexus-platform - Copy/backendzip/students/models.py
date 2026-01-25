from django.db import models
from django.conf import settings
from core.models import Classroom

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    
    # Personal Info
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    
    # Contact
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    # Guardian Info
    guardian_name = models.CharField(max_length=100)
    guardian_phone = models.CharField(max_length=15)
    guardian_email = models.EmailField(blank=True)
    guardian_relation = models.CharField(max_length=50, default="Parent")

    # Academic
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, related_name='students')
    roll_number = models.CharField(max_length=10, blank=True)
    admission_date = models.DateField(auto_now_add=True)

    # Media
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    student_signature = models.ImageField(upload_to='signatures/students/', blank=True, null=True)
    guardian_signature = models.ImageField(upload_to='signatures/guardians/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.student_id})"

# --- NEW MODELS ---

class StudentHealth(models.Model):
    # FIX: Changed related_name from 'health_record' to 'medical_profile' to avoid clash
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='medical_profile')
    allergies = models.TextField(blank=True, help_text="List any allergies")
    medications = models.TextField(blank=True, help_text="Current medications")
    chronic_conditions = models.TextField(blank=True, help_text="Asthma, Diabetes, etc.")
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    doctor_name = models.CharField(max_length=100, blank=True)
    doctor_phone = models.CharField(max_length=20, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)

class StudentPreviousEducation(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='previous_education')
    school_name = models.CharField(max_length=200)
    grade_completed = models.CharField(max_length=50)
    year_passing = models.CharField(max_length=4)
    percentage = models.CharField(max_length=10, blank=True)
    board = models.CharField(max_length=50, blank=True)

class StudentDocument(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='student_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)