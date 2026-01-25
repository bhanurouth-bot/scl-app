from rest_framework import serializers
from .models import FeeHead, FeeStructure, Invoice, InvoiceItem, Transaction
from students.serializers import StudentSerializer
from core.models import Classroom, AcademicYear

class FeeHeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeHead
        fields = '__all__'

class FeeStructureSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    fee_name = serializers.CharField(source='fee_head.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    fee_name = serializers.CharField(source='fee_head.name', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = ['id', 'fee_head', 'fee_name', 'amount']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='student.classroom.__str__', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'student', 'student_name', 'classroom_name',
            'academic_year', 'issue_date', 'due_date', 
            'total_amount', 'paid_amount', 'balance_due', 'status',
            'items', 'transactions'
        ]

class BulkInvoiceSerializer(serializers.Serializer):
    """
    Serializer to handle generating invoices for an entire class based on Fee Structure.
    """
    classroom = serializers.PrimaryKeyRelatedField(queryset=Classroom.objects.all())
    academic_year = serializers.PrimaryKeyRelatedField(queryset=AcademicYear.objects.all())
    due_date = serializers.DateField()