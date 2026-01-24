from django.db import models
from students.models import Student
from hr.models import Employee

class Driver(models.Model):
    # Link to HR for Payroll (Optional)
    employee = models.OneToOneField(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_profile')
    
    # Basic Details (Used if not an HR Employee, or as cache)
    name = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    photo = models.ImageField(upload_to='transport/drivers/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=[('ACTIVE', 'Active'), ('ON_LEAVE', 'On Leave')], default='ACTIVE')

    def save(self, *args, **kwargs):
        # Auto-fill info if linked to HR Employee
        if self.employee:
            self.name = f"{self.employee.user.first_name} {self.employee.user.last_name}"
            # You might want to pull phone from User profile if available
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    STATUS_CHOICES = [('ACTIVE', 'Active'), ('MAINTENANCE', 'In Maintenance'), ('OUT_OF_SERVICE', 'Out of Service')]
    
    vehicle_number = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=100)
    capacity = models.IntegerField(default=40)
    fuel_type = models.CharField(max_length=20, default='Diesel')
    driver = models.OneToOneField(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicle')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # --- Live Tracking Fields ---
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vehicle_number} ({self.model})"

class Route(models.Model):
    name = models.CharField(max_length=100)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, related_name='routes')
    start_point = models.CharField(max_length=100)
    end_point = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Stop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    name = models.CharField(max_length=100)
    arrival_time = models.TimeField()
    monthly_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['arrival_time']

class TransportAllocation(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='transport')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True)
    pickup_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.student} -> {self.route}"

class MaintenanceLog(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_logs')
    date = models.DateField()
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    service_center = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.vehicle} - {self.date}"