from django.urls import path
from .views import VisitorListCreateAPI, CheckOutVisitorAPI

urlpatterns = [
    path('', VisitorListCreateAPI.as_view()),
    path('<int:pk>/checkout/', CheckOutVisitorAPI.as_view()),
]