from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceSessionViewSet

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]