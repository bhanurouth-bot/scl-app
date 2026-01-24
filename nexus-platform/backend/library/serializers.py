from rest_framework import serializers
from .models import Book, BookIssue
from students.serializers import StudentSerializer

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class BookIssueSerializer(serializers.ModelSerializer):
    # Read-only nested details for display
    student_details = StudentSerializer(source='student', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_cover = serializers.URLField(source='book.cover_image', read_only=True)
    
    class Meta:
        model = BookIssue
        fields = '__all__'