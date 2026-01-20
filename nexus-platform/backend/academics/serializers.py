from rest_framework import serializers
from .models import Subject, SubjectAllocation
from core.serializers import ClassroomSerializer
from hr.serializers import EmployeeSerializer # We will fix HR next, but this import is fine for now

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class SubjectAllocationSerializer(serializers.ModelSerializer):
    # Nested serializers for better frontend data
    classroom_details = ClassroomSerializer(source='classroom', read_only=True)
    
    class Meta:
        model = SubjectAllocation
        fields = '__all__'