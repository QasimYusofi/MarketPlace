from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator
from django.utils import timezone


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

    # Profile image binary data + metadata (store in MongoDB as binary)
    image_data = models.BinaryField(null=True, blank=True)
    image_content_type = models.CharField(max_length=100, null=True, blank=True)
    image_filename = models.CharField(max_length=255, null=True, blank=True)
    image_size = models.IntegerField(null=True, blank=True)
    image_uploaded_at = models.DateTimeField(null=True, blank=True)

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
        return bool(self.image_data)

    def get_profile_image_info(self):
        if not self.image_data:
            return None
        return {
            "filename": self.image_filename,
            "contentType": self.image_content_type,
            "size": self.image_size,
            "uploadedAt": self.image_uploaded_at,
            "hasData": True,
        }

    def update_profile_image(self, file_data):
        # file_data may be from DRF Upload: has .read(), .content_type, .name, .size
        buffer = None
        if hasattr(file_data, "read"):
            content = file_data.read()
            buffer = content
            self.image_filename = getattr(file_data, "name", None)
            self.image_content_type = getattr(file_data, "content_type", None)
            self.image_size = len(content)
        else:
            # dict-like input similar to your Next.js shape
            buffer = file_data.get("buffer") or file_data.get("data")
            self.image_filename = file_data.get("originalname") or file_data.get("filename")
            self.image_content_type = file_data.get("mimetype") or file_data.get("contentType")
            self.image_size = file_data.get("size")

        self.image_data = buffer
        self.image_uploaded_at = timezone.now()
        self.save(update_fields=[
            "image_data",
            "image_content_type",
            "image_filename",
            "image_size",
            "image_uploaded_at",
        ])
        return self

    def remove_profile_image(self):
        self.image_data = None
        self.image_content_type = None
        self.image_filename = None
        self.image_size = None
        self.image_uploaded_at = None
        self.save(update_fields=[
            "image_data",
            "image_content_type",
            "image_filename",
            "image_size",
            "image_uploaded_at",
        ])
        return self

    def get_image_as_base64(self):
        import base64

        if not self.image_data:
            return None
        b64 = base64.b64encode(self.image_data).decode("utf-8")
        ctype = self.image_content_type or "application/octet-stream"
        return f"data:{ctype};base64,{b64}"

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

    store_logo_data = models.BinaryField(null=True, blank=True)
    store_logo_content_type = models.CharField(max_length=100, null=True, blank=True)
    store_logo_filename = models.CharField(max_length=255, null=True, blank=True)
    store_logo_size = models.IntegerField(null=True, blank=True)
    store_logo_uploaded_at = models.DateTimeField(null=True, blank=True)
    
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
        return bool(self.store_logo_data)
    
    def get_store_logo_info(self):
        """Get store logo metadata"""
        if not self.store_logo_data:
            return None
        return {
            "filename": self.store_logo_filename,
            "contentType": self.store_logo_content_type,
            "size": self.store_logo_size,
            "uploadedAt": self.store_logo_uploaded_at,
            "hasData": True,
        }
    
    def update_store_logo(self, file_data):
        """Update store logo with new image data"""
        buffer = None
        if hasattr(file_data, "read"):
            content = file_data.read()
            buffer = content
            self.store_logo_filename = getattr(file_data, "name", None)
            self.store_logo_content_type = getattr(file_data, "content_type", None)
            self.store_logo_size = len(content)
        else:
            buffer = file_data.get("buffer") or file_data.get("data")
            self.store_logo_filename = file_data.get("originalname") or file_data.get("filename")
            self.store_logo_content_type = file_data.get("mimetype") or file_data.get("contentType")
            self.store_logo_size = file_data.get("size")
        
        self.store_logo_data = buffer
        self.store_logo_uploaded_at = timezone.now()
        self.save(update_fields=[
            "store_logo_data",
            "store_logo_content_type",
            "store_logo_filename",
            "store_logo_size",
            "store_logo_uploaded_at",
        ])
        return self
    
    def remove_store_logo(self):
        """Remove store logo"""
        self.store_logo_data = None
        self.store_logo_content_type = None
        self.store_logo_filename = None
        self.store_logo_size = None
        self.store_logo_uploaded_at = None
        self.save(update_fields=[
            "store_logo_data",
            "store_logo_content_type",
            "store_logo_filename",
            "store_logo_size",
            "store_logo_uploaded_at",
        ])
        return self
    
    def get_store_logo_as_base64(self):
        """Get store logo as base64 encoded string"""
        import base64
        
        if not self.store_logo_data:
            return None
        b64 = base64.b64encode(self.store_logo_data).decode("utf-8")
        ctype = self.store_logo_content_type or "application/octet-stream"
        return f"data:{ctype};base64,{b64}"
    
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
