from django.contrib import admin
from .models import FeeHead, FeeStructure, Invoice, InvoiceItem, Transaction

@admin.register(FeeHead)
class FeeHeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'fee_head', 'amount', 'academic_year')
    list_filter = ('academic_year', 'classroom')

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1

class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'student', 'total_amount', 'status', 'due_date')
    list_filter = ('status', 'academic_year')
    search_fields = ('invoice_number', 'student__student_id', 'student__user__first_name')
    inlines = [InvoiceItemInline, TransactionInline]
    # These fields are calculated, so make them read-only in admin
    readonly_fields = ('total_amount', 'paid_amount', 'balance_due')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'amount', 'payment_method', 'payment_date')
    list_filter = ('payment_method', 'payment_date')