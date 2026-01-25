from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IDCardViewSet

router = DefaultRouter()
router.register(r'logs', IDCardViewSet)

urlpatterns = [
    path('', include(router.urls)),
]