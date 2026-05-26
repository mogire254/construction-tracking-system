from django.db import models
from construction_projects.models import Project
from django.contrib.auth.models import User

class WorkLog(models.Model):
    WORK_TYPE_CHOICES = [
        ('DONE', 'Work Done'),
        ('TODO', 'Work To Be Done'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='work_logs')
    work_type = models.CharField(max_length=10, choices=WORK_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to='work_log_photos/', null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"