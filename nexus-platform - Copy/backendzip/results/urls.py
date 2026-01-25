from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, ResultViewSet, ExamPaperViewSet, ReportCardViewSet

router = DefaultRouter()
router.register(r'exams', ExamViewSet)
router.register(r'papers', ExamPaperViewSet)
router.register(r'marks', ResultViewSet)
router.register(r'report-cards', ReportCardViewSet) # Match frontend 'report-cards'

urlpatterns = [
    path('', include(router.urls)),
]