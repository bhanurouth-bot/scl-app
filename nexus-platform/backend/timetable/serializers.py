from rest_framework import serializers
from .models import TimeSlot, TimetableEntry

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class TimetableEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.first_name', read_only=True)
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    start_time = serializers.TimeField(source='time_slot.start_time', read_only=True)
    end_time = serializers.TimeField(source='time_slot.end_time', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = '__all__'