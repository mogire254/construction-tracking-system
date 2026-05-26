from django.contrib import admin
from .models import WorkLog

@admin.register(WorkLog)
class WorkLogAdmin(admin.ModelAdmin):
    list_display = ['project', 'work_type', 'title', 'completed', 'created_at']
    list_filter = ['work_type', 'completed', 'project']
    search_fields = ['title', 'description']