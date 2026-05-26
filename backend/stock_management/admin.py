from django.contrib import admin
from .models import Material

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'required_quantity', 'used_quantity', 'remaining_quantity', 'status']
    list_filter = ['status', 'project', 'unit']
    search_fields = ['name', 'supplier_name']
    readonly_fields = ['used_quantity', 'used_cost', 'created_at', 'updated_at', 'remaining_quantity', 'remaining_cost', 'completion_percentage']
    
    fieldsets = (
        ('Material Information', {
            'fields': ('name', 'description', 'unit', 'project')
        }),
        ('Required Materials (Budgeted)', {
            'fields': ('required_quantity', 'required_cost', 'unit_price')
        }),
        ('Actual Usage', {
            'fields': ('used_quantity', 'used_cost'),
            'description': 'Update used quantity directly to track progress'
        }),
        ('Calculated Fields', {
            'fields': ('remaining_quantity', 'remaining_cost', 'completion_percentage'),
            'classes': ('collapse',)
        }),
        ('Supplier Information', {
            'fields': ('supplier_name', 'supplier_contact')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )