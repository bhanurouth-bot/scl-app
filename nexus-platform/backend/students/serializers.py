from rest_framework import serializers
from .models import Student
from finance.serializers import TransactionSerializer
from attendance.models import AttendanceLog # <--- Import this

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        # I added 'roll_number' to this list
        fields = ['id', 'first_name', 'last_name', 'student_id', 'grade', 'section', 'roll_number', 'fees_due']

class StudentDetailSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    attendance_stats = serializers.SerializerMethodField() # <--- New Field

    class Meta:
        model = Student
        fields = ['id', 'first_name', 'last_name', 'student_id', 'grade', 'section', 'roll_number', 'fees_due', 'transactions', 'attendance_stats']

    def get_attendance_stats(self, obj):
        total_classes = AttendanceLog.objects.filter(student=obj).count()
        if total_classes == 0:
            return {"present": 0, "absent": 0, "percentage": 100} # Default to 100% if new
        
        present_count = AttendanceLog.objects.filter(student=obj, status='PRESENT').count()
        absent_count = total_classes - present_count
        percentage = round((present_count / total_classes) * 100, 1)
        
        return {
            "present": present_count,
            "absent": absent_count,
            "percentage": percentage
        }