from django.contrib import admin
from .models import Employee, Department, Designation, LeaveRequest, SalarySlip

admin.site.register(Department)
admin.site.register(Designation)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_full_name', 'department', 'designation')
    list_filter = ('department', 'designation')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'status')
    list_filter = ('status', 'leave_type')

@admin.register(SalarySlip)
class SalarySlipAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'net_salary', 'is_paid')