from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from students.models import Student
from academics.models import ScheduleItem
from .models import AttendanceLog
from .serializers import AttendanceSerializer

class ClassAttendanceAPI(APIView):
    def get(self, request, schedule_id):
        # 1. Get the Schedule details (to find which Class/Section it is)
        try:
            schedule = ScheduleItem.objects.get(id=schedule_id)
        except ScheduleItem.DoesNotExist:
            return Response({"error": "Class not found"}, status=404)

        target_date = request.query_params.get('date', timezone.now().date())

        # 2. Get ALL Students in that Grade/Section
        students = Student.objects.filter(grade=schedule.grade, section=schedule.section, is_active=True)

        # 3. Get existing attendance records for this date
        logs = AttendanceLog.objects.filter(schedule=schedule, date=target_date)
        log_map = {log.student_id: log.status for log in logs}

        # 4. Build the Response (Merge Students + Status)
        data = []
        for student in students:
            data.append({
                "student_id": student.id,
                "name": f"{student.first_name} {student.last_name}",
                "roll_number": student.roll_number,
                "status": log_map.get(student.id, "PRESENT") # Default to Present
            })
            
        return Response(data)

    def post(self, request, schedule_id):
        # Expects: { date: "2025-01-20", records: [{student_id: 1, status: "ABSENT"}, ...] }
        date = request.data.get('date', timezone.now().date())
        records = request.data.get('records', [])
        
        schedule = ScheduleItem.objects.get(id=schedule_id)

        created_logs = []
        for item in records:
            # Update or Create logic
            log, created = AttendanceLog.objects.update_or_create(
                schedule=schedule,
                student_id=item['student_id'],
                date=date,
                defaults={'status': item['status']}
            )
            created_logs.append(log)

        return Response({"message": "Attendance Saved", "count": len(created_logs)})