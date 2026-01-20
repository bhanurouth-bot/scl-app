from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Authentication (JWT) ---
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- Core Modules ---
    path('api/core/', include('core.urls')),
    path('api/students/', include('students.urls')),
    path('api/finance/', include('finance.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/exams/', include('exams.urls')),
    
    # --- Communication ---
    path('api/notices/', include('notices.urls')),
    
    # --- Extended Modules ---
    path('api/hr/', include('hr.urls')),                   # Payroll & Employees
    path('api/library/', include('library.urls')),         # Book Management
    path('api/assignments/', include('assignments.urls')), # LMS / Homework
    path('api/timetable/', include('timetable.urls')),     # Scheduling
    path('api/visitors/', include('visitors.urls')),       # Front Desk Security
    path('api/certificates/', include('certificates.urls')), # ID Cards & Certs
    path('api/health/', include('health.urls')),           # Infirmary records
]