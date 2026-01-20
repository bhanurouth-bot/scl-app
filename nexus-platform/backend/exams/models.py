from django.db import models
from django.core.exceptions import ValidationError
from core.models import AcademicYear, Classroom
from academics.models import Subject
from students.models import Student
from hr.models import Employee

class GradeScale(models.Model):
    """
    Defines the grading logic. 
    e.g. "Standard GPA", "IGCSE Grades", "Kindergarten Stars".
    """
    name = models.CharField(max_length=50, unique=True) # e.g. "Standard 4.0 Scale"
    
    def __str__(self):
        return self.name

class GradeRule(models.Model):
    """
    The logic rules for a scale.
    e.g. 
    - 90-100 = A+ (4.0)
    - 80-89  = A  (3.7)
    """
    grade_scale = models.ForeignKey(GradeScale, on_delete=models.CASCADE, related_name='rules')
    min_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_label = models.CharField(max_length=5, help_text="A, B, C, etc.")
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, help_text="4.0, 3.7 etc.")
    
    class Meta:
        ordering = ['-min_score'] # Highest grades first

    def __str__(self):
        return f"{self.grade_label} ({self.min_score}-{self.max_score})"

class ExamBatch(models.Model):
    """
    Represents the Major Exam Event.
    e.g., "Final Exams 2026", "Unit Test 1".
    """
    name = models.CharField(max_length=100) # "Finals 2026"
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    is_published = models.BooleanField(default=False, help_text="If True, results are visible to parents")

    def __str__(self):
        return f"{self.name} ({self.academic_year})"

class Exam(models.Model):
    """
    A specific paper for a specific class.
    e.g., "Grade 10-A Mathematics Final".
    """
    batch = models.ForeignKey(ExamBatch, on_delete=models.CASCADE, related_name='exams')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2, default=40.00)
    
    # Audit: Who created this exam paper?
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = ['batch', 'classroom', 'subject']

    def __str__(self):
        return f"{self.classroom} - {self.subject} ({self.batch.name})"

class StudentResult(models.Model):
    """
    The actual marks obtained by a student.
    """
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    
    # Marks
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    is_absent = models.BooleanField(default=False)
    
    # Calculated automatically based on GradeScale
    grade = models.CharField(max_length=5, blank=True, null=True) 
    remarks = models.CharField(max_length=255, blank=True)

    def clean(self):
        if self.marks_obtained > self.exam.total_marks:
            raise ValidationError(f"Marks ({self.marks_obtained}) cannot exceed Total Marks ({self.exam.total_marks})")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ['exam', 'student']

    def __str__(self):
        return f"{self.student} - {self.marks_obtained}/{self.exam.total_marks}"