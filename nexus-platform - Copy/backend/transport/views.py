from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Driver, Vehicle, Route, Stop, TransportAllocation, MaintenanceLog
from .serializers import (
    DriverSerializer, VehicleSerializer, RouteSerializer, 
    StopSerializer, TransportAllocationSerializer, MaintenanceLogSerializer
)

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
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
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer

class TransportAllocationViewSet(viewsets.ModelViewSet):
    queryset = TransportAllocation.objects.all()
    serializer_class = TransportAllocationSerializer

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.all().order_by('-date')
    serializer_class = MaintenanceLogSerializer