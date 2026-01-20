from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Book, BookIssue
from .serializers import BookSerializer, BookIssueSerializer
from rest_framework.permissions import IsAuthenticated

class BookListCreateAPI(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

class IssueBookAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        book_id = request.data.get('book_id')
        student_id = request.data.get('student_id')
        days = int(request.data.get('days', 14))

        with transaction.atomic():
            book = Book.objects.select_for_update().get(id=book_id)
            if book.available_copies < 1:
                return Response({"error": "Out of Stock"}, status=400)
            
            # Create Issue Record
            BookIssue.objects.create(
                book_id=book_id,
                student_id=student_id,
                due_date=timezone.now().date() + timedelta(days=days)
            )
            
            # Decrease Stock
            book.available_copies -= 1
            book.save()
            
        return Response({"message": "Book Issued"})

class ReturnBookAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, issue_id):
        with transaction.atomic():
            issue = BookIssue.objects.select_for_update().get(id=issue_id)
            if issue.is_returned:
                return Response({"error": "Already Returned"}, status=400)
            
            issue.is_returned = True
            issue.return_date = timezone.now().date()
            issue.save()

            # Increase Stock
            book = issue.book
            book.available_copies += 1
            book.save()

        return Response({"message": "Book Returned"})