from django.urls import path
from .views import CertificateHistoryAPI, IssueCertificateAPI

urlpatterns = [
    path('history/', CertificateHistoryAPI.as_view()),
    path('issue/', IssueCertificateAPI.as_view()),
]