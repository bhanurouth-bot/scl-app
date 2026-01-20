from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Room, Teacher, Subject, ScheduleItem
from .serializers import RoomSerializer, TeacherSerializer, SubjectSerializer, ScheduleSerializer

# Standard CRUD Views
class TeacherListCreateAPI(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class RoomListCreateAPI(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class SubjectListCreateAPI(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class ScheduleListCreateAPI(generics.ListCreateAPIView):
    queryset = ScheduleItem.objects.all().order_by('day_of_week', 'start_time')
    serializer_class = ScheduleSerializer

# THE KILLER FEATURE: Live Dashboard Feed
class LiveClassesAPI(APIView):
    def get(self, request):
        # 1. Get Current Time & Day
        now = timezone.localtime()
        current_time = now.time()
        
        # Python day (0=Mon, 6=Sun) to our Model codes
        day_map = {0: 'MON', 1: 'TUE', 2: 'WED', 3: 'THU', 4: 'FRI', 5: 'SAT', 6: 'SUN'}
        current_day = day_map.get(now.weekday(), 'MON')

        # 2. Find classes happening RIGHT NOW
        live_sessions = ScheduleItem.objects.filter(
            day_of_week=current_day,
            start_time__lte=current_time,
            end_time__gte=current_time
        ).select_related('teacher', 'subject', 'room')

        serializer = ScheduleSerializer(live_sessions, many=True)
        return Response(serializer.data)