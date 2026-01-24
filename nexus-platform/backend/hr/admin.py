from django.contrib import admin
from .models import Employee, Department, Designation, LeaveRequest, SalarySlip, StaffAttendance

admin.site.register(Department)
admin.site.register(Designation)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_full_name', 'department', 'designation')
    list_filter = ('department', 'designation')
    search_fields = ('user__first_name', 'user__last_name', 'employee_id')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'status')
    list_filter = ('status', 'leave_type')

@admin.register(SalarySlip)
class SalarySlipAdmin(admin.ModelAdmin):
    # FIXED: Replaced 'month' with 'start_date' and 'end_date'
    list_display = ('employee', 'start_date', 'end_date', 'net_salary', 'is_paid')
    list_filter = ('start_date', 'is_paid')

@admin.register(StaffAttendance)
class StaffAttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status')
    list_filter = ('date', 'status')