from django.urls import path
from .views import (
    TeacherListCreateAPI, RoomListCreateAPI, SubjectListCreateAPI, 
    ScheduleListCreateAPI, LiveClassesAPI
)

urlpatterns = [
    path('teachers/', TeacherListCreateAPI.as_view()),
    path('rooms/', RoomListCreateAPI.as_view()),
    path('subjects/', SubjectListCreateAPI.as_view()),
    path('schedule/', ScheduleListCreateAPI.as_view()),
    path('live/', LiveClassesAPI.as_view()), # <--- Dashboard will hit this
]