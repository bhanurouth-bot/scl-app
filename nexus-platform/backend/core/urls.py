from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SchoolSettingsViewSet, AcademicYearViewSet, ClassroomViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'settings', SchoolSettingsViewSet)
router.register(r'years', AcademicYearViewSet)
router.register(r'classrooms', ClassroomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]