from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import WorkerCategory, Worker, DailyAttendance
from .serializers import WorkerCategorySerializer, WorkerSerializer, DailyAttendanceSerializer

class WorkerCategoryViewSet(viewsets.ModelViewSet):
    queryset = WorkerCategory.objects.all()
    serializer_class = WorkerCategorySerializer
    permission_classes = [IsAuthenticated]

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated]

class DailyAttendanceViewSet(viewsets.ModelViewSet):
    queryset = DailyAttendance.objects.all()
    serializer_class = DailyAttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)