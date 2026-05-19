from django.db import models
from construction_projects.models import Project

class Material(models.Model):
    UNIT_CHOICES = [
        ('PCS', 'Pieces'),
        ('KG', 'Kilograms'),
        ('LTR', 'Liters'),
        ('MTR', 'Meters'),
        ('SQMT', 'Square Meters'),
        ('BAGS', 'Bags'),
        ('BOX', 'Boxes'),
        ('ROLL', 'Rolls'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='PCS')
    
    # Required materials (budgeted)
    required_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    required_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Actual used materials
    used_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    used_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Unit price
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Supplier information
    supplier_name = models.CharField(max_length=200, blank=True)
    supplier_contact = models.CharField(max_length=100, blank=True)
    
    # Project relationship
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='materials', null=True, blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.name if self.project else 'No Project'}"
    
    @property
    def remaining_quantity(self):
        return self.required_quantity - self.used_quantity
    
    @property
    def remaining_cost(self):
        return self.remaining_quantity * self.unit_price
    
    @property
    def completion_percentage(self):
        if self.required_quantity > 0:
            return (self.used_quantity / self.required_quantity) * 100
        return 0