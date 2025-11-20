from rest_framework import serializers
from django.utils import timezone
from .models import Customer, StoreOwner


class CustomerSerializer(serializers.ModelSerializer):
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.ReadOnlyField()
    has_profile_image = serializers.SerializerMethodField()
    profile_image_info = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'post_code',
            'birthday',
            'city',
            'is_verified',
            'status',
            'last_login',
            'created_at',
            'updated_at',
            'full_name',
            'has_profile_image',
            'profile_image_info',
        ]
        read_only_fields = ['id', 'is_verified', 'last_login', 'created_at', 'updated_at', 'has_profile_image', 'profile_image_info', 'full_name']

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_has_profile_image(self, obj):
        return obj.has_profile_image()

    def get_profile_image_info(self, obj):
        info = obj.get_profile_image_info()
        return info

    def validate_birthday(self, value):
        if value and value >= timezone.now().date():
            raise serializers.ValidationError("تاریخ تولد باید در گذشته باشد")
        return value

    

    def create(self, validated_data):
        password = self.initial_data.get('password')
        customer = Customer(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            post_code=validated_data.get('post_code'),
            birthday=validated_data.get('birthday'),
            city=validated_data.get('city'),
            status=validated_data.get('status', Customer.Status.ACTIVE),
        )
        if password:
            customer.set_password(password)
        else:
            raise serializers.ValidationError({"password": "رمز عبور الزامی است"})
        customer.save()
        return customer

    def update(self, instance, validated_data):
        for field in ['first_name', 'last_name', 'email', 'phone', 'post_code', 'birthday', 'city', 'status']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        password = self.initial_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# For backward compatibility
UserSerializer = CustomerSerializer


class StoreOwnerSerializer(serializers.ModelSerializer):
    """Serializer for StoreOwner model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.ReadOnlyField()
    has_profile_image = serializers.SerializerMethodField()
    profile_image_info = serializers.SerializerMethodField()
    has_store_logo = serializers.SerializerMethodField()
    store_logo_info = serializers.SerializerMethodField()

    class Meta:
        model = StoreOwner
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'post_code',
            'birthday',
            'city',
            'is_verified',
            'status',
            'last_login',
            'created_at',
            'updated_at',
            'full_name',
            'has_profile_image',
            'profile_image_info',
            # Store Owner specific fields
            'store_name',
            'seller_address',
            'seller_license_id',
            'seller_bio',
            'seller_social_links',
            'seller_join_date',
            'seller_status',
            'seller_rating',
            'has_store_logo',
            'store_logo_info',
            'store_domain',
            'store_description',
            'store_type',
            'store_established_at',
            'working_hours',
            'supported_languages',
            'supported_currencies',
            'terms_and_conditions',
            'privacy_policy',
            'store_rating',
            'active_products_count',
            'total_sales',
            'total_revenue',
            'payment_settings',
        ]
        read_only_fields = [
            'id',
            'is_verified',
            'last_login',
            'created_at',
            'updated_at',
            'seller_join_date',
            'has_profile_image',
            'profile_image_info',
            'full_name',
            'has_store_logo',
            'store_logo_info',
            'active_products_count',
            'total_sales',
            'total_revenue',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_has_profile_image(self, obj):
        return obj.has_profile_image()

    def get_profile_image_info(self, obj):
        return obj.get_profile_image_info()

    def get_has_store_logo(self, obj):
        return obj.has_store_logo()

    def get_store_logo_info(self, obj):
        return obj.get_store_logo_info()

    def validate_store_name(self, value):
        """Validate store name uniqueness and format"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("نام فروشگاه باید حداقل 2 کاراکتر باشد")
        
        # Check uniqueness for create or update
        if self.instance:
            # Update case - exclude current instance
            if StoreOwner.objects.exclude(id=self.instance.id).filter(store_name=value).exists():
                raise serializers.ValidationError("این نام فروشگاه قبلاً استفاده شده است")
        else:
            # Create case
            if StoreOwner.objects.filter(store_name=value).exists():
                raise serializers.ValidationError("این نام فروشگاه قبلاً استفاده شده است")
        
        return value.strip()

    def validate_birthday(self, value):
        """Validate birthday is in the past"""
        if value and value >= timezone.now().date():
            raise serializers.ValidationError("تاریخ تولد باید در گذشته باشد")
        return value

    def validate_store_established_at(self, value):
        """Validate store establishment date is not in the future"""
        if value and value > timezone.now().date():
            raise serializers.ValidationError("تاریخ تاسیس فروشگاه نمی‌تواند در آینده باشد")
        return value

    def validate_phone(self, value):
        """Validate phone number format and uniqueness"""
        # Check uniqueness for create or update
        if self.instance:
            # Update case - exclude current instance
            if StoreOwner.objects.exclude(id=self.instance.id).filter(phone=value).exists():
                raise serializers.ValidationError("این شماره تماس قبلاً استفاده شده است")
        else:
            # Create case
            if StoreOwner.objects.filter(phone=value).exists():
                raise serializers.ValidationError("این شماره تماس قبلاً استفاده شده است")
        
        return value

    def validate_email(self, value):
        """Validate email uniqueness if provided"""
        if value:
            # Check uniqueness for create or update
            if self.instance:
                # Update case - exclude current instance
                if StoreOwner.objects.exclude(id=self.instance.id).filter(email=value).exists():
                    raise serializers.ValidationError("این ایمیل قبلاً استفاده شده است")
            else:
                # Create case
                if StoreOwner.objects.filter(email=value).exists():
                    raise serializers.ValidationError("این ایمیل قبلاً استفاده شده است")
        
        return value

    def validate_seller_rating(self, value):
        """Validate seller rating structure"""
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("امتیاز فروشنده باید یک شیء باشد")
        
        if value:
            if 'average' in value and (value['average'] < 0 or value['average'] > 5):
                raise serializers.ValidationError("میانگین امتیاز باید بین 0 تا 5 باشد")
            if 'count' in value and value['count'] < 0:
                raise serializers.ValidationError("تعداد امتیازها نمی‌تواند منفی باشد")
        
        return value

    def validate_store_rating(self, value):
        """Validate store rating structure"""
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("امتیاز فروشگاه باید یک شیء باشد")
        
        if value:
            if 'average' in value and (value['average'] < 0 or value['average'] > 5):
                raise serializers.ValidationError("میانگین امتیاز باید بین 0 تا 5 باشد")
            if 'count' in value and value['count'] < 0:
                raise serializers.ValidationError("تعداد امتیازها نمی‌تواند منفی باشد")
        
        return value

    def create(self, validated_data):
        """Create a new store owner with password hashing"""
        password = self.initial_data.get('password')
        
        if not password:
            raise serializers.ValidationError({"password": "رمز عبور الزامی است"})
        
        # Extract fields
        store_owner = StoreOwner(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            post_code=validated_data.get('post_code'),
            birthday=validated_data.get('birthday'),
            city=validated_data.get('city'),
            status=validated_data.get('status', StoreOwner.Status.ACTIVE),
            # Store owner specific fields
            store_name=validated_data.get('store_name'),
            seller_address=validated_data.get('seller_address', ''),
            seller_license_id=validated_data.get('seller_license_id'),
            seller_bio=validated_data.get('seller_bio', ''),
            seller_social_links=validated_data.get('seller_social_links', {}),
            seller_status=validated_data.get('seller_status', StoreOwner.SellerStatus.APPROVED),
            seller_rating=validated_data.get('seller_rating', {"average": 0, "count": 0}),
            store_domain=validated_data.get('store_domain'),
            store_description=validated_data.get('store_description', ''),
            store_type=validated_data.get('store_type', StoreOwner.StoreType.SINGLE_VENDOR),
            store_established_at=validated_data.get('store_established_at'),
            working_hours=validated_data.get('working_hours', {}),
            supported_languages=validated_data.get('supported_languages', ['fa']),
            supported_currencies=validated_data.get('supported_currencies', ['IRR']),
            terms_and_conditions=validated_data.get('terms_and_conditions', ''),
            privacy_policy=validated_data.get('privacy_policy', ''),
            store_rating=validated_data.get('store_rating', {"average": 0, "count": 0}),
            payment_settings=validated_data.get('payment_settings', {}),
        )
        
        store_owner.set_password(password)
        store_owner.save()
        return store_owner

    def update(self, instance, validated_data):
        """Update store owner instance"""
        # Update basic fields
        for field in [
            'first_name', 'last_name', 'email', 'phone', 'post_code', 
            'birthday', 'city', 'status', 'store_name', 'seller_address',
            'seller_license_id', 'seller_bio', 'seller_social_links',
            'seller_status', 'store_domain', 'store_description', 'store_type',
            'store_established_at', 'working_hours', 'supported_languages',
            'supported_currencies', 'terms_and_conditions', 'privacy_policy',
            'payment_settings'
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        # Handle password update if provided
        password = self.initial_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
