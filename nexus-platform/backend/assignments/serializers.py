from rest_framework import serializers
from .models import Assignment, Submission

class AssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    # Show names for display
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    grader_name = serializers.CharField(source='grader.get_full_name', read_only=True)
    
    submission_count = serializers.IntegerField(source='submissions.count', read_only=True)
    
    class Meta:
        model = Assignment
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    
    class Meta:
        model = Submission
        fields = '__all__'