from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Certificate
from .serializers import CertificateSerializer

class CertificateHistoryAPI(generics.ListAPIView):
    queryset = Certificate.objects.all().order_by('-issued_at')
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

class IssueCertificateAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # When you click "Print", the frontend calls this to log the action
        serializer = CertificateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(issued_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)