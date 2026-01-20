from django.db import models
from students.models import Student
from academics.models import ScheduleItem

class AttendanceLog(models.Model):
    schedule = models.ForeignKey(ScheduleItem, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent')], default='PRESENT')
    
    class Meta:
        unique_together = ('schedule', 'student', 'date') # One record per student per class per day

    def __str__(self):
        return f"{self.date} - {self.student} - {self.status}"