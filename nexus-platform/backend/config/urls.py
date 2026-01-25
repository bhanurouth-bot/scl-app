from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf.urls.static import static
from core.views import index # Import the index view

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
    path('api/hr/', include('hr.urls')),
    path('api/library/', include('library.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/timetable/', include('timetable.urls')),
    path('api/visitors/', include('visitors.urls')),
    path('api/certificates/', include('certificates.urls')),
    path('api/health/', include('health.urls')),
    path('api/results/', include('results.urls')),
    path('api/transport/', include('transport.urls')),
    
    # --- Serve React Frontend (Catch-All) ---
    # Matches any path that doesn't start with 'api/' or 'admin/'
    re_path(r'^(?!api|admin).*$', index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)