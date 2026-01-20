from django.db import models
from core.models import Classroom
from academics.models import Subject
from django.conf import settings # Links to User (Teacher)

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Who is this for? (Replaces old 'grade'/'section' strings)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    # Who assigned it?
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.classroom}"

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    
    # For now, we store a link. Later use models.FileField
    file_link = models.URLField(blank=True, max_length=500)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.CharField(max_length=5, blank=True) # e.g. "A", "80/100"
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.first_name} - {self.assignment.title}"