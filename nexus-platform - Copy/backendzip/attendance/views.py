from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceBulkUpdateSerializer, AttendanceRecordSerializer
from hr.models import Employee

class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all().order_by('-date')
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        date = self.request.query_params.get('date')
        session_type = self.request.query_params.get('session_type')
        
        if classroom:
            queryset = queryset.filter(classroom_id=classroom)
        if date:
            queryset = queryset.filter(date=date)
        if session_type:
            queryset = queryset.filter(session_type=session_type)
            
        return queryset

    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        serializer = AttendanceBulkUpdateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            classroom_id = data['classroom']
            date = data['date']
            session_type = data['session_type']
            records = data['records']

            employee = None
            if hasattr(request.user, 'employee_profile'):
                employee = request.user.employee_profile

            with transaction.atomic():
                session, created = AttendanceSession.objects.get_or_create(
                    classroom_id=classroom_id,
                    date=date,
                    session_type=session_type,
                    defaults={'taken_by': employee}
                )

                if not session.taken_by and employee:
                    session.taken_by = employee
                    session.save()

                updated_count = 0
                for record in records:
                    AttendanceRecord.objects.update_or_create(
                        session=session,
                        student_id=record['student_id'],
                        defaults={
                            'status': record.get('status', 'PRESENT'),
                            'remarks': record.get('remarks', '')
                        }
                    )
                    updated_count += 1

            return Response({
                "message": f"Attendance marked for {updated_count} students.",
                "session_id": session.id
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttendanceRecordSerializer
    queryset = AttendanceRecord.objects.all().order_by('-session__date')
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student')
        if student_id:
            return self.queryset.filter(student_id=student_id)
        return self.queryset.none()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        student_id = request.query_params.get('student')
        if not student_id:
            return Response({"error": "Student ID required"}, status=400)

        total = AttendanceRecord.objects.filter(student_id=student_id).count()
        present = AttendanceRecord.objects.filter(
            student_id=student_id, 
            status__in=['PRESENT', 'LATE', 'HALF_DAY']
        ).count()
        
        pct = round((present / total * 100), 1) if total > 0 else 0.0
        
        return Response({
            "total_sessions": total,
            "present_sessions": present,
            "percentage": pct
        })
    
class StudentAttendanceStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, student_id):
        # 1. Basic Counts
        total = AttendanceRecord.objects.filter(student_id=student_id).count()
        present = AttendanceRecord.objects.filter(
            student_id=student_id, 
            status__in=['PRESENT', 'LATE', 'HALF_DAY']
        ).count()
        
        percentage = round((present / total * 100), 1) if total > 0 else 0.0

        # 2. Recent History
        history_qs = AttendanceRecord.objects.filter(student_id=student_id).order_by('-session__date')[:5]
        history = [{"date": rec.session.date, "status": rec.status} for rec in history_qs]

        # 3. Calendar Data for Heatmap
        # Returns: {'2023-10-01': 'PRESENT', '2023-10-02': 'ABSENT'}
        all_records = AttendanceRecord.objects.filter(student_id=student_id).select_related('session')
        calendar_data = {str(rec.session.date): rec.status for rec in all_records}

        return Response({
            "total_sessions": total,
            "present_sessions": present,
            "percentage": percentage,
            "history": history,
            "calendar": calendar_data # <--- NEW FIELD
        })