from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Unified User Model. 
    Authentication relies on 'username' (which could be an Employee ID or Student ID).
    Permissions are handled via Django Groups (e.g., 'Teachers', 'Students', 'Admins').
    """
    class UserType(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        STAFF = 'STAFF', 'Staff / Teacher'
        STUDENT = 'STUDENT', 'Student'
        PARENT = 'PARENT', 'Parent'
        
    user_type = models.CharField(
        max_length=20, 
        choices=UserType.choices, 
        default=UserType.ADMIN,
        help_text="High-level category for frontend routing."
    )
    
    # Profile Picture is essential for a polished UI
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Contact (Unique to ensure no duplicate accounts)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    # Fix for conflicting related_names (Django requirement)
    groups = models.ManyToManyField(
        Group,
        related_name='nexus_user_set',
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='nexus_user_set',
        blank=True,
        verbose_name='user permissions',
    )

    def save(self, *args, **kwargs):
        # Auto-assign Group based on user_type if needed
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and self.user_type:
            # Logic to add to default group can go here
            pass

class SchoolSettings(models.Model):
    """
    Singleton Model. Stores configuration for THIS specific installation.
    """
    # -- Basic Info --
    school_name = models.CharField(max_length=255, default="Nexus Institute")
    address = models.TextField(default="123 Education Lane")
    contact_email = models.EmailField(default="admin@nexus.edu")
    contact_phone = models.CharField(max_length=20, default="+1 234 567 890")
    
    # -- Branding (Crucial for selling customized versions) --
    logo = models.ImageField(upload_to='school_branding/', null=True, blank=True)
    favicon = models.ImageField(upload_to='school_branding/', null=True, blank=True)
    
    # For Glassmorphism Theme (Frontend fetches these to set CSS variables)
    primary_color = models.CharField(max_length=7, default="#4F46E5") # Hex code
    secondary_color = models.CharField(max_length=7, default="#10B981") # Hex code
    
    # -- Regional Settings --
    currency_symbol = models.CharField(max_length=5, default="$")
    date_format = models.CharField(max_length=20, default="DD-MM-YYYY")

    def save(self, *args, **kwargs):
        self.pk = 1 # Force singleton
        super(SchoolSettings, self).save(*args, **kwargs)

    def __str__(self):
        return "School Configuration"

class AcademicYear(models.Model):
    """
    Defines the Fiscal/Academic calendar.
    """
    name = models.CharField(max_length=50, unique=True) # e.g. "2025-2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Classroom(models.Model):
    """
    Represents a specific Class Section for a specific Year.
    e.g., 'Grade 10 - Section A (2025-2026)'
    """
    grade_level = models.CharField(max_length=50) # "10" or "X"
    section = models.CharField(max_length=10)     # "A", "Blue", "Daisy"
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    
    # Optional: Class Teacher (We will link this once HR app is ready)
    # class_teacher = models.ForeignKey(...)

    class Meta:
        ordering = ['grade_level', 'section']
        unique_together = ('grade_level', 'section', 'academic_year')

    def __str__(self):
        return f"{self.grade_level} - {self.section}"