# backend/config/urls.py
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from core.views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Authentication (Cookies) ---
    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)