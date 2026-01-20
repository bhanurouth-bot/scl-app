from rest_framework import generics
from .models import Student
from .serializers import StudentSerializer, StudentDetailSerializer # <--- Update Import
from rest_framework.permissions import IsAuthenticated

class StudentSearchAPI(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            # Search by Name OR Student ID
            return Student.objects.filter(
                first_name__icontains=query
            ) | Student.objects.filter(
                student_id__icontains=query
            )
        return Student.objects.none() # Return nothing if no search
    
class StudentListCreateAPI(generics.ListCreateAPIView):
    queryset = Student.objects.all().order_by('-created_at') # Newest first
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

class StudentRetrieveAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentDetailSerializer # Use the detailed one
    permission_classes = [IsAuthenticated]