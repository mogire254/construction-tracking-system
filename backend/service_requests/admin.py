from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import ServiceRequest

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'project_type', 'budget', 'status', 'created_at']
    list_filter = ['status', 'project_type', 'created_at']
    search_fields = ['name', 'email', 'phone', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('name', 'email', 'phone', 'user')
        }),
        ('Project Details', {
            'fields': ('project_type', 'description', 'budget', 'timeline')
        }),
        ('Admin Management', {
            'fields': ('status', 'admin_response', 'admin_notes'),
            'description': 'Update status and respond to the user'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_approved', 'mark_as_rejected', 'mark_as_in_progress']
    
    def mark_as_approved(self, request, queryset):
        queryset.update(status='APPROVED')
    mark_as_approved.short_description = "Mark selected requests as Approved"
    
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='REJECTED')
    mark_as_rejected.short_description = "Mark selected requests as Rejected"
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='IN_PROGRESS')
    mark_as_in_progress.short_description = "Mark selected requests as In Progress"
