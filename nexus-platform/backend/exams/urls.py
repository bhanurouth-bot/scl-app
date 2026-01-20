from django.urls import path
from .views import ExamListCreateAPI, BulkGradeEntryAPI, StudentPerformanceAPI, GradeRuleListAPI

urlpatterns = [
    path('', ExamListCreateAPI.as_view()),
    path('bulk-entry/', BulkGradeEntryAPI.as_view()),
    path('student/<int:student_id>/', StudentPerformanceAPI.as_view()),
    path('rules/', GradeRuleListAPI.as_view()), # <--- New Endpoint
]