from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SchoolSettings, AcademicYear, Classroom

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type', 'avatar', 'phone_number')}),
    )

@admin.register(SchoolSettings)
class SchoolSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Prevent creating more than 1 settings object
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_current')

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('grade_level', 'section', 'academic_year')
    list_filter = ('academic_year',)