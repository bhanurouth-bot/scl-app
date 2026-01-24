from rest_framework import serializers
from .models import Visitor

class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = '__all__'
        read_only_fields = ['check_in_time', 'check_out_time']