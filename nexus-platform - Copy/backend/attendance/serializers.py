from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord
from students.serializers import StudentSerializer

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'student', 'student_name', 'student_roll', 'status', 'remarks']

class AttendanceSessionSerializer(serializers.ModelSerializer):
    records = AttendanceRecordSerializer(many=True, read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    taken_by_name = serializers.CharField(source='taken_by.user.get_full_name', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'classroom', 'classroom_name', 'date', 'session_type', 'taken_by', 'taken_by_name', 'records', 'created_at']

class AttendanceBulkUpdateSerializer(serializers.Serializer):
    """
    Serializer to handle the bulk creation/update of attendance records.
    Input: { "classroom": 1, "date": "2023-10-27", "students": [ { "id": 101, "status": "PRESENT" } ] }
    """
    classroom = serializers.IntegerField()
    date = serializers.DateField()
    session_type = serializers.CharField(default='MORNING')
    
    # List of student updates: [{ student_id: 1, status: 'PRESENT' }, ...]
    records = serializers.ListField(
        child=serializers.DictField()
    )