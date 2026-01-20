from rest_framework import serializers
from django.contrib.auth import get_user_model # <--- NEW IMPORT
from .models import SchoolSettings

# Get the correct user model (Custom or Default)
User = get_user_model()

class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user