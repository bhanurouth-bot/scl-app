from django.urls import path
from .views import TimeSlotListCreateAPI, TimetableListCreateAPI

urlpatterns = [
    path('slots/', TimeSlotListCreateAPI.as_view()),
    path('entries/', TimetableListCreateAPI.as_view()),
]