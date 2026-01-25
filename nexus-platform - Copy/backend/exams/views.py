from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import ExamBatch, Exam, StudentResult, GradeScale
from .serializers import (
    ExamBatchSerializer, ExamSerializer, 
    StudentResultSerializer, GradeScaleSerializer, BulkExamMarksSerializer
)

class GradeScaleViewSet(viewsets.ModelViewSet):
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer

class ExamBatchViewSet(viewsets.ModelViewSet):
    queryset = ExamBatch.objects.all().order_by('-start_date')
    serializer_class = ExamBatchSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    
    def get_queryset(self):
        # Allow filtering exams by Batch or Class
        qs = super().get_queryset()
        batch_id = self.request.query_params.get('batch')
        classroom_id = self.request.query_params.get('classroom')
        
        if batch_id:
            qs = qs.filter(batch_id=batch_id)
        if classroom_id:
            qs = qs.filter(classroom_id=classroom_id)
        return qs

    @action(detail=False, methods=['post'])
    def bulk_entry(self, request):
        """
        Takes a list of marks and saves them for a specific Exam Paper.
        """
        serializer = BulkExamMarksSerializer(data=request.data)
        if serializer.is_valid():
            exam_id = serializer.validated_data['exam_id']
            marks_list = serializer.validated_data['marks']
            
            try:
                exam = Exam.objects.get(id=exam_id)
            except Exam.DoesNotExist:
                return Response({"error": "Exam not found"}, status=404)

            updated_count = 0
            
            with transaction.atomic():
                for item in marks_list:
                    StudentResult.objects.update_or_create(
                        exam=exam,
                        student_id=item['student_id'],
                        defaults={
                            'marks_obtained': item.get('score', 0),
                            'is_absent': item.get('is_absent', False),
                            'remarks': item.get('remarks', '')
                        }
                    )
                    updated_count += 1
            
            return Response({"message": f"Updated marks for {updated_count} students"})
        
        return Response(serializer.errors, status=400)

class StudentResultViewSet(viewsets.ModelViewSet):
    queryset = StudentResult.objects.all()
    serializer_class = StudentResultSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        exam_id = self.request.query_params.get('exam')
        student_id = self.request.query_params.get('student')
        
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs