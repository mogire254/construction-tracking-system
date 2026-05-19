from django.db import models
from django.contrib.auth.models import User

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    
    PROJECT_TYPE_CHOICES = [
        ('residential', 'Residential Building'),
        ('commercial', 'Commercial Building'),
        ('road', 'Road Construction'),
        ('bridge', 'Bridge Construction'),
        ('renovation', 'Renovation'),
        ('industrial', 'Industrial Building'),
        ('water', 'Water Supply System'),
        ('other', 'Other'),
    ]
    
    # User information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_requests', null=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Project details
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPE_CHOICES)
    description = models.TextField()
    budget = models.CharField(max_length=100, blank=True)
    timeline = models.CharField(max_length=100, blank=True)
    
    # Admin fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_response = models.TextField(blank=True, help_text="Response from admin to the user")
    admin_notes = models.TextField(blank=True, help_text="Internal admin notes")
    
    # Contact information for approved requests (ADD THESE 3 FIELDS)
    contact_person = models.CharField(max_length=200, blank=True, help_text="Contact person for the job (e.g., Project Manager)")
    contact_phone = models.CharField(max_length=20, blank=True, help_text="Contact phone number (e.g., +254704071967)")
    contact_email = models.EmailField(blank=True, help_text="Contact email address")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_project_type_display()} ({self.get_status_display()})"
    
    @property
    def is_approved(self):
        return self.status == 'APPROVED'
    
    @property
    def has_contact_info(self):
        return bool(self.contact_person or self.contact_phone or self.contact_email)