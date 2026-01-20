from django.db import models
from students.models import Student
from academics.models import Subject
from django.conf import settings

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # CHANGED: Increased length to allow "10,11,12" or "A,B,C"
    grade = models.CharField(max_length=50, default="10") 
    section = models.CharField(max_length=50, default="A")
    
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.grade}{self.section}"

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    content = models.TextField(help_text="Link to Google Doc or text answer")
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.CharField(max_length=5, blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student} -> {self.assignment}"