from rest_framework import viewsets, permissions
from .models import Notice
from .serializers import NoticeSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.filter(is_active=True)
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    def get_queryset(self):
        # Optional: Filter based on who is asking
        # e.g., Students shouldn't see "Teacher Only" notices
        return super().get_queryset()