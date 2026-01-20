from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Transaction
from .serializers import TransactionSerializer
from students.models import Student
from django.db.models import Sum, Count
from rest_framework.views import APIView
from students.models import Student

class CollectFeeAPI(generics.CreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    # The "Atomic" Transaction (All or Nothing)
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # 1. Validate Data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Save the Transaction Record
        txn = serializer.save()
        
        # 3. DEDUCT from Student's Due Balance
        student = txn.student
        student.fees_due = student.fees_due - txn.amount
        student.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class DashboardStatsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Total Students
        total_students = Student.objects.filter(is_active=True).count()

        # 2. Total Revenue (Sum of all transactions)
        # aggregate returns {'amount__sum': 5000.00}
        revenue_data = Transaction.objects.aggregate(Sum('amount'))
        total_revenue = revenue_data['amount__sum'] or 0.00

        # 3. Recent Transactions (Last 5)
        recent_txns = Transaction.objects.select_related('student').order_by('-date')[:5]
        
        # We manually format this small list to avoid needing another serializer
        recent_activity = [
            {
                'id': txn.id,
                'student': f"{txn.student.first_name} {txn.student.last_name}",
                'amount': txn.amount,
                'time': txn.date,
                'type': 'PAYMENT'
            }
            for txn in recent_txns
        ]

        # 4. Recent Admissions (Last 5)
        recent_students = Student.objects.order_by('-created_at')[:5].values(
            'id', 'first_name', 'last_name', 'grade', 'section', 'created_at'
        )

        return Response({
            'total_students': total_students,
            'total_revenue': total_revenue,
            'recent_activity': recent_activity,
            'recent_admissions': recent_students
        })