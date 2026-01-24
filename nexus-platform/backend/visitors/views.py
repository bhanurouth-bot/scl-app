from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Visitor
from .serializers import VisitorSerializer

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().order_by('-check_in_time')
    serializer_class = VisitorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status') # 'ON_CAMPUS' or 'CHECKED_OUT'
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        visitor = self.get_object()
        
        if visitor.status == 'CHECKED_OUT':
            return Response({"error": "Visitor already checked out"}, status=400)
            
        visitor.status = 'CHECKED_OUT'
        visitor.check_out_time = timezone.now()
        visitor.save()
        
        return Response({
            "status": "success", 
            "check_out_time": visitor.check_out_time,
            "message": f"Goodbye, {visitor.name}!"
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = timezone.now().date()
        total_today = Visitor.objects.filter(check_in_time__date=today).count()
        active_now = Visitor.objects.filter(status='ON_CAMPUS').count()
        
        return Response({
            "total_today": total_today,
            "active_now": active_now
        })