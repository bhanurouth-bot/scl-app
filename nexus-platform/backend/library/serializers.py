from rest_framework import serializers
from .models import Book, BookIssue

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    
    class Meta:
        model = BookIssue
        fields = ['id', 'book', 'book_title', 'student', 'student_name', 'issue_date', 'due_date', 'is_returned']