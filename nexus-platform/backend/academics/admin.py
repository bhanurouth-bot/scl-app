from django.contrib import admin
from .models import Subject, SubjectAllocation

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'subject_type')

@admin.register(SubjectAllocation)
class SubjectAllocationAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'subject', 'teacher', 'academic_year')
    list_filter = ('classroom', 'subject')