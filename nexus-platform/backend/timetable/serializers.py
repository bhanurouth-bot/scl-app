from rest_framework import serializers
from .models import TimetableSlot  # <--- Updated Import
from academics.serializers import SubjectSerializer
from hr.serializers import EmployeeSerializer

class TimetableSlotSerializer(serializers.ModelSerializer):
    # Nested data for easier frontend display
    subject_details = SubjectSerializer(source='subject', read_only=True)
    teacher_details = EmployeeSerializer(source='teacher', read_only=True)

    class Meta:
        model = TimetableSlot
        fields = '__all__'

    def validate(self, data):
        # CUSTOM CONFLICT DETECTION
        teacher = data.get('teacher')
        day = data.get('day_of_week')
        start = data.get('start_time')
        
        # Check if teacher is busy elsewhere (excluding self for updates)
        if teacher:
            busy = TimetableSlot.objects.filter(
                teacher=teacher, 
                day_of_week=day, 
                start_time=start
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if busy.exists():
                conflict = busy.first()
                raise serializers.ValidationError(
                    f"Conflict! {teacher.user.get_full_name()} is already teaching in Grade {conflict.classroom.grade_level}-{conflict.classroom.section} at this time."
                )
        return data