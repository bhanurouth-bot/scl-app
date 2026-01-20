from rest_framework import viewsets
from .models import ExamBatch, Exam, StudentResult, GradeScale
from .serializers import (
    ExamBatchSerializer, ExamSerializer, 
    StudentResultSerializer, GradeScaleSerializer
)

class GradeScaleViewSet(viewsets.ModelViewSet):
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer

class ExamBatchViewSet(viewsets.ModelViewSet):
    queryset = ExamBatch.objects.all()
    serializer_class = ExamBatchSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class StudentResultViewSet(viewsets.ModelViewSet):
    queryset = StudentResult.objects.all()
    serializer_class = StudentResultSerializer