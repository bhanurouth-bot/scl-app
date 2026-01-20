from django.db import models
from students.models import Student
from academics.models import Subject

# 1. NEW: The Rule Book (e.g., 90-100 = 'O')
class GradeRule(models.Model):
    name = models.CharField(max_length=50) # e.g. "Standard Grading"
    min_score = models.IntegerField() # e.g. 90
    max_score = models.IntegerField() # e.g. 100
    grade_letter = models.CharField(max_length=5) # e.g. "O"
    label = models.CharField(max_length=50) # e.g. "Outstanding"
    color_code = models.CharField(max_length=20, default="text-green-400") # Tailwind class

    def __str__(self):
        return f"{self.grade_letter} ({self.min_score}-{self.max_score})"

class Exam(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class MarkEntry(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    # CHANGED: Split Scores
    theory_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    practical_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    total_score = models.DecimalField(max_digits=5, decimal_places=2, default=0) # Auto-calculated
    is_pass = models.BooleanField(default=False)

    class Meta:
        unique_together = ('exam', 'student', 'subject')

    def save(self, *args, **kwargs):
        # Auto-Calculate Total
        self.total_score = float(self.theory_score) + float(self.practical_score)
        
        # Check Pass Criteria
        passed_theory = self.theory_score >= self.subject.pass_theory_marks
        passed_practical = self.practical_score >= self.subject.pass_practical_marks
        self.is_pass = passed_theory and passed_practical
        
        super().save(*args, **kwargs)