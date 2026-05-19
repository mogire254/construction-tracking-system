from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    display_photo_url = serializers.SerializerMethodField()
    display_completion_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'location', 'start_date', 'end_date', 
                  'budget', 'actual_cost', 'status', 'progress_percentage', 
                  'photo', 'completion_photo', 'completed_at', 'completion_notes',
                  'project_manager', 'created_at', 'updated_at', 
                  'display_photo_url', 'display_completion_photo_url']
        read_only_fields = ['created_at', 'updated_at', 'completed_at', 'actual_cost']
    
    def get_display_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None
    
    def get_display_completion_photo_url(self, obj):
        if obj.completion_photo:
            return obj.completion_photo.url
        return None