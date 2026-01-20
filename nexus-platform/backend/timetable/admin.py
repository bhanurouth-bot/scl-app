from django.contrib import admin
from .models import TimeSlot, TimetableEntry

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time')

@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    # Updated list_display to use 'classroom' instead of grade/section
    list_display = ('classroom', 'day', 'subject', 'time_slot', 'teacher', 'room_number')
    list_filter = ('day', 'classroom')