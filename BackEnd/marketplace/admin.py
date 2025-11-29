from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Customer, StoreOwner, Product, ProductImage, ProductRating


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
        ('Profile image', {'fields': ('image_url',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Status', {'fields': ('status', 'is_verified', 'last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'password1', 'password2', 'first_name', 'last_name', 'email', 'status', 'is_verified', 'is_staff', 'is_superuser'),
        }),
    )

    readonly_fields = ('last_login', 'created_at', 'updated_at')


@admin.register(StoreOwner)
class StoreOwnerAdmin(BaseUserAdmin):
    model = StoreOwner
    list_display = (
        'id', 'phone', 'first_name', 'last_name', 'store_name', 'seller_status', 
        'store_type', 'is_verified', 'created_at'
    )
    list_filter = ('seller_status', 'store_type', 'is_verified', 'is_staff', 'is_superuser')
    ordering = ('-created_at',)
    search_fields = ('phone', 'first_name', 'last_name', 'email', 'store_name', 'store_domain')

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'city', 'post_code', 'birthday')}),
        ('Seller info', {
            'fields': (
                'seller_address', 'seller_license_id', 'seller_bio', 
                'seller_social_links', 'seller_status', 'seller_rating'
            )
        }),
        ('Profile image', {
            'fields': ('image_url',)
        }),
        ('Store info', {
            'fields': (
                'store_name', 'store_domain', 'store_description', 'store_type',
                'store_established_at', 'working_hours', 'supported_languages',
                'supported_currencies', 'terms_and_conditions', 'privacy_policy', 'store_rating'
            )
        }),
        ('Store logo', {
            'fields': ('store_logo_url',)
        }),
        ('Statistics', {
            'fields': ('active_products_count', 'total_sales', 'total_revenue')
        }),
        ('Payment', {'fields': ('payment_settings',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Status', {
            'fields': ('status', 'is_verified', 'last_login', 'seller_join_date', 'created_at', 'updated_at')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'phone', 'password1', 'password2', 'first_name', 'last_name', 
                'email', 'store_name', 'city', 'seller_status', 'store_type',
                'status', 'is_verified', 'is_staff', 'is_superuser'
            ),
        }),
    )

    readonly_fields = (
        'last_login', 'seller_join_date', 'created_at', 'updated_at',
        'active_products_count', 'total_sales', 'total_revenue'
    )


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0  # Do not show extra empty forms
    readonly_fields = ('created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]

    list_display = ('title', 'sku', 'price', 'compare_price', 'stock', 'category', 'status', 'store_owner', 'created_at')
    list_filter = ('status', 'category', 'store_owner')
    search_fields = ('title', 'sku')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('store_owner', 'title', 'description', 'sku')}),
        ('Pricing', {'fields': ('price', 'compare_price')}),
        ('Inventory', {'fields': ('stock',)}),
        ('Categorization', {'fields': ('category',)}),
        ('Attributes', {'fields': ('sizes', 'colors', 'tags')}),
        ('Status', {'fields': ('status',)}),
        ('Analytics', {'fields': ('views', 'sales_count', 'rating')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image', 'is_primary', 'created_at')
    list_filter = ('is_primary',)
    search_fields = ('product__title', 'product__sku')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(ProductRating)
class ProductRatingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'product', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('customer__first_name', 'customer__last_name', 'customer__phone', 'product__title', 'product__sku')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
