from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord

class AttendanceRecordInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'date', 'session_type', 'taken_by')
    list_filter = ('date', 'classroom')
    inlines = [AttendanceRecordInline]