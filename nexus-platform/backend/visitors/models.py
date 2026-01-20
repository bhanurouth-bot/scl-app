from django.db import models

class Visitor(models.Model):
    STATUS_CHOICES = [('ON_CAMPUS', 'On Campus'), ('CHECKED_OUT', 'Checked Out')]
    
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    purpose = models.TextField()
    person_to_meet = models.CharField(max_length=100) # e.g. "Principal" or "Mr. Smith"
    
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ON_CAMPUS')

    def __str__(self):
        return f"{self.name} ({self.status})"