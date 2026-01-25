from rest_framework import viewsets
from .models import User, SchoolSettings, AcademicYear, Classroom
from .serializers import (
    UserSerializer, SchoolSettingsSerializer, 
    AcademicYearSerializer, ClassroomSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SchoolSettingsViewSet(viewsets.ModelViewSet):
    queryset = SchoolSettings.objects.all()
    serializer_class = SchoolSettingsSerializer

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer