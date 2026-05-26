from rest_framework import serializers
from .models import WorkLog

class WorkLogSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = WorkLog
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']