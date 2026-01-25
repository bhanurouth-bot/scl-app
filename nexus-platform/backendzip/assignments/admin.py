from django.contrib import admin
from .models import Assignment, Submission

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'classroom', 'subject', 'teacher', 'due_date', 'total_marks')
    list_filter = ('classroom', 'subject', 'teacher')
    search_fields = ('title', 'description')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    # CHANGED: 'grade' -> 'marks_obtained'
    list_display = ('student', 'assignment', 'submitted_at', 'marks_obtained') 
    list_filter = ('assignment__classroom', 'assignment__subject')
    search_fields = ('student__user__first_name', 'student__student_id', 'assignment__title')