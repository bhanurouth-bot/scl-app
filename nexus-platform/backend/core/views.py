# backend/core/views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from .models import User, SchoolSettings, AcademicYear, Classroom
from .serializers import (
    UserSerializer, SchoolSettingsSerializer, 
    AcademicYearSerializer, ClassroomSerializer
)

# --- Custom Auth Views ---

class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('access'):
            # Set Access Token Cookie
            response.set_cookie(
                'access_token',
                response.data['access'],
                max_age=3600, # 60 minutes
                httponly=True,
                samesite='Lax',
                secure=False, # Set to True in production (HTTPS)
            )
            # Set Refresh Token Cookie
            response.set_cookie(
                'refresh_token',
                response.data['refresh'],
                max_age=86400, # 1 day
                httponly=True,
                samesite='Lax',
                secure=False, # Set to True in production
            )
            # Remove tokens from body to keep it clean (optional)
            del response.data['access']
            del response.data['refresh']
            
        return super().finalize_response(request, response, *args, **kwargs)

class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('access'):
            response.set_cookie(
                'access_token',
                response.data['access'],
                max_age=3600,
                httponly=True,
                samesite='Lax',
                secure=False,
            )
            del response.data['access']
        
        return super().finalize_response(request, response, *args, **kwargs)

class LogoutView(views.APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

# --- Existing ViewSets ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SchoolSettingsViewSet(viewsets.ModelViewSet):
    queryset = SchoolSettings.objects.all()
    serializer_class = SchoolSettingsSerializer

class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer