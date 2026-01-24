from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, DepartmentViewSet, DesignationViewSet,
    LeaveRequestViewSet, SalarySlipViewSet, StaffAttendanceViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'designations', DesignationViewSet)
router.register(r'leaves', LeaveRequestViewSet)
router.register(r'salary-slips', SalarySlipViewSet)
router.register(r'attendance', StaffAttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]