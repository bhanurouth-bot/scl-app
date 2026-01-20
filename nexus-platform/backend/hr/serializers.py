from rest_framework import serializers
from .models import Employee, LeaveRequest, SalarySlip
from django.contrib.auth import get_user_model

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    # Display Fields (Read Only)
    name = serializers.CharField(source='user.first_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    # Input Fields (Write Only - for creating the User account)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'name', 'email', 'designation', 'department', 
            'join_date', 'basic_salary', 
            'username', 'password', 'first_name', 'last_name' # <--- Inputs
        ]
        extra_kwargs = {'user': {'read_only': True}} 

    def create(self, validated_data):
        # 1. Extract User Data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        f_name = validated_data.pop('first_name')
        l_name = validated_data.pop('last_name')
        
        # 2. Create the Login Account (User)
        user = User.objects.create_user(
            username=username, 
            password=password, 
            first_name=f_name, 
            last_name=l_name, 
            is_staff=True # They can login to the system
        )
        
        # 3. Create the Employee Profile linked to that User
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.first_name', read_only=True)
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class SalarySlipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.first_name', read_only=True)
    designation = serializers.CharField(source='employee.designation', read_only=True)
    class Meta:
        model = SalarySlip
        fields = '__all__'