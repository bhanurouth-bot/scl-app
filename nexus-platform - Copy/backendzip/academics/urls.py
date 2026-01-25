from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, SubjectAllocationViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet)
router.register(r'allocations', SubjectAllocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]