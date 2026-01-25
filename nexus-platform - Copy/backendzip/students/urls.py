from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentDocumentViewSet # <--- Import it

router = DefaultRouter()
router.register(r'profiles', StudentViewSet)
router.register(r'documents', StudentDocumentViewSet) # <--- Add this line

urlpatterns = [
    path('', include(router.urls)),
]