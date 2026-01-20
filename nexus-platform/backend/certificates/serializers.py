from rest_framework import serializers
from .models import Certificate

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    issuer_name = serializers.CharField(source='issued_by.first_name', read_only=True)

    class Meta:
        model = Certificate
        fields = '__all__'