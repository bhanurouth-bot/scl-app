from rest_framework import serializers
from .models import TimeSlot, TimetableEntry

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.first_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'classroom', 'classroom_name', 'day', 
            'time_slot', 'subject', 'subject_name', 
            'teacher', 'teacher_name', 'room_number'
        ]