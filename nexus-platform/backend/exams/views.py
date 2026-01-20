from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Exam, GradeRule, MarkEntry
from .serializers import ExamSerializer, GradeRuleSerializer, MarkEntrySerializer

class GradeRuleListAPI(generics.ListCreateAPIView):
    queryset = GradeRule.objects.all().order_by('-min_score')
    serializer_class = GradeRuleSerializer
    permission_classes = [IsAuthenticated]
    
# 1. Manage Exams (Create "Mid-Term", "Finals")
class ExamListCreateAPI(generics.ListCreateAPIView):
    queryset = Exam.objects.filter(is_active=True).order_by('-start_date')
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

# 2. Bulk Grade Entry (The "Matrix" Saver)
class BulkGradeEntryAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Payload: { exam_id, subject_id, grades: [{student_id, theory, practical}] }
        exam_id = request.data.get('exam_id')
        subject_id = request.data.get('subject_id')
        grades = request.data.get('grades', [])

        with transaction.atomic():
            for item in grades:
                MarkEntry.objects.update_or_create(
                    exam_id=exam_id,
                    subject_id=subject_id,
                    student_id=item['student_id'],
                    defaults={
                        'theory_score': item.get('theory', 0),
                        'practical_score': item.get('practical', 0)
                    }
                )
        return Response({"message": "Grades Saved"})

# 3. Student Analytics (The "Radar Chart" Data)
class StudentPerformanceAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        # Fetch all marks for this student
        marks = MarkEntry.objects.filter(student_id=student_id).select_related('exam', 'subject')
        serializer = MarkEntrySerializer(marks, many=True)
        return Response(serializer.data)