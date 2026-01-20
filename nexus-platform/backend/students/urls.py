from django.urls import path
from .views import StudentRetrieveAPI, StudentSearchAPI, StudentListCreateAPI

urlpatterns = [
    path('search/', StudentSearchAPI.as_view(), name='student-search'),
    path('', StudentListCreateAPI.as_view(), name='student-list-create'),
    path('<int:pk>/', StudentRetrieveAPI.as_view(), name='student-detail'), # <--- ADD THIS
]