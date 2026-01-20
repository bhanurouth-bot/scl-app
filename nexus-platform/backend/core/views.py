from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model # <--- NEW IMPORT
from .models import SchoolSettings
from .serializers import SchoolSettingsSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated

# Get the correct user model
User = get_user_model()

# 1. School Settings (Get/Update the Singleton)
class SchoolSettingsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, _ = SchoolSettings.objects.get_or_create(pk=1)
        serializer = SchoolSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings, _ = SchoolSettings.objects.get_or_create(pk=1)
        serializer = SchoolSettingsSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# 2. User Management
class UserListCreateAPI(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UserDeleteAPI(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]