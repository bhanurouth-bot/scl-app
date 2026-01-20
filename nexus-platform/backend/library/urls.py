from django.urls import path
from .views import BookListCreateAPI, IssueBookAPI, ReturnBookAPI

urlpatterns = [
    path('books/', BookListCreateAPI.as_view()),
    path('issue/', IssueBookAPI.as_view()),
    path('return/<int:issue_id>/', ReturnBookAPI.as_view()),
]