from rest_framework import serializers
from .models import Assignment, Submission

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    
    class Meta:
        model = Submission
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.first_name', read_only=True)
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 
            'subject', 'subject_name', 
            'teacher_name', 'due_date', 
            'grade', 'section',  # <--- NEW FIELDS
            'created_at', 'submission_count'
        ]