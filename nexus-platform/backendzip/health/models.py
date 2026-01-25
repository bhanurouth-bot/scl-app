from django.db import models
from students.models import Student

class HealthRecord(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-')
    ]

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='health_record')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="in cm")
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="in kg")
    allergies = models.TextField(blank=True, default="None") # e.g. "Peanuts, Dust"
    emergency_contact = models.CharField(max_length=15)
    
    def __str__(self):
        return f"Health Record: {self.student.first_name}"

class ClinicVisit(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    visit_date = models.DateTimeField(auto_now_add=True)
    symptom = models.CharField(max_length=200) # e.g. "Severe Headache"
    diagnosis = models.TextField(blank=True)
    treatment = models.TextField(blank=True) # e.g. "Given Paracetamol, Rest"
    
    def __str__(self):
        return f"{self.student.first_name} - {self.symptom}"