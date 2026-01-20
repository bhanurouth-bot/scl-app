from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TimeSlot, TimetableEntry
from .serializers import TimeSlotSerializer, TimetableEntrySerializer

class TimeSlotListCreateAPI(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all().order_by('start_time')
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]

class TimetableAPI(generics.ListCreateAPIView):
    serializer_class = TimetableEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TimetableEntry.objects.all()
        
        # Filter by Grade/Section
        grade = self.request.query_params.get('grade')
        section = self.request.query_params.get('section')
        if grade and section:
            queryset = queryset.filter(grade=grade, section=section)
            
        # Filter by Teacher (My Schedule)
        teacher_id = self.request.query_params.get('teacher')
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
            
        return queryset.order_by('day', 'time_slot__start_time')