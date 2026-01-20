from rest_framework import serializers
from .models import Room, Teacher, Subject, ScheduleItem

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)

    class Meta:
        model = ScheduleItem
        fields = ['id', 'subject', 'subject_name', 'teacher', 'teacher_name', 'room', 'room_name', 'grade', 'section', 'day_of_week', 'start_time', 'end_time']