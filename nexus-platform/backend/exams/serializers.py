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
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'

class StudentResultSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    
    class Meta:
        model = StudentResult
        fields = '__all__'

class BulkExamMarksSerializer(serializers.Serializer):
    """
    Accepts: { "exam_id": 1, "marks": [ { "student_id": 101, "score": 85, "is_absent": false } ] }
    """
    exam_id = serializers.IntegerField()
    marks = serializers.ListField(child=serializers.DictField())