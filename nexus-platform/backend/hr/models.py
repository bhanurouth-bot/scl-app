from django.db import models
from django.conf import settings

class Employee(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    designation = models.CharField(max_length=100) # e.g. "Senior Math Teacher"
    department = models.CharField(max_length=100) # e.g. "Science"
    join_date = models.DateField()
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.user.first_name} - {self.designation}"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]
    TYPE_CHOICES = [('SICK', 'Sick Leave'), ('CASUAL', 'Casual Leave'), ('UNPAID', 'Unpaid Leave')]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    leave_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='CASUAL')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    def __str__(self):
        return f"{self.employee.user.first_name}: {self.leave_type} ({self.status})"

class SalarySlip(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.DateField() # We use the 1st of the month to denote the period
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month')