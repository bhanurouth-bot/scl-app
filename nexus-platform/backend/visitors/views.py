from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Visitor
from .serializers import VisitorSerializer
from django.utils import timezone

class VisitorListCreateAPI(generics.ListCreateAPIView):
    queryset = Visitor.objects.all().order_by('-check_in_time')
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]

class CheckOutVisitorAPI(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            visitor = Visitor.objects.get(pk=pk)
            if visitor.status == 'CHECKED_OUT':
                return Response({"error": "Already checked out"}, status=400)
            
            visitor.status = 'CHECKED_OUT'
            visitor.check_out_time = timezone.now()
            visitor.save()
            return Response({"message": "Visitor Checked Out Successfully!"})
        except Visitor.DoesNotExist:
            return Response({"error": "Visitor not found"}, status=404)