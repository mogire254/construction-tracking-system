from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import WorkLog
from .serializers import WorkLogSerializer

class WorkLogViewSet(viewsets.ModelViewSet):
    queryset = WorkLog.objects.all()
    serializer_class = WorkLogSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)