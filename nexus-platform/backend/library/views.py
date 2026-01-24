from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Book, BookIssue
from .serializers import BookSerializer, BookIssueSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class BookIssueViewSet(viewsets.ModelViewSet):
    queryset = BookIssue.objects.all().order_by('-issue_date')
    serializer_class = BookIssueSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create to check stock and decrement availability.
        """
        book_id = request.data.get('book')
        try:
            book = Book.objects.get(id=book_id)
            if book.available_copies < 1:
                return Response(
                    {"error": "Book is currently out of stock."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Proceed to create the issue record
            response = super().create(request, *args, **kwargs)
            
            # Success: Decrement stock
            book.available_copies -= 1
            book.save()
            return response

        except Book.DoesNotExist:
             return Response({"error": "Book not found"}, status=404)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        """
        Custom Action to mark a book as returned.
        """
        issue = self.get_object()
        if issue.is_returned:
            return Response({"error": "Book is already returned"}, status=400)
        
        # 1. Mark as Returned
        issue.is_returned = True
        issue.return_date = timezone.now().date()
        issue.save()
        
        # 2. Increment Stock
        issue.book.available_copies += 1
        issue.book.save()
        
        return Response({"message": "Book returned successfully"})