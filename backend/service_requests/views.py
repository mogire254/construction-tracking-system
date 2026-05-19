from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Show requests where:
        # 1. Email matches logged-in user's email
        # 2. OR Name matches logged-in user's username
        # 3. OR User is linked to the request
        # 4. OR for staff users, show all
        if user.is_staff:
            return ServiceRequest.objects.all()
        return ServiceRequest.objects.filter(
            models.Q(email=user.email) |
            models.Q(name=user.username) |
            models.Q(name__icontains=user.username) |
            models.Q(user=user)
        )