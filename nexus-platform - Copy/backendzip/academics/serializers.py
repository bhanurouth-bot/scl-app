from rest_framework import serializers
from .models import Subject, SubjectAllocation
from core.serializers import ClassroomSerializer
from hr.serializers import EmployeeSerializer

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class SubjectAllocationSerializer(serializers.ModelSerializer):
    # We keep the default behavior for 'writing' (sending IDs to save),
    # but we override 'to_representation' for 'reading' (sending Objects to frontend).
    
    class Meta:
        model = SubjectAllocation
        fields = '__all__'

    def to_representation(self, instance):
        # 1. Get the default data (which contains IDs)
        response = super().to_representation(instance)
        
        # 2. Manually swap IDs for nested Objects
        response['subject'] = SubjectSerializer(instance.subject).data
        
        # 3. Also fix the Teacher/Faculty details
        if instance.teacher:
            response['teacher'] = EmployeeSerializer(instance.teacher).data
        else:
            response['teacher'] = None
            
        return response