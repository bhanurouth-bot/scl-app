from rest_framework import viewsets
from .models import Employee, Department, Designation
from .serializers import (
    EmployeeSerializer, 
    EmployeeRegistrationSerializer,
    DepartmentSerializer,
    DesignationSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeRegistrationSerializer
        return EmployeeSerializer