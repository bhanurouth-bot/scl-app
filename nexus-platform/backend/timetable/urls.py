from django.urls import path
from .views import TimeSlotListCreateAPI, TimetableAPI

urlpatterns = [
    path('slots/', TimeSlotListCreateAPI.as_view()),
    path('entries/', TimetableAPI.as_view()),
]