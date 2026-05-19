from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('IN_PROGRESS', 'In Progress'),
        ('ON_HOLD', 'On Hold'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Basic Info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=300, blank=True)
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Financial
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total actual cost of the project")
    
    # Progress
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    progress_percentage = models.IntegerField(default=0, help_text="0-100%")
    
    # Photos
    photo = models.ImageField(upload_to='project_photos/', null=True, blank=True, help_text="Main project photo")
    completion_photo = models.ImageField(upload_to='project_completion_photos/', null=True, blank=True, help_text="Photo when project is completed")
    
    # Completion Info
    completed_at = models.DateTimeField(null=True, blank=True, help_text="Date when project was completed")
    completion_notes = models.TextField(blank=True, help_text="Notes about project completion")
    
    # Project Manager
    project_manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='managed_projects',
        help_text="Project manager assigned to this project"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def mark_as_completed(self):
        """Mark project as completed"""
        self.status = 'COMPLETED'
        self.progress_percentage = 100
        from django.utils import timezone
        self.completed_at = timezone.now()
        self.save()
    
    class Meta:
        ordering = ['-created_at']