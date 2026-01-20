from rest_framework import serializers
from .models import Exam, MarkEntry, GradeRule

class GradeRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeRule
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class MarkEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    
    # New Fields for UI
    subject_theory_max = serializers.IntegerField(source='subject.total_theory_marks', read_only=True)
    subject_practical_max = serializers.IntegerField(source='subject.total_practical_marks', read_only=True)

    class Meta:
        model = MarkEntry
        fields = [
            'id', 'exam', 'exam_name', 'student', 'subject', 
            'subject_name', 'subject_code', 
            'theory_score', 'practical_score', 'total_score', 'is_pass',
            'subject_theory_max', 'subject_practical_max'
        ]