from rest_framework import generics
from .models import Notice
from .serializers import NoticeSerializer
from rest_framework.permissions import IsAuthenticated

class NoticeListCreateAPI(generics.ListCreateAPIView):
    queryset = Notice.objects.all().order_by('-is_pinned', '-created_at')
    serializer_class = NoticeSerializer
    permission_classes = [IsAuthenticated]

class NoticeDeleteAPI(generics.DestroyAPIView):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [IsAuthenticated]