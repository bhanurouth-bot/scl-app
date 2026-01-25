from rest_framework import serializers
from django.db.models import Sum
from .models import Exam, Result, ExamPaper, ReportCard
from core.models import Classroom

class ExamPaperSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class Meta:
        model = ExamPaper
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    classroom_names = serializers.StringRelatedField(source='classrooms', many=True, read_only=True)
    # This 'papers' field is what makes them show up in the Schedule list
    papers = ExamPaperSerializer(many=True, read_only=True) 
    class Meta:
        model = Exam
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class Meta:
        model = Result
        fields = '__all__'

# --- UPDATED REPORT CARD SERIALIZER ---
class ReportCardSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    published_date = serializers.DateField(source='generated_at', read_only=True)
    
    # Custom fields for the Frontend Profile
    grade = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = ReportCard
        fields = ['id', 'exam', 'exam_name', 'published_date', 'remarks', 'conduct', 'attendance_percentage', 'grade', 'percentage', 'subjects']

    def get_percentage(self, obj):
        # Calculate percentage dynamically from the Results
        results = Result.objects.filter(student=obj.student, exam=obj.exam)
        total_obtained = results.aggregate(Sum('marks_obtained'))['marks_obtained__sum'] or 0
        total_max = results.aggregate(Sum('total_marks'))['total_marks__sum'] or 0
        
        if total_max > 0:
            return round((float(total_obtained) / float(total_max)) * 100, 1)
        return 0.0

    def get_grade(self, obj):
        percent = self.get_percentage(obj)
        if percent >= 90: return 'A+'
        if percent >= 80: return 'A'
        if percent >= 70: return 'B'
        if percent >= 60: return 'C'
        if percent >= 50: return 'D'
        return 'F'

    def get_subjects(self, obj):
        # Send the breakdown of marks for each subject
        results = Result.objects.filter(student=obj.student, exam=obj.exam)
        return [
            {
                "subject_name": r.subject.name,
                "marks_obtained": r.marks_obtained,
                "total_marks": r.total_marks,
                "grade": r.grade
            }
            for r in results
        ]