from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import HealthRecord, ClinicVisit
from .serializers import HealthRecordSerializer, ClinicVisitSerializer

class HealthRecordListCreateAPI(generics.ListCreateAPIView):
    queryset = HealthRecord.objects.all()
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated]

class ClinicVisitListCreateAPI(generics.ListCreateAPIView):
    queryset = ClinicVisit.objects.all().order_by('-visit_date')
    serializer_class = ClinicVisitSerializer
    permission_classes = [IsAuthenticated]