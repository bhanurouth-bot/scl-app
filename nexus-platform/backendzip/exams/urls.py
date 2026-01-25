from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamBatchViewSet, ExamViewSet, StudentResultViewSet, GradeScaleViewSet

router = DefaultRouter()
router.register(r'batches', ExamBatchViewSet)
router.register(r'papers', ExamViewSet)
router.register(r'results', StudentResultViewSet)
router.register(r'gradescales', GradeScaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]