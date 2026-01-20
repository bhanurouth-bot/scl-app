from django.db import models
from students.models import Student # We might link to Grade/Section later

class Room(models.Model):
    name = models.CharField(max_length=50) # e.g., "Lab A", "101"
    capacity = models.IntegerField(default=30)
    has_projector = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Teacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=20, unique=True)
    specialization = models.CharField(max_length=100) # e.g., "Physics"
    
    # Simple Availability (Optional for now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Subject(models.Model):
    name = models.CharField(max_length=100) 
    code = models.CharField(max_length=20, unique=True)
    
    # NEW: Grading Schema
    total_theory_marks = models.IntegerField(default=100)
    total_practical_marks = models.IntegerField(default=0) # 0 means no practical
    
    pass_theory_marks = models.IntegerField(default=33)
    pass_practical_marks = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ScheduleItem(models.Model):
    DAYS = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]

    # Who, What, Where, When?
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True)
    
    # Which Class? (We store this as text for now, e.g., "10-A")
    grade = models.CharField(max_length=10) 
    section = models.CharField(max_length=5)

    day_of_week = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.day_of_week} {self.start_time} - {self.subject} ({self.room})"