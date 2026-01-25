from django.urls import path
from .views import HealthRecordListCreateAPI, ClinicVisitListCreateAPI

urlpatterns = [
    path('records/', HealthRecordListCreateAPI.as_view()),
    path('visits/', ClinicVisitListCreateAPI.as_view()),
]