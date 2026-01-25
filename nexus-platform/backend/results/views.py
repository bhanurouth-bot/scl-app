from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Avg
from .models import Exam, Result, ExamPaper, ReportCard
from .serializers import ExamSerializer, ResultSerializer, ExamPaperSerializer, ReportCardSerializer
from attendance.models import AttendanceRecord

class ResultViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Student, Exam, Subject
    queryset = Result.objects.select_related('student', 'student__user', 'exam', 'subject').all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        student = self.request.query_params.get('student')
        exam = self.request.query_params.get('exam')
        if student: qs = qs.filter(student_id=student)
        if exam: qs = qs.filter(exam_id=exam)
        return qs

    @action(detail=False, methods=['post'])
    def bulk_entry(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected a list"}, status=400)

        affected_pairs = set() 
        with transaction.atomic():
            for item in data:
                Result.objects.update_or_create(
                    student_id=item['student'],
                    exam_id=item['exam'],
                    subject_id=item['subject'],
                    defaults={
                        'marks_obtained': item['marks_obtained'],
                        'total_marks': item.get('total_marks', 100)
                    }
                )
                affected_pairs.add((item['student'], item['exam']))

            for student_id, exam_id in affected_pairs:
                self._update_report_card(student_id, exam_id)

        return Response({"status": "success", "message": "Grades saved & Report Cards updated"})

    def _update_report_card(self, student_id, exam_id):
        results = Result.objects.filter(student_id=student_id, exam_id=exam_id)
        total_obtained = results.aggregate(Sum('marks_obtained'))['marks_obtained__sum'] or 0
        total_max = results.aggregate(Sum('total_marks'))['total_marks__sum'] or 0
        
        avg_score = 0
        if total_max > 0:
            avg_score = (float(total_obtained) / float(total_max)) * 100

        total_sess = AttendanceRecord.objects.filter(student_id=student_id).count()
        present_sess = AttendanceRecord.objects.filter(student_id=student_id, status__in=['PRESENT', 'LATE']).count()
        att_pct = (present_sess / total_sess * 100) if total_sess > 0 else 0

        ReportCard.objects.update_or_create(
            student_id=student_id,
            exam_id=exam_id,
            defaults={
                'average_score': avg_score,
                'attendance_percentage': att_pct,
                'remarks': "Promoted" if avg_score >= 40 else "Needs Improvement"
            }
        )

class ExamViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Batch and Class
    queryset = Exam.objects.select_related('batch', 'classroom').all().order_by('-start_date')
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """ Returns average score per exam for the Dashboard Chart. """
        data = []
        exams = Exam.objects.filter(is_active=True).order_by('start_date')[:5]
        for exam in exams:
            avg = exam.result_set.aggregate(Avg('marks_obtained'))['marks_obtained__avg']
            if avg is not None:
                data.append({"name": exam.name, "average": round(avg, 1)})
        return Response(data)

class ExamPaperViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Exam and Subject
    queryset = ExamPaper.objects.select_related('exam', 'subject').all()
    serializer_class = ExamPaperSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReportCardViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Student and Exam
    queryset = ReportCard.objects.select_related('student', 'student__user', 'exam').all().order_by('-generated_at')
    serializer_class = ReportCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        student = self.request.query_params.get('student')
        if student: qs = qs.filter(student_id=student)
        return qs