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


class User(AbstractBaseUser, PermissionsMixin):
    id = ObjectIdAutoField(primary_key=True)

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
    )
    phone = models.CharField(
        max_length=11,
        unique=True,
        validators=[phone_validator],
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

    class Roles(models.TextChoices):
        CUSTOMER = "customer", "customer"
        ADMIN = "admin", "admin"

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)

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

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    class Meta:
        indexes = [
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["role"]),
        ]
        verbose_name = "User"
        verbose_name_plural = "Users"

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
