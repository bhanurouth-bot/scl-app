from django.urls import path
from .views import ClassAttendanceAPI

urlpatterns = [
    path('class/<int:schedule_id>/', ClassAttendanceAPI.as_view()),
]