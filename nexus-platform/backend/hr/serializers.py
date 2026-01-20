from rest_framework import serializers
from django.db import transaction
from core.models import User
from core.serializers import UserSerializer
from .models import Employee, Department, Designation

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    """
    Read-Only Serializer for displaying employees with full details.
    """
    user = UserSerializer(read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    designation_details = DesignationSerializer(source='designation', read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeRegistrationSerializer(serializers.ModelSerializer):
    """
    Write-Only Serializer for creating new employees (User + Employee Profile).
    """
    # User Fields
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, required=False, default="Teacher@123")
    
    # Employee Fields (Foreign Keys accept IDs)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    designation = serializers.PrimaryKeyRelatedField(queryset=Designation.objects.all())

    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'password',
            'employee_id', 'department', 'designation', 
            'join_date', 'basic_salary'
        ]

    def create(self, validated_data):
        # 1. Extract User Data
        user_data = {
            'username': validated_data['employee_id'],
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'password': validated_data.pop('password'),
            'user_type': User.UserType.STAFF, # Use STAFF based on your Core model
        }

        # 2. Atomic Transaction
        with transaction.atomic():
            user = User.objects.create_user(**user_data)
            employee = Employee.objects.create(user=user, **validated_data)
            
        return employee