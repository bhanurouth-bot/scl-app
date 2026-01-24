from django.db import models
from students.models import Student

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20, unique=True)
    
    categories = models.ManyToManyField(Category, related_name='books', blank=True)
    
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)
    
    # --- FIX: Increased max_length to 1000 ---
    cover_image = models.URLField(
        max_length=1000, 
        default="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300",
        blank=True, 
        null=True
    )
    
    def save(self, *args, **kwargs):
        if not self.pk: 
            self.available_copies = self.total_copies
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class BookIssue(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    is_returned = models.BooleanField(default=False)
    return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.book.title} -> {self.student.first_name}"