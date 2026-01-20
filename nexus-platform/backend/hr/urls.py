from django.urls import path
from .views import EmployeeListCreateAPI, LeaveListCreateAPI, ApproveLeaveAPI, GeneratePayrollAPI, SalaryListAPI

urlpatterns = [
    path('employees/', EmployeeListCreateAPI.as_view()),
    path('leaves/', LeaveListCreateAPI.as_view()),
    path('leaves/<int:pk>/status/', ApproveLeaveAPI.as_view()),
    path('payroll/generate/', GeneratePayrollAPI.as_view()),
    path('payroll/slips/', SalaryListAPI.as_view()),
]