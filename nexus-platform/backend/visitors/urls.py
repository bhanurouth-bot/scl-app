from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]