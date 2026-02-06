from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator, MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta


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
        extra_fields.setdefault("user_type", "admin")

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
        choices=[('customer', 'Customer'), ('store_owner', 'Store Owner'), ('admin', 'Admin')],
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

    image = models.ImageField(null=True, blank=True, upload_to='users/')

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
        return self.image is not None

    def get_profile_image_info(self):
        if not self.image:
            return None
        return {
            "url": self.image.url,
            "hasUrl": True,
        }

    def update_profile_image(self, image):
        """Update profile image with image file"""
        if self.image:
            self.image.delete(save=False)
        self.image = image
        self.save(update_fields=["image"])
        return self

    def remove_profile_image(self):
        """Remove profile image"""
        if self.image:
            self.image.delete(save=False)
            self.image = None
            self.save(update_fields=["image"])
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

    store_logo = models.ImageField(null=True, blank=True, upload_to='store_logos/')
    
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
        return self.store_logo is not None

    def get_store_logo_info(self):
        """Get store logo metadata"""
        if not self.store_logo:
            return None
        return {
            "url": self.store_logo.url,
            "hasUrl": True,
        }

    def update_store_logo(self, logo):
        """Update store logo with image file"""
        if self.store_logo:
            self.store_logo.delete(save=False)
        self.store_logo = logo
        self.save(update_fields=["store_logo"])
        return self

    def remove_store_logo(self):
        """Remove store logo"""
        if self.store_logo:
            self.store_logo.delete(save=False)
            self.store_logo = None
            self.save(update_fields=["store_logo"])
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


class ProductImage(models.Model):
    """
    Product Image model for storing multiple images per product.
    """
    id = ObjectIdAutoField(primary_key=True)

    product = models.ForeignKey(
        'Product',
        related_name='images',
        on_delete=models.CASCADE,
        help_text="محصول مرتبط با تصویر"
    )
    image = models.ImageField(
        upload_to='products/',
        help_text="تصویر محصول"
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="آیا تصویر اصلی محصول است"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"

    def __str__(self):
        return f"Image for {self.product.title}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Ensure only one primary image per product
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)




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
    def add_image(self, images, is_primary=False):
        """Add image(s) to the product. Can handle single image or list of images."""
        if isinstance(images, list):
            added_images = []
            for i, image in enumerate(images):
                added = self._add_single_image(image, is_primary if i == 0 else False)
                added_images.append(added)
            return added_images
        else:
            return self._add_single_image(images, is_primary)

    def _add_single_image(self, image, is_primary=False):
        """Add a single image file to the product"""
        if is_primary:
            ProductImage.objects.filter(product=self, is_primary=True).update(is_primary=False)
        product_image = ProductImage.objects.create(
            product=self,
            image=image,
            is_primary=is_primary or not self.images.exists()  # First image is primary by default
        )
        return product_image

    def remove_image(self, image_id):
        """Remove an image by its ID"""
        try:
            product_image = ProductImage.objects.get(id=image_id, product=self)
            product_image.image.delete(save=False)  # Delete the file
            product_image.delete()
            # If we removed the primary image, make the first remaining image primary
            if product_image.is_primary and self.images.exists() and not self.images.filter(is_primary=True).exists():
                first_image = self.images.first()
                first_image.is_primary = True
                first_image.save()
            return product_image
        except ProductImage.DoesNotExist:
            return None

    def get_primary_image_url(self):
        """Get the primary image URL"""
        primary_img = self.images.filter(is_primary=True).first()
        return primary_img.image.url if primary_img else None

    def get_all_image_urls(self):
        """Get all image URLs"""
        return [img.image.url for img in self.images.all()]

    def set_primary_image(self, image_id):
        """Set an image as primary by its ID"""
        try:
            img = ProductImage.objects.get(id=image_id, product=self)
            ProductImage.objects.filter(product=self, is_primary=True).update(is_primary=False)
            img.is_primary = True
            img.save()
            return True
        except ProductImage.DoesNotExist:
            return False

    # Rating Methods
    def update_rating(self):
        """Recalculate product rating based on all individual ratings"""
        ratings = self.ratings.all()
        if ratings:
            ratings_list = [r.rating for r in ratings]
            average = sum(ratings_list) / len(ratings_list)
            count = len(ratings_list)
        else:
            average = 0
            count = 0

        self.rating = {
            "average": round(float(average), 2),
            "count": count
        }
        self.save(update_fields=["rating"])

    def add_rating(self, customer, rating_value):
        """Add a new rating from a customer"""
        # Create the rating (will raise IntegrityError if already exists due to unique constraint)
        ProductRating.objects.create(
            customer=customer,
            product=self,
            rating=rating_value
        )
        # Recalculate aggregate rating
        self.update_rating()
        return self

    # Analytics Methods
    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=["views"])

    def increment_sales(self):
        """Increment sales count"""
        self.sales_count += 1
        self.save(update_fields=["sales_count"])

class ProductRating(models.Model):
    """
    Product Rating model for storing individual customer ratings for products.
    Each customer can rate each product only once.
    """
    id = ObjectIdAutoField(primary_key=True)

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='product_ratings',
        help_text="مشتری که امتیاز داده است"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='ratings',
        help_text="محصول مورد امتیاز"
    )
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="امتیاز داده شده (0-5)",
        error_messages={
            'min_value': "امتیاز نمی‌تواند کمتر از 0 باشد",
            'max_value': "امتیاز نمی‌تواند بیشتر از 5 باشد"
        }
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product Rating"
        verbose_name_plural = "Product Ratings"
        # Unique constraint: each customer can rate each product only once
        constraints = [
            models.UniqueConstraint(
                fields=['customer', 'product'],
                name='unique_customer_product_rating'
            )
        ]
        indexes = [
            models.Index(fields=['customer', 'product']),
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.customer.full_name} rated {self.product.title}: {self.rating}"


class Cart(models.Model):
    """
    Cart model for storing user carts.
    Each cart item is stored as a dict in the items JSONField with keys:
    product_id (str), quantity (int), price_snapshot (float), color (str), size (str), owner_store_id (str)
    """
    user_id = models.OneToOneField(
        Customer,
        on_delete=models.CASCADE,
        unique=True,
        related_name='cart'
    )
    items = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user_id']),
        ]
        verbose_name = "Cart"
        verbose_name_plural = "Carts"

    def __str__(self):
        return f"Cart for {self.user_id.full_name}"


class OrderItem(models.Model):
    """
    Order Item model representing individual items in an order.
    """
    id = ObjectIdAutoField(primary_key=True)

    order = models.ForeignKey(
        'Order',
        on_delete=models.CASCADE,
        related_name='items',
        help_text="سفارش مرتبط"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        help_text="محصول"
    )
    title = models.CharField(
        max_length=255,
        help_text="عنوان محصول"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="قیمت محصول"
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="تعداد"
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="مجموع قیمت"
    )

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.title} x {self.quantity}"

    def save(self, *args, **kwargs):
        # Calculate total if not provided
        if not self.total:
            self.total = self.price * self.quantity
        super().save(*args, **kwargs)


class Order(models.Model):
    """
    Order model representing customer orders.
    """
    id = ObjectIdAutoField(primary_key=True)

    user = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='orders',
        help_text="کاربر سفارش‌دهنده"
    )
    store = models.ForeignKey(
        StoreOwner,
        on_delete=models.CASCADE,
        related_name='orders',
        help_text="فروشگاه"
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="مجموع مبلغ سفارش"
    )
    shipping_address = models.JSONField(
        default=dict,
        blank=True,
        help_text="آدرس ارسال"
    )

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار"
        PAID = "paid", "پرداخت شده"
        SHIPPED = "shipped", "ارسال شده"
        DELIVERED = "delivered", "تحویل شده"
        CANCELLED = "cancelled", "لغو شده"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="وضعیت سفارش"
    )
    payment_method = models.CharField(
        max_length=100,
        help_text="روش پرداخت"
    )
    tracking_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="شماره پیگیری"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.id} by {self.user.full_name}"

    def calculate_total(self):
        """Calculate total amount from order items"""
        total = sum(item.total for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total


class WishlistItem(models.Model):
    """
    Wishlist Item model representing individual items in a user's wishlist.
    """
    id = ObjectIdAutoField(primary_key=True)

    wishlist = models.ForeignKey(
        'Wishlist',
        on_delete=models.CASCADE,
        related_name='items',
        help_text="لیست علاقه‌مندی مرتبط"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        help_text="محصول"
    )
    added_at = models.DateTimeField(
        default=timezone.now,
        help_text="زمان اضافه شدن به لیست علاقه‌مندی"
    )

    class Meta:
        verbose_name = "Wishlist Item"
        verbose_name_plural = "Wishlist Items"
        indexes = [
            models.Index(fields=['added_at']),
        ]
        # Unique constraint: each product can appear only once per wishlist
        constraints = [
            models.UniqueConstraint(
                fields=['wishlist', 'product'],
                name='unique_wishlist_product'
            )
        ]

    def __str__(self):
        return f"{self.product.title} in {self.wishlist.user.full_name}'s wishlist"


class Comment(models.Model):
    """
    Comment model for product comments and replies.
    Customers can comment on products, store owners and admins can reply.
    """
    id = ObjectIdAutoField(primary_key=True)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="محصول مورد نظر"
    )
    author = models.ForeignKey(
        BaseUser,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="نویسنده نظر"
    )
    content = models.TextField(
        help_text="متن نظر",
        validators=[MinLengthValidator(1)],
        error_messages={'required': "متن نظر الزامی است"}
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        help_text="نظر والد (برای پاسخ‌ها)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.full_name} on {self.product.title}"

    @property
    def is_reply(self):
        """Check if this comment is a reply"""
        return self.parent is not None

    def get_replies(self):
        """Get all direct replies to this comment"""
        return self.replies.all()

    def can_reply(self, user):
        """Check if a user can reply to this comment"""
        if user.is_superuser:
            return True  # Admin can reply to any comment
        if user.user_type == 'store_owner' and self.product.store_owner == user:
            return True  # Store owner can reply to comments on their products
        return False


class Wishlist(models.Model):
    """
    Wishlist model representing a user's wishlist.
    Each user can have only one wishlist.
    """
    id = ObjectIdAutoField(primary_key=True)

    user = models.OneToOneField(
        Customer,
        on_delete=models.CASCADE,
        related_name='wishlist',
        help_text="کاربر صاحب لیست علاقه‌مندی"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Wishlist"
        verbose_name_plural = "Wishlists"
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Wishlist for {self.user.full_name}"

    @property
    def item_count(self):
        """Virtual for item count"""
        return self.items.count()

    @classmethod
    def find_by_user_id(cls, user_id):
        """Static method to find wishlist by user ID with populated products"""
        try:
            wishlist = cls.objects.select_related('user').prefetch_related(
                'items__product',
                'items__product__store_owner',
                'items__product__images'
            ).get(user_id=user_id)
            return wishlist
        except cls.DoesNotExist:
            return None

    @classmethod
    def is_product_in_wishlist(cls, user_id, product_id):
        """Static method to check if product is in user's wishlist"""
        return cls.objects.filter(
            user_id=user_id,
            items__product_id=product_id
        ).exists()

    def add_product(self, product_id):
        """Instance method to add product to wishlist"""
        if self.items.filter(product_id=product_id).exists():
            # Update added_at timestamp if already exists
            item = self.items.get(product_id=product_id)
            item.added_at = timezone.now()
            item.save()
            return {'added': False, 'message': 'Product already in wishlist'}
        else:
            # Add new item
            self.items.create(
                product_id=product_id,
                added_at=timezone.now()
            )
            return {'added': True, 'message': 'Product added to wishlist'}

    def remove_product(self, product_id):
        """Instance method to remove product from wishlist"""
        try:
            item = self.items.get(product_id=product_id)
            item.delete()
            return {'removed': True, 'message': 'Product removed from wishlist'}
        except WishlistItem.DoesNotExist:
            return {'removed': False, 'message': 'Product not found in wishlist'}

    def clear(self):
        """Instance method to clear wishlist"""
        self.items.all().delete()
        return {'cleared': True, 'message': 'Wishlist cleared'}

    def has_product(self, product_id):
        """Instance method to check if product exists in wishlist"""
        return self.items.filter(product_id=product_id).exists()

    def get_recent_items(self, days=30):
        """Instance method to get recently added items"""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.items.filter(added_at__gte=cutoff_date).order_by('-added_at')
