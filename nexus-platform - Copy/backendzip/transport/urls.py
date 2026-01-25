from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverViewSet, VehicleViewSet, RouteViewSet, 
    StopViewSet, TransportAllocationViewSet, MaintenanceLogViewSet
)

router = DefaultRouter()
router.register(r'drivers', DriverViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'stops', StopViewSet)
router.register(r'allocations', TransportAllocationViewSet)
router.register(r'maintenance', MaintenanceLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]