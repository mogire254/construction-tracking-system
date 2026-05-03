from django.db import models
from construction_projects.models import Project

class Incident(models.Model):
    INCIDENT_TYPES = [
        ('SAFETY', 'Safety Hazard'),
        ('QUALITY', 'Quality Issue'),
        ('ACCIDENT', 'Accident'),
        ('THEFT', 'Theft/Loss'),
        ('OTHER', 'Other'),
    ]
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('REPORTED', 'Reported'),
        ('INVESTIGATING', 'Under Investigation'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    # Basic incident information
    title = models.CharField(max_length=200)
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='MEDIUM')
    description = models.TextField()
    location = models.CharField(max_length=300, blank=True)
    
    # Photo upload (OBJECTIVE 1)
    photo = models.ImageField(upload_to='incident_photos/', null=True, blank=True)
    
    # Relationship to project
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='incidents')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REPORTED')
    resolution_notes = models.TextField(blank=True)
    
    # Timestamps
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_incident_type_display()}: {self.title}"