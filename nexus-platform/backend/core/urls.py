from django.urls import path
from .views import SchoolSettingsAPI, UserListCreateAPI, UserDeleteAPI

urlpatterns = [
    path('settings/', SchoolSettingsAPI.as_view()),
    path('users/', UserListCreateAPI.as_view()),
    path('users/<int:pk>/', UserDeleteAPI.as_view()),
]