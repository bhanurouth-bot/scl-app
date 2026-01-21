from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceBulkUpdateSerializer, AttendanceRecordSerializer
from core.models import Classroom
from students.models import Student

class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all().order_by('-date')
    serializer_class = AttendanceSessionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        date = self.request.query_params.get('date')
        
        if classroom:
            queryset = queryset.filter(classroom_id=classroom)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset

    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        """
        Custom Endpoint to mark attendance for a whole class at once.
        """
        serializer = AttendanceBulkUpdateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            classroom_id = data['classroom']
            date = data['date']
            session_type = data['session_type']
            records = data['records']

            # 1. Find or Create the Session
            with transaction.atomic():
                session, created = AttendanceSession.objects.get_or_create(
                    classroom_id=classroom_id,
                    date=date,
                    session_type=session_type,
                    defaults={'taken_by': None} # You can link to request.user.employee if available
                )

                # 2. Update each Student Record
                updated_count = 0
                for record in records:
                    student_id = record.get('student_id')
                    status_val = record.get('status', 'PRESENT')
                    remarks = record.get('remarks', '')

                    AttendanceRecord.objects.update_or_create(
                        session=session,
                        student_id=student_id,
                        defaults={
                            'status': status_val,
                            'remarks': remarks
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

    def get_queryset(self):
        student_id = self.request.query_params.get('student')
        if student_id:
            return self.queryset.filter(student_id=student_id)
        return self.queryset.none() # Safety: Don't show all if no ID provided