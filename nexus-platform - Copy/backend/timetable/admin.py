from django.contrib import admin
from .models import TimetableSlot

@admin.register(TimetableSlot)
class TimetableSlotAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'day_of_week', 'start_time', 'end_time', 'subject', 'teacher')
    list_filter = ('day_of_week', 'classroom', 'teacher')
    search_fields = ('classroom__grade_level', 'subject__name', 'teacher__user__first_name')