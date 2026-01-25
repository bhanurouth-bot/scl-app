from rest_framework import serializers
from .models import Book, BookIssue, Category
from students.serializers import StudentSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

class BookSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_input = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'categories', 'category_input', 'total_copies', 'available_copies', 'cover_image']

    def create(self, validated_data):
        cat_input = validated_data.pop('category_input', '')
        book = Book.objects.create(**validated_data)
        if cat_input:
            names = [n.strip() for n in cat_input.split(',') if n.strip()]
            for name in names:
                category, _ = Category.objects.get_or_create(name__iexact=name, defaults={'name': name})
                book.categories.add(category)
        return book

class BookIssueSerializer(serializers.ModelSerializer):
    book_details = BookSerializer(source='book', read_only=True)
    student_details = StudentSerializer(source='student', read_only=True)
    class Meta:
        model = BookIssue
        fields = '__all__'
        read_only_fields = ['is_returned', 'return_date']