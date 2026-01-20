from rest_framework import serializers
from django.db import transaction
from core.models import User, Classroom, AcademicYear
from .models import Student
from core.serializers import UserSerializer, ClassroomSerializer

class StudentSerializer(serializers.ModelSerializer):
    """
    Read-Only Serializer for displaying data
    """
    user = UserSerializer(read_only=True)
    classroom_details = ClassroomSerializer(source='classroom', read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'

class StudentRegistrationSerializer(serializers.ModelSerializer):
    """
    Write-Only Serializer for creating new students + users
    """
    # User Fields
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'email', 'password', # User
            'student_id', 'roll_number', 'classroom', 'admission_year', # Academic
            'gender', 'date_of_birth', 'blood_group', # Personal
            'guardian_name', 'guardian_phone' # Guardian
        ]

    def create(self, validated_data):
        # 1. Extract User Data
        user_data = {
            'username': validated_data['student_id'], # Username is Student ID
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.get('email', ''),
            'password': validated_data.pop('password'),
            'user_type': User.UserType.STUDENT,
        }

        # 2. Atomic Transaction (Safety First)
        with transaction.atomic():
            # Create User
            user = User.objects.create_user(**user_data)
            
            # Create Student Profile
            student = Student.objects.create(user=user, **validated_data)
            
        return student

class StudentUpdateSerializer(serializers.ModelSerializer):
    """
    Handles updating Student Profile AND nested User details (Name, Avatar).
    """
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    avatar = serializers.ImageField(source='user.avatar', required=False)

    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'email', 'avatar', # User Fields
            'roll_number', 'classroom', 'admission_year', # Academic
            'gender', 'date_of_birth', 'blood_group', 
            'guardian_name', 'guardian_phone'
        ]

    def update(self, instance, validated_data):
        # 1. Extract and Update Nested User Data
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if user_data:
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.email = user_data.get('email', user.email)
            if 'avatar' in user_data:
                user.avatar = user_data['avatar']
            user.save()

        # 2. Update Student Data
        return super().update(instance, validated_data)