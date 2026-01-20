from django.urls import path
from .views import NoticeListCreateAPI, NoticeDeleteAPI

urlpatterns = [
    path('', NoticeListCreateAPI.as_view()),
    path('<int:pk>/', NoticeDeleteAPI.as_view()),
]