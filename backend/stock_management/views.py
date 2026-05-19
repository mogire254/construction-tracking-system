from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Material
from .serializers import MaterialSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]