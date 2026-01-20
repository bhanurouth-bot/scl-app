from django.contrib import admin
from .models import GradeScale, GradeRule, ExamBatch, Exam, StudentResult

class GradeRuleInline(admin.TabularInline):
    model = GradeRule
    extra = 1

@admin.register(GradeScale)
class GradeScaleAdmin(admin.ModelAdmin):
    inlines = [GradeRuleInline]

@admin.register(ExamBatch)
class ExamBatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'academic_year', 'is_published')

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('subject', 'classroom', 'batch', 'date')
    list_filter = ('batch', 'classroom')

@admin.register(StudentResult)
class StudentResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'marks_obtained', 'grade')
    list_filter = ('exam__batch', 'exam__subject')