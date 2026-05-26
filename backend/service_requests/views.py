from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Show only requests made by this user (by name or email)
        return ServiceRequest.objects.filter(
            models.Q(name=user.username) | 
            models.Q(email=user.email) |
            models.Q(user=user)
        )
    
    def perform_create(self, serializer):
        # Automatically set the user when creating a request
        serializer.save(user=self.request.user, name=self.request.user.username, email=self.request.user.email)