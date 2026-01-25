from rest_framework import viewsets, parsers, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Student, StudentDocument
from .serializers import (
    StudentSerializer, 
    StudentRegistrationSerializer, 
    StudentUpdateSerializer, 
    StudentDocumentSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows students to be viewed, created, or edited.
    Supports advanced filtering, searching, and ordering.
    """
    queryset = Student.objects.all().order_by('-admission_date')
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    # --- ENHANCEMENT: Search & Filter Engines ---
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # 1. Exact Filters: /api/students/profiles/?classroom=1&gender=Male
    filterset_fields = ['classroom', 'gender', 'blood_group', 'city']
    
    # 2. Fuzzy Search: /api/students/profiles/?search=John
    # Searches across ID, Name, and Guardian details
    search_fields = [
        'student_id', 
        'user__first_name', 
        'user__last_name', 
        'user__email',
        'guardian_name', 
        'guardian_phone'
    ]
    
    # 3. Ordering: /api/students/profiles/?ordering=user__first_name
    ordering_fields = ['student_id', 'admission_date', 'user__first_name', 'user__last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned students to a given classroom,
        by filtering against a `classroom` query parameter in the URL.
        """
        qs = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        if classroom:
            qs = qs.filter(classroom_id=classroom)
        return qs

class StudentDocumentViewSet(viewsets.ModelViewSet):
    queryset = StudentDocument.objects.all()
    serializer_class = StudentDocumentSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs