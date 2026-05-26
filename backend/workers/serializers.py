from rest_framework import serializers
from .models import WorkerCategory, Worker, DailyAttendance

class WorkerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerCategory
        fields = '__all__'

class WorkerSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    trade_display = serializers.CharField(source='get_trade_display', read_only=True)
    
    class Meta:
        model = Worker
        fields = '__all__'

class DailyAttendanceSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.name', read_only=True)
    worker_trade = serializers.CharField(source='worker.get_trade_display', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = DailyAttendance
        fields = '__all__'