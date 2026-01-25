from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BookIssueViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'issues', BookIssueViewSet)

urlpatterns = [
    path('', include(router.urls)),
]