from django.db import models
from django.conf import settings

class Department(models.Model):
    """
    Master Data for Departments (e.g., 'Science', 'IT', 'Admin')
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Designation(models.Model):
    """
    Master Data for Job Titles (e.g., 'Senior Teacher', 'Lab Assistant')
    """
    title = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.title

class Employee(models.Model):
    """
    The Employee Profile.
    Personal info lives in core.User.
    Professional info lives here.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='employee_profile'
    )
    
    employee_id = models.CharField(max_length=20, unique=True, help_text="Unique Employee ID (e.g., EMP-001)")
    
    # Professional Details
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    signature = models.ImageField(upload_to='signatures/staff/', blank=True, null=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name='employees')
    
    join_date = models.DateField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, help_text="Base Monthly Salary")
    
    # Status
    is_active = models.BooleanField(default=True)

    def __str__(self):
        # Access name from the related User model
        return f"{self.user.get_full_name()} ({self.employee_id})"

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'), 
        ('APPROVED', 'Approved'), 
        ('REJECTED', 'Rejected')
    ]
    TYPE_CHOICES = [
        ('SICK', 'Sick Leave'), 
        ('CASUAL', 'Casual Leave'), 
        ('PAID', 'Paid Leave'),
        ('UNPAID', 'Unpaid Leave')
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    applied_on = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    leave_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='CASUAL')
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    # Audit: Who approved it?
    approved_by = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_leaves'
    )

    def __str__(self):
        return f"{self.employee.employee_id}: {self.leave_type} ({self.status})"

class SalarySlip(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_slips')
    
    # Changed from 'month' to Date Range
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Calculation Data
    total_days = models.IntegerField(default=0)
    present_days = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    leave_days = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    absent_days = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    
    # Financials
    base_amount = models.DecimalField(max_digits=10, decimal_places=2) # Monthly Basic
    earned_amount = models.DecimalField(max_digits=10, decimal_places=2) # Pro-rated based on attendance
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    
    is_paid = models.BooleanField(default=False)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-end_date']

class StaffAttendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
        ('LATE', 'Late'),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    remarks = models.CharField(max_length=200, blank=True)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'date')

