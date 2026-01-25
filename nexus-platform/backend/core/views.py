import re # <--- Import Regex
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import User, SchoolSettings, AcademicYear, Classroom
from .serializers import (
    UserSerializer, SchoolSettingsSerializer, 
    AcademicYearSerializer, ClassroomSerializer
)

# --- 1. Custom Auth Views (Cookie-Based) ---
class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('access'):
            response.set_cookie(
                'access_token', response.data['access'],
                max_age=3600, httponly=True, samesite='Lax', secure=False,
            )
            response.set_cookie(
                'refresh_token', response.data['refresh'],
                max_age=86400, httponly=True, samesite='Lax', secure=False,
            )
            del response.data['access']
            del response.data['refresh']
        return super().finalize_response(request, response, *args, **kwargs)

class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('access'):
            response.set_cookie(
                'access_token', response.data['access'],
                max_age=3600, httponly=True, samesite='Lax', secure=False,
            )
            del response.data['access']
        return super().finalize_response(request, response, *args, **kwargs)

class LogoutView(views.APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

# --- 2. Serve React App (With CSP Nonce Injection) ---
@ensure_csrf_cookie
def index(request):
    """
    Serves the React frontend and injects the CSP nonce 
    into the script tags so 'strict-dynamic' accepts them.
    """
    response = render(request, 'index.html')
    
    # Check if CSP middleware generated a nonce
    nonce = getattr(request, 'csp_nonce', None)
    
    # DEBUG PRINT: Check your terminal for this line when you refresh the page
    print(f"DEBUG: CSP Nonce generated: {nonce}") 

    if nonce:
        content = response.content.decode('utf-8')
        
        # FIX: Added a space after the nonce attribute to prevent merging with other attributes
        # Replaces '<script' with '<script nonce="...random..." '
        content_with_nonce = re.sub(
            r'<script', 
            f'<script nonce="{nonce}" ', 
            content, 
            flags=re.IGNORECASE
        )
        
        # Update response content
        response.content = content_with_nonce.encode('utf-8')
        
    return response

# --- 3. ViewSets ---
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