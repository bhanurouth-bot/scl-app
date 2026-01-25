from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Driver, Vehicle, Route, Stop, TransportAllocation, MaintenanceLog
from .serializers import (
    DriverSerializer, VehicleSerializer, RouteSerializer, 
    StopSerializer, TransportAllocationSerializer, MaintenanceLogSerializer
)

class DriverViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link to Employee/User
    queryset = Driver.objects.select_related('employee', 'employee__user').all()
    serializer_class = DriverSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link to Driver
    queryset = Vehicle.objects.select_related('driver', 'driver__employee__user').all()
    serializer_class = VehicleSerializer

    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        vehicle = self.get_object()
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        if lat and lng:
            vehicle.latitude = lat
            vehicle.longitude = lng
            vehicle.save()
            return Response({'status': 'Location updated'})
        return Response({'error': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)

class RouteViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Vehicle and prefetch Stops
    queryset = Route.objects.select_related('vehicle').prefetch_related('stops').all()
    serializer_class = RouteSerializer

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.select_related('route').all()
    serializer_class = StopSerializer

class TransportAllocationViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Link Student, Route, and Stop
    queryset = TransportAllocation.objects.select_related(
        'student', 'student__user', 'route', 'pickup_stop'
    ).all()
    serializer_class = TransportAllocationSerializer

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.select_related('vehicle').all().order_by('-date')
    serializer_class = MaintenanceLogSerializer