from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Material, MaterialUsage

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit', 'quantity_in_stock', 'minimum_stock_level', 'is_low_stock', 'project']
    list_filter = ['unit', 'project']
    search_fields = ['name', 'supplier_name']


@admin.register(MaterialUsage)
class MaterialUsageAdmin(admin.ModelAdmin):
    list_display = ['material', 'quantity_used', 'date_used', 'project', 'used_by']
    list_filter = ['date_used', 'project']
    search_fields = ['material__name']