from django.db import models
from core.models import Classroom, AcademicYear
from academics.models import Subject
from hr.models import Employee

class TimetableSlot(models.Model):
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='timetable_slots')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    
    day_of_week = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        # CONSTRAINTS: The "Smart" Logic
        constraints = [
            # 1. A Class cannot have two subjects at the same time
            models.UniqueConstraint(
                fields=['classroom', 'day_of_week', 'start_time'], 
                name='unique_class_slot'
            ),
            # 2. A Teacher cannot be in two places at the same time
            # (Note: This requires teacher to be non-null to enforce at DB level, 
            # but we will enforce it in Serializer for better error messages)
        ]

    def __str__(self):
        return f"{self.classroom} | {self.day_of_week} {self.start_time} | {self.subject}"