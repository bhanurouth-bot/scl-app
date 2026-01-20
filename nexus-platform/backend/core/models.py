from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # We will add roles later, but this establishes the table structure.
    is_student = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)

    # This fixes a conflict with the default Django user model
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='nexus_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='nexus_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class SchoolSettings(models.Model):
    school_name = models.CharField(max_length=200, default="Nexus Institute")
    address = models.TextField(default="123 Education Lane")
    contact_email = models.EmailField(default="admin@nexus.edu")
    contact_phone = models.CharField(max_length=20, default="+1 234 567 890")
    
    def save(self, *args, **kwargs):
        # Ensure only 1 ID exists
        self.pk = 1
        super(SchoolSettings, self).save(*args, **kwargs)

    def __str__(self):
        return self.school_name