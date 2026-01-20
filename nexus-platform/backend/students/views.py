from rest_framework import viewsets, parsers
from .models import Student
from .serializers import StudentSerializer, StudentRegistrationSerializer, StudentUpdateSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    # Support Multipart for Image Uploads
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer