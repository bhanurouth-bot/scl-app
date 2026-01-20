from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Core Modules
    path('api/core/', include('core.urls')),
    path('api/students/', include('students.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/notices/', include('notices.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/library/', include('library.urls')),

    # Extended Modules (Ensure these are installed in settings.py too)
    path('api/assignments/', include('assignments.urls')), # LMS
    path('api/hr/', include('hr.urls')),                   # Payroll
    path('api/visitors/', include('visitors.urls')),       # Front Desk
    path('api/certificates/', include('certificates.urls')), # Print Press
    path('api/health/', include('health.urls')),
    path('api/timetable/', include('timetable.urls')),
]