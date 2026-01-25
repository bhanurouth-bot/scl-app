from rest_framework import viewsets
from .models import Subject, SubjectAllocation
from .serializers import SubjectSerializer, SubjectAllocationSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectAllocationViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch ALL related foreign keys in one go.
    # 'teacher__user' allows us to display the Teacher's name without an extra query.
    queryset = SubjectAllocation.objects.select_related(
        'academic_year', 
        'classroom', 
        'subject', 
        'teacher', 
        'teacher__user'
    ).all()
    serializer_class = SubjectAllocationSerializer