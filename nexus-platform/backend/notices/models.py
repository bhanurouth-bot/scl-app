from django.db import models
from django.conf import settings

class Notice(models.Model):
    CATEGORY_CHOICES = [
        ('ANNOUNCEMENT', 'General Announcement'),
        ('EVENT', 'Event'),
        ('HOLIDAY', 'Holiday'),
        ('URGENT', 'Urgent Alert'),
    ]

    AUDIENCE_CHOICES = [
        ('ALL', 'Everyone'),
        ('STUDENT', 'Students Only'),
        ('TEACHER', 'Teachers Only'),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='ANNOUNCEMENT')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='ALL')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']