from django.shortcuts import render

# Create your views here.
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

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
            'user_id': user.id
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
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response({
            'success': False,
            'error': 'Username already exists'
        }, status=400)
    
    # Check if email already exists (if provided)
    if email and User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'error': 'Email already registered'
        }, status=400)
    
    # Create new user
    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        # Generate token for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'user_id': user.id,
            'message': 'Account created successfully!'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)
