from django.db import models
from construction_projects.models import Project
from django.contrib.auth.models import User

class WorkerCategory(models.Model):
    CATEGORY_CHOICES = [
        ('SKILLED', 'Skilled Workers'),
        ('UNSKILLED', 'Unskilled Workers'),
        ('PLANT_OPERATOR', 'Plant Operators'),
        ('PROFESSIONAL', 'Professional Team'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class Worker(models.Model):
    TRADE_CHOICES = [
        ('PLUMBER', 'Plumber'),
        ('ELECTRICIAN', 'Electrician'),
        ('STEEL_FIXER', 'Steel Fixer'),
        ('WELDER', 'Welder'),
        ('CARPENTER', 'Carpenter'),
        ('MASON', 'Mason'),
        ('PAINTER', 'Painter'),
        ('LABORER', 'Laborer'),
        ('CRANE_OPERATOR', 'Crane Operator'),
        ('EXCAVATOR_OPERATOR', 'Excavator Operator'),
        ('MIXER_OPERATOR', 'Mixer Operator'),
        ('ENGINEER', 'Engineer'),
        ('ARCHITECT', 'Architect'),
        ('SURVEYOR', 'Surveyor'),
        ('SUPERVISOR', 'Supervisor'),
        ('PROJECT_MANAGER', 'Project Manager'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    trade = models.CharField(max_length=50, choices=TRADE_CHOICES)
    category = models.ForeignKey(WorkerCategory, on_delete=models.CASCADE, related_name='workers')
    phone = models.CharField(max_length=20, blank=True)
    id_number = models.CharField(max_length=50, blank=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_trade_display()}"

class DailyAttendance(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='attendances')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='worker_attendances')
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=8)
    is_present = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['worker', 'project', 'date']
    
    def __str__(self):
        return f"{self.worker.name} - {self.date} - {'Present' if self.is_present else 'Absent'}"