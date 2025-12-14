from rest_framework import serializers
from django.utils import timezone
from .models import Customer, StoreOwner, Product, ProductRating,ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductImage
        fields = [
            'id',
            'image',
            'is_primary',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

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
            'image',
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
            image=validated_data.get('image'),
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
        for field in ['first_name', 'last_name', 'email', 'phone', 'post_code', 'birthday', 'image', 'city', 'status']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        password = self.initial_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    store_owner = serializers.SerializerMethodField(read_only=True)

    # Computed fields
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    images_count = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'store_owner',
            'title',
            'description',
            'sku',
            'price',
            'compare_price',
            'stock',
            'category',
            'sizes',
            'colors',
            'tags',
            'status',
            'views',
            'sales_count',
            'rating',
            'created_at',
            'updated_at',
            'is_in_stock',
            'is_low_stock',
            'discount_percentage',
            'images_count',
            'images',
        ]
        read_only_fields = [
            'id',
            'store_owner',
            'views',
            'sales_count',
            'created_at',
            'updated_at',
            'is_in_stock',
            'is_low_stock',
            'discount_percentage',
            'images_count',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None
    def get_images(self, obj):
        images = obj.images.all().order_by('-is_primary', 'created_at')
        return ProductImageSerializer(images, many=True, context=self.context).data

    def get_store_owner(self, obj):
        """Return store owner basic info"""
        return {
            'id': str(obj.store_owner.id),
            'store_name': obj.store_owner.store_name,
            'full_name': obj.store_owner.full_name,
        }

    def get_images_count(self, obj):
        """Return number of images"""
        return obj.images.count()

    def validate_sku(self, value):
        """Validate SKU uniqueness per store owner"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            if hasattr(user, 'user_type') and user.user_type == 'store_owner':
                # Check uniqueness for create or update
                try:
                    store_owner = StoreOwner.objects.get(id=user.id)
                    query = Product.objects.filter(store_owner=store_owner, sku=value)
                    if self.instance:
                        query = query.exclude(id=self.instance.id)
                    if query.exists():
                        raise serializers.ValidationError("این کد محصول قبلاً برای این فروشگاه استفاده شده است")
                except StoreOwner.DoesNotExist:
                    pass  # If store owner not found, skip uniqueness check

        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("کد محصول الزامی است")

        return value.strip()

    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("قیمت باید بزرگ‌تر از صفر باشد")
        return value

    def validate_compare_price(self, value):
        """Validate compare price"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("قیمت مقایسه باید بزرگ‌تر از صفر باشد")
        return value

    def validate_stock(self, value):
        """Validate stock is not negative"""
        if value < 0:
            raise serializers.ValidationError("موجودی نمی‌تواند منفی باشد")
        return value

    def validate_sizes(self, value):
        """Validate sizes is a list of strings"""
        if value and not isinstance(value, list):
            raise serializers.ValidationError("سایزها باید یک لیست از رشته‌ها باشد")
        if value:
            for size in value:
                if not isinstance(size, str):
                    raise serializers.ValidationError("هر سایز باید یک رشته باشد")
        return value

    def validate_colors(self, value):
        """Validate colors is a list of strings"""
        if value and not isinstance(value, list):
            raise serializers.ValidationError("رنگ‌ها باید یک لیست از رشته‌ها باشد")
        if value:
            for color in value:
                if not isinstance(color, str):
                    raise serializers.ValidationError("هر رنگ باید یک رشته باشد")
        return value

    def validate_tags(self, value):
        """Validate tags is a list of strings"""
        if value and not isinstance(value, list):
            raise serializers.ValidationError("برچسب‌ها باید یک لیست از رشته‌ها باشد")
        if value:
            for tag in value:
                if not isinstance(tag, str):
                    raise serializers.ValidationError("هر برچسب باید یک رشته باشد")
        return value

    def validate_rating(self, value):
        """Validate rating structure"""
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("امتیاز باید یک شیء باشد")

        if value:
            if 'average' in value and (value['average'] < 0 or value['average'] > 5):
                raise serializers.ValidationError("میانگین امتیاز باید بین 0 تا 5 باشد")
            if 'count' in value and value['count'] < 0:
                raise serializers.ValidationError("تعداد امتیازها نمی‌تواند منفی باشد")

        return value

    def create(self, validated_data):
        """Create a new product"""
        # Get store owner from context
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user
        if not hasattr(user, 'user_type') or user.user_type != 'store_owner':
            raise serializers.ValidationError("فقط صاحبان فروشگاه می‌توانند محصول ایجاد کنند")

        # Get the StoreOwner instance
        try:
            store_owner = StoreOwner.objects.get(id=user.id)
        except StoreOwner.DoesNotExist:
            raise serializers.ValidationError("فروشگاه یافت نشد")

        # Set store owner
        validated_data['store_owner'] = store_owner

        # Create product
        product = Product.objects.create(**validated_data)
        return product

    def update(self, instance, validated_data):
        """Update product instance"""
        # Update fields
        for field in [
            'title', 'description', 'sku', 'price', 'compare_price',
            'stock', 'category', 'sizes', 'colors', 'tags',
            'status', 'rating'
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance


class ProductRatingSerializer(serializers.ModelSerializer):
    """Serializer for ProductRating model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    customer = serializers.SerializerMethodField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductRating
        fields = [
            'id',
            'customer',
            'product',
            'rating',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_customer(self, obj):
        """Return customer basic info"""
        return {
            'id': str(obj.customer.id),
            'full_name': obj.customer.full_name,
            'phone': obj.customer.phone,
        }

    def get_product(self, obj):
        """Return product basic info"""
        return {
            'id': str(obj.product.id),
            'title': obj.product.title,
            'sku': obj.product.sku,
        }

    def validate_rating(self, value):
        """Validate rating is between 0 and 5"""
        if not isinstance(value, (int, float, str)):
            raise serializers.ValidationError("امتیاز باید یک عدد باشد")

        try:
            rating = float(value)
            if rating < 0 or rating > 5:
                raise serializers.ValidationError("امتیاز باید بین 0 تا 5 باشد")
        except (ValueError, TypeError):
            raise serializers.ValidationError("امتیاز باید یک عدد معتبر باشد")

        return rating

    def create(self, validated_data):
        """Create a new product rating"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user
        if not hasattr(user, 'user_type') or user.user_type != 'customer':
            raise serializers.ValidationError("فقط مشتریان می‌توانند امتیاز دهند")

        # Get product id from URL
        product_id = self.context.get('product_id')
        if not product_id:
            raise serializers.ValidationError("شناسه محصول یافت نشد")

        # Get the Product and Customer instances
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول یافت نشد")

        try:
            customer = Customer.objects.get(id=user.id)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("مشتری یافت نشد")

        # Set customer and product
        validated_data['customer'] = customer
        validated_data['product'] = product

        # Create rating - this will handle the unique constraint
        try:
            rating = ProductRating.objects.create(**validated_data)
            # Update product's aggregate rating
            product.update_rating()
            return rating
        except Exception as e:
            if 'unique_customer_product_rating' in str(e):
                raise serializers.ValidationError("شما قبلاً به این محصول امتیاز داده‌اید")
            raise serializers.ValidationError("خطا در ایجاد امتیاز")

    def update(self, instance, validated_data):
        """Update rating instance"""
        # Only allow updating rating value
        if 'rating' in validated_data:
            instance.rating = validated_data['rating']
            instance.save()
            # Update product's aggregate rating
            instance.product.update_rating()
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
            'image',
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
            'store_logo',
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
            image=validated_data.get('image'),
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
            store_logo=validated_data.get('store_logo'),
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
            'birthday', 'image', 'city', 'status', 'store_name', 'seller_address',
            'seller_license_id', 'seller_bio', 'seller_social_links',
            'seller_status', 'store_logo', 'store_domain', 'store_description', 'store_type',
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
