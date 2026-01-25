from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import HealthRecord, ClinicVisit
from .serializers import HealthRecordSerializer, ClinicVisitSerializer

class HealthRecordListCreateAPI(generics.ListCreateAPIView):
    # OPTIMIZATION
    queryset = HealthRecord.objects.select_related('student', 'student__user').all()
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated]

class ClinicVisitListCreateAPI(generics.ListCreateAPIView):
    # OPTIMIZATION
    queryset = ClinicVisit.objects.select_related('student', 'student__user').all().order_by('-visit_date')
    serializer_class = ClinicVisitSerializer
    permission_classes = [IsAuthenticated]