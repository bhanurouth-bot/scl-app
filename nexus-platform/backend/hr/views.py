from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from datetime import datetime, timedelta
from .models import Employee, Department, Designation, LeaveRequest, SalarySlip, StaffAttendance
from .serializers import (
    EmployeeSerializer, EmployeeRegistrationSerializer, DepartmentSerializer,
    DesignationSerializer, LeaveRequestSerializer, SalarySlipSerializer,
    StaffAttendanceSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch User, Department, Designation and Subjects (M2M)
    queryset = Employee.objects.select_related(
        'user', 'department', 'designation'
    ).prefetch_related('subjects').all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeRegistrationSerializer
        return EmployeeSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch Employee and Approver details
    queryset = LeaveRequest.objects.select_related(
        'employee', 'employee__user', 'approved_by', 'approved_by__user'
    ).all().order_by('-applied_on')
    serializer_class = LeaveRequestSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'APPROVED'
        if hasattr(request.user, 'employee_profile'):
            leave.approved_by = request.user.employee_profile
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'REJECTED'
        leave.save()
        return Response({'status': 'rejected'})

class StaffAttendanceViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch Employee
    queryset = StaffAttendance.objects.select_related('employee', 'employee__user').all().order_by('-date')
    serializer_class = StaffAttendanceSerializer

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        date = request.data.get('date')
        attendance_list = request.data.get('attendance', [])
        if not date: return Response({"error": "Date required"}, status=400)

        with transaction.atomic():
            StaffAttendance.objects.filter(date=date).delete()
            serializer = self.get_serializer(data=[{**item, 'date': date} for item in attendance_list], many=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'marked', 'count': len(attendance_list)})
            return Response(serializer.errors, status=400)

class SalarySlipViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch Employee
    queryset = SalarySlip.objects.select_related('employee', 'employee__user').all().order_by('-end_date')
    serializer_class = SalarySlipSerializer

    @action(detail=False, methods=['post'])
    def generate_range(self, request):
        """ Smart Payroll Generation based on Attendance & Leaves """
        start_str = request.data.get('start_date')
        end_str = request.data.get('end_date')
        if not start_str or not end_str:
            return Response({"error": "Start and End dates required"}, status=400)

        try:
            start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)
        
        employees = Employee.objects.filter(is_active=True)
        generated_count = 0

        for emp in employees:
            # 1. Calculate Attendance Stats
            attendance_records = StaffAttendance.objects.filter(
                employee=emp, date__range=[start_date, end_date]
            )
            present_days = attendance_records.filter(status='PRESENT').count()
            half_days = attendance_records.filter(status='HALF_DAY').count()
            
            # 2. Calculate Approved Paid Leaves
            leave_records = LeaveRequest.objects.filter(
                employee=emp, status='APPROVED',
                leave_type__in=['PAID', 'SICK', 'CASUAL'], 
                start_date__gte=start_date, end_date__lte=end_date
            )
            leave_days_count = 0
            for leave in leave_records:
                duration = (leave.end_date - leave.start_date).days + 1
                leave_days_count += duration

            # 3. Final Calculation
            effective_worked_days = Decimal(present_days) + (Decimal("0.5") * Decimal(half_days)) + Decimal(leave_days_count)
            per_day_salary = emp.basic_salary / Decimal(30)
            earned_amount = per_day_salary * effective_worked_days
            
            SalarySlip.objects.filter(employee=emp, start_date=start_date, end_date=end_date).delete()

            SalarySlip.objects.create(
                employee=emp,
                start_date=start_date,
                end_date=end_date,
                total_days=(end_date - start_date).days + 1,
                present_days=Decimal(present_days) + (Decimal("0.5") * Decimal(half_days)),
                leave_days=Decimal(leave_days_count),
                absent_days=Decimal(0), 
                base_amount=emp.basic_salary,
                earned_amount=round(earned_amount, 2),
                net_salary=round(earned_amount, 2),
                is_paid=False
            )
            generated_count += 1

        return Response({"message": f"Generated payroll for {generated_count} staff."})