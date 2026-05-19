from django.contrib import admin
from django.utils.html import format_html
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'status', 'progress_percentage', 'budget', 'actual_cost', 'display_photo']
    list_filter = ['status', 'start_date', 'created_at']
    search_fields = ['name', 'location', 'description']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'display_photo', 'display_completion_photo']
    list_editable = ['progress_percentage']
    
    def display_photo(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 5px;" />', obj.photo.url)
        return "No Photo"
    display_photo.short_description = 'Photo'
    
    def display_completion_photo(self, obj):
        if obj.completion_photo:
            return format_html('<img src="{}" width="100" height="100" style="border-radius: 5px;" />', obj.completion_photo.url)
        return "No Completion Photo"
    display_completion_photo.short_description = 'Completion Photo'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'location', 'project_manager')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Financial', {
            'fields': ('budget', 'actual_cost'),
            'description': 'Budget is planned cost. Actual cost auto-updates from materials.'
        }),
        ('Progress & Status', {
            'fields': ('status', 'progress_percentage', 'completed_at', 'completion_notes')
        }),
        ('Photos', {
            'fields': ('photo', 'display_photo', 'completion_photo', 'display_completion_photo'),
            'description': 'Upload project photos. Add completion photo when project is done.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_in_progress']
    
    def mark_as_completed(self, request, queryset):
        for project in queryset:
            project.mark_as_completed()
        self.message_user(request, f'{queryset.count()} project(s) marked as completed.')
    mark_as_completed.short_description = "Mark selected projects as Completed"
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='IN_PROGRESS')
        self.message_user(request, f'{queryset.count()} project(s) marked as In Progress.')
    mark_as_in_progress.short_description = "Mark selected projects as In Progress"
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # If status changed to completed, set completion date
        if obj.status == 'COMPLETED' and not obj.completed_at:
            from django.utils import timezone
            obj.completed_at = timezone.now()
            obj.progress_percentage = 100
            obj.save()