from django.db import models

class Notice(models.Model):
    TYPES = [
        ('INFO', 'Information'),     # Blue
        ('WARNING', 'Warning'),      # Yellow/Orange
        ('URGENT', 'Urgent/Alert'),  # Red
        ('SUCCESS', 'Success'),      # Green
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=10, choices=TYPES, default='INFO')
    is_pinned = models.BooleanField(default=False) # Pin to top of dashboard?
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title