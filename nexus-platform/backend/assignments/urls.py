from django.urls import path
from .views import AssignmentListCreateAPI, SubmitAssignmentAPI, AssignmentSubmissionsAPI, GradeSubmissionAPI

urlpatterns = [
    path('', AssignmentListCreateAPI.as_view()),
    path('submit/', SubmitAssignmentAPI.as_view()),
    
    # New Endpoints
    path('<int:pk>/submissions/', AssignmentSubmissionsAPI.as_view()), # GET list
    path('submission/<int:pk>/grade/', GradeSubmissionAPI.as_view()),  # PUT grade
]