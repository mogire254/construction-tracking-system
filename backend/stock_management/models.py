from django.db import models

# Create your models here.
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
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='PCS')
    quantity_in_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    supplier_name = models.CharField(max_length=200, blank=True)
    supplier_contact = models.CharField(max_length=100, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='materials')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.quantity_in_stock} {self.unit})"
    
    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.minimum_stock_level


class MaterialUsage(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='usage_records')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_usage')
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2)
    date_used = models.DateField()
    used_by = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.material.name}: {self.quantity_used} on {self.date_used}"

