from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

router = DefaultRouter()
router.register(r'profiles', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]