from django.db import models
from students.models import Student
from academics.models import Subject
from core.models import Classroom

class Exam(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    classrooms = models.ManyToManyField(Classroom, related_name='exams')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ExamPaper(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='papers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=20, blank=True)
    total_marks = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.subject.name} ({self.exam.name})"

class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    grade = models.CharField(max_length=5, blank=True) 

    class Meta:
        unique_together = ['student', 'exam', 'subject']

    def save(self, *args, **kwargs):
        if float(self.total_marks) > 0:
            percentage = (float(self.marks_obtained) / float(self.total_marks)) * 100
            if percentage >= 90: self.grade = 'A+'
            elif percentage >= 80: self.grade = 'A'
            elif percentage >= 70: self.grade = 'B'
            elif percentage >= 60: self.grade = 'C'
            elif percentage >= 50: self.grade = 'D'
            else: self.grade = 'F'
        super().save(*args, **kwargs)

# --- NEW MODEL: REPORT CARD META ---
class ReportCard(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='report_cards')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    remarks = models.TextField(blank=True, default="Satisfactory progress.")
    conduct = models.CharField(max_length=100, default="Good")
    
    # Store calculated values
    attendance_percentage = models.FloatField(default=0.0)
    average_score = models.FloatField(default=0.0)  # <--- MAKE SURE THIS EXISTS
    
    generated_at = models.DateField(auto_now=True)

    class Meta:
        unique_together = ['student', 'exam']