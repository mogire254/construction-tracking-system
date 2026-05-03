from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'status', 'progress_percentage', 'start_date']
    list_filter = ['status', 'start_date']
    search_fields = ['name', 'location']
    list_editable = ['progress_percentage']
