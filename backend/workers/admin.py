from django.contrib import admin
from .models import WorkerCategory, Worker, DailyAttendance

@admin.register(WorkerCategory)
class WorkerCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    list_filter = ['category']

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ['name', 'trade', 'category', 'daily_rate', 'is_active']
    list_filter = ['trade', 'category', 'is_active']
    search_fields = ['name', 'phone', 'id_number']

@admin.register(DailyAttendance)
class DailyAttendanceAdmin(admin.ModelAdmin):
    list_display = ['worker', 'project', 'date', 'is_present', 'hours_worked']
    list_filter = ['date', 'project', 'is_present']
    search_fields = ['worker__name']