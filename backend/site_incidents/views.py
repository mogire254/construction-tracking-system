from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Incident
from .serializers import IncidentSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'user_id': user.id,
            'email': user.email
        })
    else:
        return Response({
            'success': False,
            'error': 'Invalid username or password'
        }, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if User.objects.filter(username=username).exists():
        return Response({
            'success': False,
            'error': 'Username already exists'
        }, status=400)
    
    if email and User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'error': 'Email already registered'
        }, status=400)
    
    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'user_id': user.id,
            'email': user.email,
            'message': 'Account created successfully!'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)


# Incident ViewSet - FIXED (removed reported_by filter)
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # For now, return all incidents (simplified)
        return Incident.objects.all()