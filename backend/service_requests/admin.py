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
        ('Contact Information (For Approved Requests)', {
            'fields': ('contact_person', 'contact_phone', 'contact_email', 'office_location', 'office_phone', 'personal_phone'),
            'description': 'Add contact details when approving a request',
            'classes': ('wide',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_approved', 'mark_as_rejected', 'mark_as_in_progress', 'mark_as_completed']
    
    def mark_as_approved(self, request, queryset):
        queryset.update(status='APPROVED')
        self.message_user(request, f'{queryset.count()} request(s) marked as Approved.')
    mark_as_approved.short_description = "Mark selected requests as Approved"
    
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='REJECTED')
        self.message_user(request, f'{queryset.count()} request(s) marked as Rejected.')
    mark_as_rejected.short_description = "Mark selected requests as Rejected"
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='IN_PROGRESS')
        self.message_user(request, f'{queryset.count()} request(s) marked as In Progress.')
    mark_as_in_progress.short_description = "Mark selected requests as In Progress"
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='COMPLETED')
        self.message_user(request, f'{queryset.count()} request(s) marked as Completed.')
    mark_as_completed.short_description = "Mark selected requests as Completed"