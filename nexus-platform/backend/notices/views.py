from rest_framework import viewsets, permissions
from .models import Notice
from .serializers import NoticeSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION
    queryset = Notice.objects.select_related('posted_by').filter(is_active=True)
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)