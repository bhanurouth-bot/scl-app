from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Employee, LeaveRequest, SalarySlip
from .serializers import EmployeeSerializer, LeaveRequestSerializer, SalarySlipSerializer
from datetime import date

# 1. Employee Management
class EmployeeListCreateAPI(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

# 2. Leave Management
class LeaveListCreateAPI(generics.ListCreateAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin sees all, Staff sees only theirs
        if self.request.user.is_staff: 
            return LeaveRequest.objects.all().order_by('-start_date')
        try:
            return LeaveRequest.objects.filter(employee__user=self.request.user).order_by('-start_date')
        except:
            return LeaveRequest.objects.none()

    def perform_create(self, serializer):
        employee = Employee.objects.get(user=self.request.user)
        serializer.save(employee=employee)

class ApproveLeaveAPI(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        leave = LeaveRequest.objects.get(pk=pk)
        leave.status = request.data.get('status') # 'APPROVED' or 'REJECTED'
        leave.save()
        return Response({"message": "Leave Status Updated"})

# 3. Payroll Engine
class GeneratePayrollAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Simple Logic: Generate slips for ALL active employees for the current month
        # In a real app, we would calculate deductions based on Unpaid Leaves
        
        current_month = date.today().replace(day=1)
        created_count = 0

        with transaction.atomic():
            employees = Employee.objects.all()
            for emp in employees:
                # Check if slip exists
                if not SalarySlip.objects.filter(employee=emp, month=current_month).exists():
                    # Calculate deductions (Mock logic: 0 for now)
                    deduction = 0
                    net = emp.basic_salary - deduction
                    
                    SalarySlip.objects.create(
                        employee=emp,
                        month=current_month,
                        base_amount=emp.basic_salary,
                        deductions=deduction,
                        net_salary=net
                    )
                    created_count += 1
        
        return Response({"message": f"Generated {created_count} Salary Slips for {current_month.strftime('%B %Y')}"})

class SalaryListAPI(generics.ListAPIView):
    queryset = SalarySlip.objects.all().order_by('-month')
    serializer_class = SalarySlipSerializer
    permission_classes = [IsAuthenticated]