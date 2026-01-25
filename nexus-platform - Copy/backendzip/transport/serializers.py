from rest_framework import serializers
from .models import Driver, Vehicle, Route, Stop, TransportAllocation, MaintenanceLog
from students.serializers import StudentSerializer
from hr.serializers import EmployeeSerializer

class DriverSerializer(serializers.ModelSerializer):
    # Optional nested employee details if linked
    employee_details = EmployeeSerializer(source='employee', read_only=True)
    
    class Meta:
        model = Driver
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    class Meta:
        model = Vehicle
        fields = '__all__'

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    stops = StopSerializer(many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'

class TransportAllocationSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    route_details = RouteSerializer(source='route', read_only=True)
    stop_details = StopSerializer(source='pickup_stop', read_only=True)
    class Meta:
        model = TransportAllocation
        fields = '__all__'

class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLog
        fields = '__all__'