from rest_framework import serializers
from .models import IDCardLog, CertificateLog
from students.serializers import StudentSerializer

class IDCardLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IDCardLog
        fields = '__all__'

class CertificateLogSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    issuer_name = serializers.CharField(source='issued_by.get_full_name', read_only=True)
    
    class Meta:
        model = CertificateLog
        fields = '__all__'