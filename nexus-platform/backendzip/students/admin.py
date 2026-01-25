from django.contrib import admin
from .models import Student, StudentHealth, StudentPreviousEducation, StudentDocument

class StudentHealthInline(admin.StackedInline):
    model = StudentHealth
    can_delete = False
    verbose_name_plural = 'Medical Profile'

class StudentEducationInline(admin.TabularInline):
    model = StudentPreviousEducation
    extra = 0

class StudentDocumentInline(admin.TabularInline):
    model = StudentDocument
    extra = 0

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'classroom', 'guardian_name', 'guardian_phone')
    search_fields = ('student_id', 'user__first_name', 'user__last_name', 'guardian_name')
    # FIX: Changed 'admission_year' to 'admission_date'
    list_filter = ('classroom', 'gender', 'admission_date') 
    
    inlines = [StudentHealthInline, StudentEducationInline, StudentDocumentInline]

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'