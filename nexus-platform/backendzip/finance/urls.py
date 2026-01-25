from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeHeadViewSet, FeeStructureViewSet, InvoiceViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'fee-heads', FeeHeadViewSet)
router.register(r'fee-structures', FeeStructureViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]