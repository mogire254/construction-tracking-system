from rest_framework import serializers
from .models import Incident

class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['id', 'title', 'incident_type', 'severity', 'description', 
                  'location', 'photo', 'project', 'status', 'resolution_notes', 
                  'reported_at', 'resolved_at']
        read_only_fields = ['reported_at', 'resolved_at']