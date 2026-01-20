from rest_framework import generics
from .models import TimeSlot, TimetableEntry
from .serializers import TimeSlotSerializer, TimetableEntrySerializer

class TimeSlotListCreateAPI(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer

class TimetableListCreateAPI(generics.ListCreateAPIView):
    queryset = TimetableEntry.objects.all()
    serializer_class = TimetableEntrySerializer

    def get_queryset(self):
        # Allow filtering by class, e.g. ?classroom=1
        queryset = super().get_queryset()
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        return queryset