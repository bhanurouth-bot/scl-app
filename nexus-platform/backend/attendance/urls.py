from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceSessionViewSet, StudentAttendanceViewSet, StudentAttendanceStatsView

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet)
router.register(r'records', StudentAttendanceViewSet, basename='attendance-records')

urlpatterns = [
    path('', include(router.urls)),
    # Add this line to match the Frontend request:
    path('stats/<int:student_id>/', StudentAttendanceStatsView.as_view(), name='student-attendance-stats'),
]