from rest_framework import serializers
from .models import HealthRecord, ClinicVisit

class HealthRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    grade = serializers.CharField(source='student.grade', read_only=True)

    class Meta:
        model = HealthRecord
        fields = '__all__'

class ClinicVisitSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    grade = serializers.CharField(source='student.grade', read_only=True)
    
    class Meta:
        model = ClinicVisit
        fields = '__all__'