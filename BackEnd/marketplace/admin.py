from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(BaseUserAdmin):
    model = Customer
    list_display = (
        'id', 'phone', 'first_name', 'last_name', 'email', 'status', 'is_verified', 'is_staff', 'created_at'
    )
    list_filter = ('status', 'is_verified', 'is_staff', 'is_superuser')
    ordering = ('-created_at',)
    search_fields = ('phone', 'first_name', 'last_name', 'email')

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'city', 'post_code', 'birthday')}),
        ('Profile image', {'fields': ('image_filename', 'image_content_type', 'image_size', 'image_uploaded_at')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Status', {'fields': ('status', 'is_verified', 'last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'password1', 'password2', 'first_name', 'last_name', 'email', 'status', 'is_verified', 'is_staff', 'is_superuser'),
        }),
    )

    readonly_fields = ('last_login', 'created_at', 'updated_at', 'image_uploaded_at')
