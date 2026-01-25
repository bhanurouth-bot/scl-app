from rest_framework import viewsets
from .models import Subject, SubjectAllocation
from .serializers import SubjectSerializer, SubjectAllocationSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectAllocationViewSet(viewsets.ModelViewSet):
    queryset = SubjectAllocation.objects.all()
    serializer_class = SubjectAllocationSerializer