from rest_framework import serializers
from .models import Material

class MaterialSerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.ReadOnlyField()
    remaining_cost = serializers.ReadOnlyField()
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Material
        fields = '__all__'