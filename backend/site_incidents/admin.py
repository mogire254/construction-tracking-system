from django.contrib import admin
from .models import Incident

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['title', 'incident_type', 'severity', 'status', 'project', 'reported_at']
    list_filter = ['incident_type', 'severity', 'status', 'project']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['reported_at']
    
    fieldsets = (
        ('Incident Information', {
            'fields': ('title', 'incident_type', 'severity', 'description', 'location')
        }),
        ('Photo Documentation', {
            'fields': ('photo',),
            'description': 'Upload a photo of the incident or hazard (Objective 1)'
        }),
        ('Project Association', {
            'fields': ('project',)
        }),
        ('Status & Resolution', {
            'fields': ('status', 'resolution_notes', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('reported_at',),
            'classes': ('collapse',)
        }),
    )