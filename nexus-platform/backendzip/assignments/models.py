from django.db import models
from django.conf import settings
from core.models import Classroom
from academics.models import Subject

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    
    # 1. Who created/assigned this task?
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_assignments')
    
    # 2. Who is supposed to check/grade this task? (New Feature)
    grader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assignments_to_grade')
    
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    total_marks = models.PositiveIntegerField(default=100)
    
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name}"

    class Meta:
        ordering = ['-assigned_date']

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='submissions/', blank=True, null=True)
    
    marks_obtained = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ['assignment', 'student']