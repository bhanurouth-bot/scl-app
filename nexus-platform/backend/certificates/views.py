from rest_framework import viewsets, permissions
from .models import IDCardLog, CertificateLog
from .serializers import IDCardLogSerializer, CertificateLogSerializer

class IDCardViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION
    queryset = IDCardLog.objects.select_related('student', 'student__user').all().order_by('-issued_at')
    serializer_class = IDCardLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class CertificateViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION
    queryset = CertificateLog.objects.select_related('student', 'student__user', 'issued_by').all().order_by('-issued_at')
    serializer_class = CertificateLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)