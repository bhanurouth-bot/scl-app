from django.db import models
from core.models import Classroom, AcademicYear
from hr.models import Employee

class Subject(models.Model):
    """
    Master Database of Subjects.
    Refers to the generic subject, not the specific class instance.
    e.g., "Mathematics", "Physics", "Physical Education".
    """
    TYPE_CHOICES = [
        ('THEORY', 'Theory'),
        ('PRACTICAL', 'Practical / Lab'),
        ('ELECTIVE', 'Elective (Optional)'),
    ]

    name = models.CharField(max_length=100, unique=True, help_text="e.g. Mathematics, English Literature")
    code = models.CharField(max_length=20, unique=True, help_text="Short Code e.g. MATH-101")
    subject_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='THEORY')
    
    # Optional: Credits for GPA calculation later
    credits = models.PositiveIntegerField(default=1, help_text="Credit weightage for this subject")
    
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class SubjectAllocation(models.Model):
    """
    The link between a Class, a Subject, and a Teacher.
    This tells the system: "Mr. Smith teaches Math to Grade 10-A".
    CRITICAL for Timetables and Permissions.
    """
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='allocated_subjects')
    
    # Optional: If this subject requires a specific textbook or syllabus link
    syllabus_link = models.URLField(blank=True, null=True)

    class Meta:
        # A class cannot have the same subject assigned twice in the same year (usually)
        unique_together = ['academic_year', 'classroom', 'subject']
        verbose_name = "Subject Allocation"
        verbose_name_plural = "Subject Allocations"

    def __str__(self):
        teacher_name = self.teacher.user.get_full_name() if self.teacher else "No Teacher"
        return f"{self.classroom} - {self.subject.name} ({teacher_name})"