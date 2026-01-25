from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Book, BookIssue, Category
from .serializers import BookSerializer, BookIssueSerializer

class BookViewSet(viewsets.ModelViewSet):
    # Already optimized with prefetch_related('categories')
    queryset = Book.objects.all().prefetch_related('categories').order_by('title')
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | 
                Q(author__icontains=search) | 
                Q(isbn__icontains=search)
            )
        if category:
            qs = qs.filter(categories__name__iexact=category)
        return qs

    @action(detail=False, methods=['get'])
    def categories(self, request):
        cats = Category.objects.values_list('name', flat=True).distinct().order_by('name')
        return Response(cats)

class BookIssueViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Book and Student
    queryset = BookIssue.objects.select_related('book', 'student', 'student__user').all().order_by('-issue_date')
    serializer_class = BookIssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        status_filter = self.request.query_params.get('status')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if status_filter == 'active':
            qs = qs.filter(is_returned=False)
        elif status_filter == 'history':
            qs = qs.filter(is_returned=True)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book = serializer.validated_data['book']
        if book.available_copies < 1:
            return Response({"error": f"'{book.title}' is out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        book.available_copies -= 1
        book.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        issue = self.get_object()
        if issue.is_returned:
            return Response({"error": "Already returned."}, status=400)
            
        issue.is_returned = True
        issue.return_date = timezone.now().date()
        issue.save()
        
        book = issue.book
        book.available_copies += 1
        book.save()
        
        return Response({"status": "returned", "message": "Book returned successfully."})