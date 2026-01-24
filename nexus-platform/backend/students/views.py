from rest_framework import viewsets, parsers
from .models import Student, StudentDocument # <--- Import StudentDocument
from .serializers import StudentSerializer, StudentRegistrationSerializer, StudentUpdateSerializer, StudentDocumentSerializer # <--- Import Document Serializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        qs = Student.objects.all()
        classroom = self.request.query_params.get('classroom')
        if classroom:
            qs = qs.filter(classroom_id=classroom)
        return qs

# --- NEW: DOCUMENT UPLOAD VIEW ---
class StudentDocumentViewSet(viewsets.ModelViewSet):
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser) # Required for file upload

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs