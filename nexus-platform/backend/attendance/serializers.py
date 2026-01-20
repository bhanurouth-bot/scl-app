from rest_framework import serializers
from .models import AttendanceLog

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    
    class Meta:
        model = AttendanceLog
        fields = ['id', 'schedule', 'student', 'student_name', 'date', 'status']