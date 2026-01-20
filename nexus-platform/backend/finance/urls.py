from django.urls import path
from .views import CollectFeeAPI, DashboardStatsAPI

urlpatterns = [
    path('collect/', CollectFeeAPI.as_view(), name='collect-fee'),
    path('stats/', DashboardStatsAPI.as_view(), name='dashboard-stats'), # <--- ADD THIS
]