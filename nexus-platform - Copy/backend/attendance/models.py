from django.db import models
from django.utils import timezone
from students.models import Student
from core.models import Classroom, AcademicYear
from hr.models import Employee 

class AttendanceSession(models.Model):
    """
    Represents a single "roll call" event.
    This allows you to support Morning/Afternoon sessions or Subject-wise attendance later.
    """
    SESSION_CHOICES = [
        ('MORNING', 'Morning Session'),
        ('AFTERNOON', 'Afternoon Session'),
        ('EXAM', 'Exam Attendance'),
    ]

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField(default=timezone.now)
    session_type = models.CharField(max_length=20, choices=SESSION_CHOICES, default='MORNING')
    
    # Audit: Which teacher took this attendance?
    taken_by = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='attendance_taken'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate rolls for the same class/session/date
        unique_together = ['classroom', 'date', 'session_type']
        ordering = ['-date', 'classroom']

    def __str__(self):
        return f"{self.classroom} - {self.date} ({self.get_session_type_display()})"

class AttendanceRecord(models.Model):
    """
    The individual status of a student for a specific session.
    """
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused / Leave'),
        ('HALF_DAY', 'Half Day'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    remarks = models.CharField(max_length=255, blank=True, help_text="Reason for absence or late arrival")
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['session', 'student'] # One status per student per session

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.status}"