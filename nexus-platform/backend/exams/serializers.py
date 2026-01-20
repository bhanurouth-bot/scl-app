from rest_framework import serializers
from .models import ExamBatch, Exam, StudentResult, GradeScale, GradeRule
from students.serializers import StudentSerializer

class GradeRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRule
        fields = '__all__'

class GradeScaleSerializer(serializers.ModelSerializer):
    rules = GradeRuleSerializer(many=True, read_only=True)
    class Meta:
        model = GradeScale
        fields = '__all__'

class ExamBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamBatch
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class StudentResultSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    
    class Meta:
        model = StudentResult
        fields = '__all__'