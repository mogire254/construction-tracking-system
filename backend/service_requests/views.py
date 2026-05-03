from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ServiceRequest.objects.all()
        return ServiceRequest.objects.filter(email=user.email) | ServiceRequest.objects.filter(user=user)
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        service_request = self.get_object()
        admin_response = request.data.get('admin_response')
        status_update = request.data.get('status')
        
        if admin_response:
            service_request.admin_response = admin_response
        if status_update:
            service_request.status = status_update
        service_request.save()
        
        return Response({'status': 'updated', 'message': 'Response sent to user'})
