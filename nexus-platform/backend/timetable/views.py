from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import TimetableSlot
from .serializers import TimetableSlotSerializer
from academics.models import SubjectAllocation
import random

class TimetableSlotViewSet(viewsets.ModelViewSet):
    # OPTIMIZATION: Fetch relations to avoid N+1 in Grid View
    queryset = TimetableSlot.objects.select_related(
        'classroom', 'subject', 'teacher', 'teacher__user'
    ).all()
    serializer_class = TimetableSlotSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        classroom = self.request.query_params.get('classroom')
        if classroom:
            qs = qs.filter(classroom_id=classroom)
        return qs

    @action(detail=False, methods=['post'])
    def bulk_update_slots(self, request):
        slots_data = request.data.get('slots', [])
        classroom_id = request.data.get('classroom_id')
        if not classroom_id:
            return Response({"error": "Classroom ID required"}, status=400)

        with transaction.atomic():
            TimetableSlot.objects.filter(classroom_id=classroom_id).delete()
            serializer = self.get_serializer(data=slots_data, many=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            else:
                return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def auto_generate(self, request):
        """ SMARTER AI SCHEDULER """
        classroom_id = request.data.get('classroom_id')
        if not classroom_id:
            return Response({"error": "Classroom ID required"}, status=400)

        # 1. Grid Definition
        DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
        TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']
        
        # 2. Fetch Resources
        allocations = list(SubjectAllocation.objects.filter(classroom_id=classroom_id))
        if not allocations:
            return Response({"error": "No subjects assigned."}, status=400)

        created_slots = []
        
        # 3. Constraint Algorithm
        with transaction.atomic():
            TimetableSlot.objects.filter(classroom_id=classroom_id).delete()
            weekly_counts = {alloc.id: 0 for alloc in allocations}
            MAX_WEEKLY_QUOTA = 5

            for day in DAYS:
                daily_pool = allocations.copy()
                random.shuffle(daily_pool)
                daily_placed_subjects = set() 

                for time in TIMES:
                    for alloc in daily_pool:
                        if weekly_counts[alloc.id] >= MAX_WEEKLY_QUOTA: continue
                        if alloc.id in daily_placed_subjects: continue

                        is_teacher_busy = False
                        if alloc.teacher:
                            is_teacher_busy = TimetableSlot.objects.filter(
                                teacher=alloc.teacher,
                                day_of_week=day,
                                start_time=time
                            ).exists()
                        
                        if not is_teacher_busy:
                            slot = TimetableSlot.objects.create(
                                classroom_id=classroom_id,
                                day_of_week=day,
                                start_time=time,
                                end_time=self._calc_end_time(time),
                                subject=alloc.subject,
                                teacher=alloc.teacher
                            )
                            created_slots.append(slot)
                            weekly_counts[alloc.id] += 1
                            daily_placed_subjects.add(alloc.id)
                            break 

        return Response({"message": f"Generated {len(created_slots)} optimized slots.", "slots": len(created_slots)})

    def _calc_end_time(self, start_time):
        h, m = map(int, start_time.split(':'))
        return f"{h+1:02d}:{m:02d}"