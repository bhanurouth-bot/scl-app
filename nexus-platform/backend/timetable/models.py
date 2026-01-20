from django.db import models
from django.conf import settings
from academics.models import Subject
from core.models import Classroom

class TimeSlot(models.Model):
    name = models.CharField(max_length=50) # e.g. "Period 1"
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

class TimetableEntry(models.Model):
    DAYS_OF_WEEK = [
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday')
    ]

    # Replaced grade/section strings with Classroom FK
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='timetable')
    
    day = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    room_number = models.CharField(max_length=20, default="Room 101")

    class Meta:
        unique_together = ('classroom', 'day', 'time_slot') # One class can't have 2 subjects at same time
        verbose_name_plural = "Timetable Entries"

    def __str__(self):
        return f"{self.classroom} {self.day} : {self.subject.name}"