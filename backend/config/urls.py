from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from construction_projects.views import ProjectViewSet
from site_incidents.views import login_view, register_view, IncidentViewSet
from service_requests.views import ServiceRequestViewSet
from stock_management.views import MaterialViewSet  # REMOVE MaterialUsageViewSet

# Create router for API endpoints
router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'service-requests', ServiceRequestViewSet)
router.register(r'materials', MaterialViewSet)
# DO NOT register material-usage

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/login/', login_view, name='login'),
    path('api/register/', register_view, name='register'),
]

# THIS IS REQUIRED FOR PHOTO UPLOADS
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)