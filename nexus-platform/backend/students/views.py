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
    # OPTIMIZATION: Join User and Classroom tables to prevent N+1 queries
    queryset = Student.objects.select_related(
        'user', 
        'classroom', 
        'classroom__academic_year'
    ).all().order_by('-admission_date')
    
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['classroom', 'gender', 'blood_group', 'city']
    
    search_fields = [
        'student_id', 
        'user__first_name', 
        'user__last_name', 
        'user__email',
        'guardian_name', 
        'guardian_phone'
    ]
    
    ordering_fields = ['student_id', 'admission_date', 'user__first_name', 'user__last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned students to a given classroom.
        """
        # We use the optimized queryset defined above
        qs = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        if classroom:
            qs = qs.filter(classroom_id=classroom)
        return qs

class StudentDocumentViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch Student and their User info
    queryset = StudentDocument.objects.select_related('student', 'student__user').all()
    serializer_class = StudentDocumentSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs