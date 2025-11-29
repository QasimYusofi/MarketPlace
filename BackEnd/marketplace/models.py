from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator, MinValueValidator


phone_validator = RegexValidator(
    regex=r"^09\d{9}$",
    message="شماره تماس باید با 09 شروع شود و 11 رقم باشد",
)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, phone, password, **extra_fields):
        if not phone:
            raise ValueError("Phone is required")
        user = self.model(phone=phone, **extra_fields)
        if not password:
            raise ValueError("Password is required")
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(phone, password, **extra_fields)


class BaseUser(AbstractBaseUser, PermissionsMixin):
    """
    Concrete base user model with common fields for all user types.
    Customer, StoreOwner, and Admin will inherit from this.
    """
    id = ObjectIdAutoField(primary_key=True)

    user_type = models.CharField(
        max_length=20,
        choices=[('customer', 'Customer'), ('store_owner', 'Store Owner')],
        default='customer',
    )


    first_name = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(2)],
    )
    last_name = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(2)],
    )
    email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
        error_messages={'unique': 'این ایمیل قبلاً استفاده شده است'},
    )

    phone = models.CharField(
        max_length=11,
        unique=True,
        validators=[phone_validator],
        error_messages={'unique': 'این شماره تماس قبلاً استفاده شده است'},
    )

    # password is provided by AbstractBaseUser via hashed storage

    post_code = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        validators=[RegexValidator(regex=r"^\d{10}$", message="کد پستی باید ۱۰ رقم باشد")],
    )
    birthday = models.DateField(null=True, blank=True)

    image_url = models.URLField(null=True, blank=True)

    city = models.CharField(max_length=50, null=True, blank=True)

    is_verified = models.BooleanField(default=False)

    class Status(models.TextChoices):
        ACTIVE = "active", "active"
        INACTIVE = "inactive", "inactive"
        BANNED = "banned", "banned"

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    # Django admin/permissions fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        indexes = [
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["user_type"]),
        ]
        verbose_name = "Base User"
        verbose_name_plural = "Base Users"

    @property
    def is_customer(self):
        return self.user_type == 'customer'

    @property
    def is_store_owner(self):
        return self.user_type == 'store_owner'


    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def has_profile_image(self):
        return bool(self.image_url)

    def get_profile_image_info(self):
        if not self.image_url:
            return None
        return {
            "url": self.image_url,
            "hasUrl": True,
        }

    def update_profile_image(self, image_url):
        """Update profile image with image URL"""
        self.image_url = image_url
        self.save(update_fields=["image_url"])
        return self

    def remove_profile_image(self):
        """Remove profile image URL"""
        self.image_url = None
        self.save(update_fields=["image_url"])
        return self

    def __str__(self):
        return self.full_name or self.phone


class Customer(BaseUser):
    """
    Customer user model - inherits all common fields from BaseUser.
    No role or is_superuser fields (those will be in Admin/StoreOwner models).
    """
    # Groups and user_permissions are inherited from BaseUser (PermissionsMixin)

    objects = UserManager()

    def save(self, *args, **kwargs):
        self.user_type = 'customer'
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"




# For backward compatibility and easier imports
User = Customer


class StoreOwnerManager(BaseUserManager):
    """Custom manager for StoreOwner model"""
    use_in_migrations = True

    def _create_store_owner(self, phone, password, store_name, **extra_fields):
        if not phone:
            raise ValueError("شماره تماس الزامی است")
        if not store_name:
            raise ValueError("نام فروشگاه الزامی است")
        
        store_owner = self.model(phone=phone, store_name=store_name, **extra_fields)
        if not password:
            raise ValueError("امز عبور الزامی است")
        store_owner.set_password(password)
        store_owner.save(using=self._db)
        return store_owner

    def create_store_owner(self, phone, password, store_name, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("seller_status", "approved")
        return self._create_store_owner(phone, password, store_name, **extra_fields)


class StoreOwner(BaseUser):
    """
    Store Owner model - inherits common fields from BaseUser.
    Represents sellers/vendors who own and manage stores.
    """
    
    # Override status choices for store owners
    class SellerStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        BLOCKED = "blocked", "Blocked"
    
    class StoreType(models.TextChoices):
        SINGLE_VENDOR = "single-vendor", "Single Vendor"
        MULTI_VENDOR = "multi-vendor", "Multi Vendor"
    
    # Store Information (Required)
    store_name = models.CharField(
        max_length=255,
        unique=True,
        validators=[MinLengthValidator(2)],
        help_text="نام فروشگاه",
        error_messages={'unique': 'این ایمیل قبلاً استفاده شده است'},

    )
    
    # Seller Information (Optional)
    seller_address = models.TextField(
        blank=True,
        default="",
        help_text="آدرس فروشنده"
    )
    seller_license_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="شناسه مجوز فروشنده"
    )
    seller_bio = models.TextField(
        blank=True,
        default="",
        help_text="بیوگرافی فروشنده"
    )
    seller_social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text="لینک‌های شبکه‌های اجتماعی"
    )
    seller_join_date = models.DateTimeField(
        auto_now_add=True,
        help_text="تاریخ عضویت فروشنده"
    )
    seller_status = models.CharField(
        max_length=20,
        choices=SellerStatus.choices,
        default=SellerStatus.APPROVED,
        help_text="وضعیت فروشنده"
    )
    seller_rating = models.JSONField(
        default=dict,
        blank=True,
        help_text="امتیاز فروشنده (average, count)"
    )
    
    # Store Logo Image (separate from profile image)

    store_logo_url = models.URLField(null=True, blank=True)
    
    # Store Details
    store_domain = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="دامنه فروشگاه"
    )
    store_description = models.TextField(
        blank=True,
        default="",
        help_text="توضیحات فروشگاه"
    )
    store_type = models.CharField(
        max_length=20,
        choices=StoreType.choices,
        default=StoreType.SINGLE_VENDOR,
        help_text="نوع فروشگاه"
    )
    store_established_at = models.DateField(
        null=True,
        blank=True,
        help_text="تاریخ تاسیس فروشگاه"
    )
    working_hours = models.JSONField(
        default=dict,
        blank=True,
        help_text="ساعات کاری"
    )
    supported_languages = models.JSONField(
        default=list,
        blank=True,
        help_text="زبان‌های پشتیبانی شده"
    )
    supported_currencies = models.JSONField(
        default=list,
        blank=True,
        help_text="واحدهای پولی پشتیبانی شده"
    )
    terms_and_conditions = models.TextField(
        blank=True,
        default="",
        help_text="شرایط و ضوابط"
    )
    privacy_policy = models.TextField(
        blank=True,
        default="",
        help_text="سیاست حفظ حریم خصوصی"
    )
    store_rating = models.JSONField(
        default=dict,
        blank=True,
        help_text="امتیاز فروشگاه (average, count)"
    )
    
    # Statistics
    active_products_count = models.IntegerField(
        default=0,
        help_text="تعداد محصولات فعال"
    )
    total_sales = models.IntegerField(
        default=0,
        help_text="تعداد کل فروش"
    )
    total_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="درآمد کل"
    )
    
    # Payment Settings
    payment_settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="تنظیمات پرداخت"
    )
    
    objects = StoreOwnerManager()

    class Meta:
        indexes = [
            models.Index(fields=["store_name"]),
            models.Index(fields=["seller_status"]),
            models.Index(fields=["store_type"]),
        ]
        verbose_name = "Store Owner"
        verbose_name_plural = "Store Owners"


    def __str__(self):
        return f"{self.store_name} - {self.full_name}"

    def save(self, *args, **kwargs):
        self.user_type = 'store_owner'
        # Initialize default values for JSON fields if empty
        if not self.seller_rating:
            self.seller_rating = {"average": 0, "count": 0}
        if not self.store_rating:
            self.store_rating = {"average": 0, "count": 0}
        if not self.supported_languages:
            self.supported_languages = ["fa"]
        if not self.supported_currencies:
            self.supported_currencies = ["IRR"]
        if not self.seller_social_links:
            self.seller_social_links = {}
        if not self.working_hours:
            self.working_hours = {}
        if not self.payment_settings:
            self.payment_settings = {}
        super().save(*args, **kwargs)

    
    # Store Logo Methods
    def has_store_logo(self):
        """Check if store has a logo"""
        return bool(self.store_logo_url)

    def get_store_logo_info(self):
        """Get store logo metadata"""
        if not self.store_logo_url:
            return None
        return {
            "url": self.store_logo_url,
            "hasUrl": True,
        }

    def update_store_logo(self, logo_url):
        """Update store logo with image URL"""
        self.store_logo_url = logo_url
        self.save(update_fields=["store_logo_url"])
        return self

    def remove_store_logo(self):
        """Remove store logo URL"""
        self.store_logo_url = None
        self.save(update_fields=["store_logo_url"])
        return self
    
    # Rating Methods
    def update_seller_rating(self, new_rating):
        """Update seller rating with new rating value"""
        current = self.seller_rating or {"average": 0, "count": 0}
        count = current.get("count", 0)
        average = current.get("average", 0)
        
        new_count = count + 1
        new_average = ((average * count) + new_rating) / new_count
        
        self.seller_rating = {
            "average": round(new_average, 2),
            "count": new_count
        }
        self.save(update_fields=["seller_rating"])
    
    def update_store_rating(self, new_rating):
        """Update store rating with new rating value"""
        current = self.store_rating or {"average": 0, "count": 0}
        count = current.get("count", 0)
        average = current.get("average", 0)
        
        new_count = count + 1
        new_average = ((average * count) + new_rating) / new_count
        
        self.store_rating = {
            "average": round(new_average, 2),
            "count": new_count
        }
        self.save(update_fields=["store_rating"])
    
    # Statistics Methods
    def increment_sales(self, amount):
        """Increment total sales and revenue"""
        self.total_sales += 1
        self.total_revenue += amount
        self.save(update_fields=["total_sales", "total_revenue"])
    
    def update_active_products_count(self, count):
        """Update active products count"""
        self.active_products_count = count
        self.save(update_fields=["active_products_count"])


class Product(models.Model):
    """
    Product model representing items sold by store owners.
    Each product belongs to a store owner.
    """
    id = ObjectIdAutoField(primary_key=True)

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        DRAFT = "draft", "Draft"
        OUT_OF_STOCK = "out_of_stock", "Out of Stock"

    class Category(models.TextChoices):
        MEN = "men", "Men"
        WOMEN = "women", "Women"
        KIDS = "kids", "Kids"
        BABY = "baby", "Baby"

    # Foreign Key to StoreOwner
    store_owner = models.ForeignKey(
        StoreOwner,
        on_delete=models.CASCADE,
        related_name='products',
        help_text="فروشنده صاحب محصول"
    )

    # Basic Product Information
    title = models.CharField(
        max_length=255,
        help_text="عنوان محصول",
        error_messages={'required': "عنوان محصول الزامی است"}
    )
    description = models.TextField(
        help_text="توضیحات محصول",
        error_messages={'required': "توضیحات محصول الزامی است"}
    )
    sku = models.CharField(
        max_length=100,
        help_text="کد محصول",
        error_messages={'required': "کد محصول الزامی است"}
    )

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="قیمت محصول",
        error_messages={
            'required': "قیمت محصول الزامی است",
            'min_value': "قیمت نمی‌تواند منفی باشد"
        }
    )
    compare_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="قیمت مقایسه (برای تخفیف)",
        error_messages={'min_value': "قیمت مقایسه نمی‌تواند منفی باشد"}
    )

    # Inventory
    stock = models.PositiveIntegerField(
        default=0,
        help_text="موجودی محصول",
        error_messages={'required': "موجودی محصول الزامی است"}
    )

    # Categorization
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        help_text="دسته‌بندی محصول",
        error_messages={'required': "دسته‌بندی محصول الزامی است"}
    )

    # Product Attributes (stored as JSON)
    sizes = models.JSONField(
        default=list,
        blank=True,
        help_text="سایزهای محصول"
    )
    colors = models.JSONField(
        default=list,
        blank=True,
        help_text="رنگ‌های محصول"
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="برچسب‌های محصول"
    )

    # Product Images (stored as JSON list of URLs)
    image_urls = models.JSONField(
        default=list,
        blank=True,
        help_text="تصاویر محصول (لیست URLها)"
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text="وضعیت محصول"
    )

    # Analytics
    views = models.PositiveIntegerField(
        default=0,
        help_text="تعداد بازدیدها"
    )
    sales_count = models.PositiveIntegerField(
        default=0,
        help_text="تعداد فروش"
    )

    # Rating system
    rating = models.JSONField(
        default=dict,
        blank=True,
        help_text="امتیاز محصول (average, count)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Compound unique index for SKU per store owner
        constraints = [
            models.UniqueConstraint(
                fields=['store_owner', 'sku'],
                name='unique_sku_per_store_owner'
            )
        ]
        indexes = [
            models.Index(fields=['store_owner', 'sku']),
            models.Index(fields=['store_owner', 'status']),
            models.Index(fields=['store_owner', 'category']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return f"{self.title} - {self.sku}"

    def save(self, *args, **kwargs):
        # Initialize rating if empty
        if not self.rating:
            self.rating = {"average": 0, "count": 0}
        super().save(*args, **kwargs)

    # Product Properties
    @property
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock > 0

    @property
    def is_low_stock(self):
        """Check if product is low in stock (10 or fewer items)"""
        return self.stock > 0 and self.stock <= 10

    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.compare_price and self.compare_price > self.price:
            return round((1 - self.price / self.compare_price) * 100)
        return 0

    # Product Image Methods
    def add_image_url(self, image_url):
        """Add an image URL to the product"""
        if not isinstance(self.image_urls, list):
            self.image_urls = []

        # Create image object
        image_obj = {
            'url': image_url,
            'isPrimary': len(self.image_urls) == 0,  # First image is primary by default
        }

        self.image_urls.append(image_obj)
        self.save(update_fields=["image_urls"])  # Save after adding
        return image_obj

    def remove_image_url(self, index):
        """Remove an image URL by index"""
        if isinstance(self.image_urls, list) and 0 <= index < len(self.image_urls):
            removed_image = self.image_urls.pop(index)
            # If we removed the primary image, make the first remaining image primary
            if removed_image.get('isPrimary') and self.image_urls:
                self.image_urls[0]['isPrimary'] = True
                self.save(update_fields=["image_urls"])
            return removed_image
        return None

    def get_primary_image_url(self):
        """Get the primary image URL"""
        if isinstance(self.image_urls, list):
            for image in self.image_urls:
                if image.get('isPrimary'):
                    return image.get('url')
        return None

    def get_all_image_urls(self):
        """Get all image URLs"""
        if isinstance(self.image_urls, list):
            return [img.get('url') for img in self.image_urls if img.get('url')]
        return []

    def set_primary_image_url(self, index):
        """Set an image as primary by index"""
        if isinstance(self.image_urls, list) and 0 <= index < len(self.image_urls):
            # Reset all images to non-primary
            for img in self.image_urls:
                img['isPrimary'] = False
            # Set the specified image as primary
            self.image_urls[index]['isPrimary'] = True
            self.save(update_fields=["image_urls"])
            return True
        return False

    # Rating Methods
    def update_rating(self, new_rating):
        """Update product rating with new rating value"""
        current = self.rating or {"average": 0, "count": 0}
        count = current.get("count", 0)
        average = current.get("average", 0)

        new_count = count + 1
        new_average = ((average * count) + new_rating) / new_count

        self.rating = {
            "average": round(new_average, 2),
            "count": new_count
        }
        self.save(update_fields=["rating"])

    # Analytics Methods
    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=["views"])

    def increment_sales(self):
        """Increment sales count"""
        self.sales_count += 1
        self.save(update_fields=["sales_count"])
