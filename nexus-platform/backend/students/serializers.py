from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, StudentHealth, StudentPreviousEducation, StudentDocument
from core.models import Classroom

class StudentHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentHealth
        fields = '__all__'

class StudentPreviousEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentPreviousEducation
        fields = '__all__'

class StudentDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDocument
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    classroom_details = serializers.SerializerMethodField()
    
    # FIX: Renamed from health_record to medical_profile to match models.py
    medical_profile = StudentHealthSerializer(read_only=True)
    previous_education = StudentPreviousEducationSerializer(many=True, read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)

    student_signature = serializers.ImageField(required=False, allow_null=True)
    guardian_signature = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Student
        fields = '__all__'
        depth = 1

    def get_classroom_details(self, obj):
        if obj.classroom:
            return {
                "id": obj.classroom.id,
                "grade_level": obj.classroom.grade_level,
                "section": obj.classroom.section
            }
        return None

# --- RESTORED REGISTRATION/UPDATE SERIALIZERS ---
class StudentRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Student
        fields = ['student_id', 'first_name', 'last_name', 'email', 'password', 
                  'date_of_birth', 'gender', 'guardian_name', 'guardian_phone', 'address']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['student_id'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        validated_data.pop('first_name')
        validated_data.pop('last_name')
        validated_data.pop('email')
        validated_data.pop('password')
        student = Student.objects.create(user=user, **validated_data)
        return student

class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        exclude = ['user', 'student_id']