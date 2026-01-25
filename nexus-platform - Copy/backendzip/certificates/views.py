from rest_framework import viewsets, permissions
from .models import IDCardLog, CertificateLog
from .serializers import IDCardLogSerializer, CertificateLogSerializer

class IDCardViewSet(viewsets.ModelViewSet):
    queryset = IDCardLog.objects.all().order_by('-issued_at')
    serializer_class = IDCardLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = CertificateLog.objects.all().order_by('-issued_at')
    serializer_class = CertificateLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)