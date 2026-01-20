from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'classroom', 'roll_number')
    search_fields = ('student_id', 'user__first_name', 'user__last_name')
    list_filter = ('classroom', 'admission_year')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'