from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from students.models import Student # <--- Ensure this is imported

class AssignmentListCreateAPI(generics.ListCreateAPIView):
    # ... (Keep this class exactly as it was) ...
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Assignment.objects.all().order_by('-created_at')
        grade_param = self.request.query_params.get('grade')
        section_param = self.request.query_params.get('section')
        
        if grade_param:
            grades = [g.strip() for g in grade_param.split(',')]
            grade_query = Q()
            for g in grades:
                grade_query |= Q(grade__icontains=g)
            queryset = queryset.filter(grade_query)
        
        if section_param:
            sections = [s.strip() for s in section_param.split(',')]
            section_query = Q()
            for s in sections:
                section_query |= Q(section__icontains=s)
            queryset = queryset.filter(section_query)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

# === THIS IS THE FIX ===
class SubmitAssignmentAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # 1. Get the String ID from Frontend (e.g. "STD-2026-001")
            student_str_id = request.data.get('student_id')
            
            # 2. Find the actual Student Object
            student = Student.objects.get(student_id=student_str_id)

            # 3. Create Submission using the Student Object
            Submission.objects.create(
                assignment_id=request.data['assignment_id'],
                student=student, # <--- Pass the object, not the string
                content=request.data['content']
            )
            return Response({"message": "Assignment Submitted!"}, status=201)

        except Student.DoesNotExist:
            return Response({"error": f"Student ID '{request.data.get('student_id')}' not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

# ... (Keep the rest of the file same) ...
class AssignmentSubmissionsAPI(generics.ListAPIView):
    # ... code ...
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        assignment_id = self.kwargs['pk']
        return Submission.objects.filter(assignment_id=assignment_id).select_related('student')

class GradeSubmissionAPI(APIView):
    # ... code ...
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            submission = Submission.objects.get(pk=pk)
            submission.grade = request.data.get('grade')
            submission.feedback = request.data.get('feedback')
            submission.save()
            return Response({"message": "Grade Saved!"})
        except Submission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=404)