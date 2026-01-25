from rest_framework import viewsets, permissions, parsers
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch FKs
    queryset = Assignment.objects.select_related('classroom', 'subject', 'teacher', 'grader').all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)

    def perform_create(self, serializer):
        save_kwargs = {'teacher': self.request.user}
        if 'grader' not in self.request.data:
            save_kwargs['grader'] = self.request.user
        serializer.save(**save_kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        if classroom:
            qs = qs.filter(classroom_id=classroom)
        return qs

class SubmissionViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch Assignment and Student
    queryset = Submission.objects.select_related('assignment', 'assignment__subject', 'student', 'student__user').all()
    serializer_class = SubmissionSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        qs = super().get_queryset()
        assignment = self.request.query_params.get('assignment')
        if assignment:
            qs = qs.filter(assignment_id=assignment)
        return qs