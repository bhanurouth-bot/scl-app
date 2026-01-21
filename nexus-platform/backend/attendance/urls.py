from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceSessionViewSet, StudentAttendanceViewSet

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet)
router.register(r'records', StudentAttendanceViewSet, basename='attendance-records') # <--- NEW

urlpatterns = [
    path('', include(router.urls)),
]