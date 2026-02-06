from rest_framework import serializers
from django.utils import timezone
from .models import Customer, StoreOwner, Product, ProductRating, ProductImage, Cart, Order, OrderItem, Wishlist, WishlistItem, Comment


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


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    author = serializers.SerializerMethodField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)
    product_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    replies = serializers.SerializerMethodField(read_only=True)

    # Computed fields
    is_reply = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'product',
            'product_id',
            'author',
            'content',
            'parent',
            'replies',
            'is_reply',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'author',
            'product',
            'replies',
            'is_reply',
            'created_at',
            'updated_at',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_author(self, obj):
        """Return author basic info"""
        return {
            'id': str(obj.author.id),
            'full_name': obj.author.full_name,
            'user_type': obj.author.user_type,
            'phone': obj.author.phone,
        }

    def get_product(self, obj):
        """Return product basic info"""
        return {
            'id': str(obj.product.id),
            'title': obj.product.title,
            'sku': obj.product.sku,
        }

    def get_replies(self, obj):
        """Return replies to this comment"""
        replies = obj.get_replies()
        return CommentSerializer(replies, many=True, context=self.context).data

    def validate_content(self, value):
        """Validate comment content"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("متن نظر الزامی است")
        if len(value) > 1000:
            raise serializers.ValidationError("متن نظر نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد")
        return value.strip()

    def validate_parent(self, value):
        """Validate parent comment exists and belongs to same product"""
        if value:
            # Ensure parent exists
            try:
                parent_comment = Comment.objects.get(id=value)
            except Comment.DoesNotExist:
                raise serializers.ValidationError("نظر والد یافت نشد")

            # Ensure parent belongs to the same product
            product_id = self.context.get('product_id') or self.initial_data.get('product_id')
            if product_id and str(parent_comment.product.id) != product_id:
                raise serializers.ValidationError("نظر والد باید به همان محصول تعلق داشته باشد")

        return value

    def create(self, validated_data):
        """Create a new comment"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user

        # Get product id from multiple sources
        product_id = self.context.get('product_id') or self.initial_data.get('product_id') or self.initial_data.get('product')
        
        if not product_id:
            raise serializers.ValidationError("شناسه محصول یافت نشد")

        # Get the Product instance
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول یافت نشد")

        # Set author and product
        validated_data['author'] = user
        validated_data['product'] = product

        # Handle permissions for replies
        parent_id = validated_data.get('parent')
        if parent_id:
            # This is a reply
            try:
                parent_comment = Comment.objects.get(id=parent_id)
            except Comment.DoesNotExist:
                raise serializers.ValidationError("نظر والد یافت نشد")

            # Check if user can reply to this comment
            if not parent_comment.can_reply(user):
                raise serializers.ValidationError("شما مجاز به پاسخ به این نظر نیستید")

        return Comment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update comment - only allow author to update their own comments"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user

        # Only author can update their comment
        if instance.author != user:
            raise serializers.ValidationError("شما فقط می‌توانید نظر خود را ویرایش کنید")

        # Only allow updating content
        if 'content' in validated_data:
            instance.content = validated_data['content']
            instance.save()

        return instance


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for WishlistItem model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            'id',
            'product',
            'added_at',
        ]
        read_only_fields = ['id', 'added_at']

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_product(self, obj):
        """Return product details as specified in the populate"""
        return {
            'id': str(obj.product.id),
            'title': obj.product.title,
            'price': obj.product.price,
            'compare_price': obj.product.compare_price,
            'images': obj.product.get_all_image_urls(),
            'stock': obj.product.stock,
            'status': obj.product.status,
            'store_id': str(obj.product.store_owner.id),
            'colors': obj.product.colors,
            'sizes': obj.product.sizes,
            'description': obj.product.description,
        }


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for Wishlist model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    items = WishlistItemSerializer(many=True, read_only=True)

    # Computed fields
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = [
            'id',
            'user',
            'items',
            'item_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'items',
            'item_count',
            'created_at',
            'updated_at',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_user(self, obj):
        """Return user basic info"""
        return {
            'id': str(obj.user.id),
            'full_name': obj.user.full_name,
            'phone': obj.user.phone,
        }

    def get_item_count(self, obj):
        """Return number of items in wishlist"""
        return obj.item_count


class AddToWishlistSerializer(serializers.Serializer):
    """Serializer for adding products to wishlist"""
    product_id = serializers.CharField(required=True)

    def validate_product_id(self, value):
        """Validate product exists and is active"""
        try:
            product = Product.objects.get(id=value, status='active')
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول یافت نشد یا غیرفعال است")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'title',
            'price',
            'quantity',
            'total',
        ]
        read_only_fields = ['id']

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_product(self, obj):
        """Return product basic info"""
        return {
            'id': str(obj.product.id),
            'title': obj.product.title,
            'sku': obj.product.sku,
            'image': obj.product.get_primary_image_url(),
        }

    def validate_quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("تعداد باید بزرگ‌تر از صفر باشد")
        return value

    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("قیمت باید بزرگ‌تر از صفر باشد")
        return value


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    store = serializers.SerializerMethodField(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    # Computed fields
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'store',
            'items',
            'total_amount',
            'shipping_address',
            'status',
            'payment_method',
            'tracking_number',
            'items_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'store',
            'items',
            'total_amount',
            'items_count',
            'created_at',
            'updated_at',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_user(self, obj):
        """Return user basic info"""
        return {
            'id': str(obj.user.id),
            'full_name': obj.user.full_name,
            'phone': obj.user.phone,
        }

    def get_store(self, obj):
        """Return store basic info"""
        return {
            'id': str(obj.store.id),
            'store_name': obj.store.store_name,
            'full_name': obj.store.full_name,
        }

    def get_items_count(self, obj):
        """Return number of items in order"""
        return obj.items.count()

    def validate_total_amount(self, value):
        """Validate total amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("مجموع مبلغ باید بزرگ‌تر از صفر باشد")
        return value

    def validate_shipping_address(self, value):
        """Validate shipping address structure"""
        if not value:
            return value

        required_fields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'phone']
        if not isinstance(value, dict):
            raise serializers.ValidationError("آدرس ارسال باید یک شیء باشد")

        for field in required_fields:
            if field not in value or not value[field]:
                raise serializers.ValidationError(f"فیلد {field} در آدرس ارسال الزامی است")

        return value

    def create(self, validated_data):
        """Create a new order from cart items"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user
        if not hasattr(user, 'user_type') or user.user_type != 'customer':
            raise serializers.ValidationError("فقط مشتریان می‌توانند سفارش ایجاد کنند")

        # Get cart items from request data
        cart_items = request.data.get('cart_items', [])
        if not cart_items:
            raise serializers.ValidationError("آیتم‌های سبد خرید الزامی است")

        try:
            customer = Customer.objects.get(id=user.id)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("مشتری یافت نشد")

        # Validate cart items and group them by store
        store_orders_data = {}
        
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'], status='active')
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"محصول با شناسه {item['product_id']} یافت نشد")

            if not product.is_in_stock or product.stock < item['quantity']:
                raise serializers.ValidationError(f"محصول {product.title} موجود نیست یا موجودی کافی ندارد")

            store_id = str(product.store_owner.id)
            if store_id not in store_orders_data:
                store_orders_data[store_id] = {
                    'items': [],
                    'total_amount': 0,
                    'store': product.store_owner
                }

            # Create order item data
            price = product.price
            quantity = item['quantity']
            item_total = price * quantity

            order_item_data = {
                'product': product,
                'title': product.title,
                'price': price,
                'quantity': quantity,
                'total': item_total,
            }
            store_orders_data[store_id]['items'].append(order_item_data)
            store_orders_data[store_id]['total_amount'] += item_total

        created_orders = []

        for store_id, data in store_orders_data.items():
            store = data['store']
            items_data = data['items']
            total_amount = data['total_amount']

            # Create order
            order = Order.objects.create(
                user=customer,
                store=store,
                total_amount=total_amount,
                shipping_address=validated_data.get('shipping_address'),
                payment_method=validated_data.get('payment_method'),
                status=validated_data.get('status', Order.Status.PENDING),
                tracking_number=validated_data.get('tracking_number'),
            )

            # Create order items and update stock
            for item_data in items_data:
                OrderItem.objects.create(
                    order=order,
                    **item_data
                )
                
                # Update product stock and sales
                product = item_data['product']
                product.stock -= item_data['quantity']
                product.sales_count += item_data['quantity']
                product.save()

            # Update store statistics
            store.increment_sales(total_amount)
            
            created_orders.append(order)

        # Return the list of created orders
        # Note: The viewset needs to be updated to handle a list if many=True is needed
        return created_orders

    def update(self, instance, validated_data):
        """Update order - only allow status and tracking number updates"""
        allowed_fields = ['status', 'tracking_number']
        for field in allowed_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()
        return instance


class CartItemSerializer(serializers.Serializer):
    """Serializer for individual cart items"""
    product_id = serializers.CharField(required=True)
    quantity = serializers.IntegerField(min_value=1, default=1)
    price_snapshot = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    color = serializers.CharField(max_length=50, default="", required=False)
    size = serializers.CharField(max_length=50, default="", required=False)
    owner_store_id = serializers.CharField(required=False, allow_blank=True)

    def validate_product_id(self, value):
        """Validate product exists and is active"""
        try:
            product = Product.objects.get(id=value, status='active')
            if not product.is_in_stock:
                raise serializers.ValidationError("محصول موجود نیست")
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول یافت نشد")
        return value

    def validate_owner_store_id(self, value):
        """Validate store exists if provided"""
        if not value:
            return value
        try:
            StoreOwner.objects.get(id=value)
        except StoreOwner.DoesNotExist:
            raise serializers.ValidationError("فروشگاه یافت نشد")
        return value

    def validate_price_snapshot(self, value):
        """Convert Decimal to float for MongoDB compatibility"""
        if value is None:
            return value
        if isinstance(value, str):
            try:
                value = float(value)
            except ValueError:
                raise serializers.ValidationError("قیمت باید یک عدد معتبر باشد")
        elif hasattr(value, '__float__'):
            value = float(value)
        return value

    def to_internal_value(self, data):
        """Convert Decimal to float for MongoDB compatibility and populate missing fields"""
        ret = super().to_internal_value(data)
        
        # If price_snapshot is not provided, get it from the product
        if not ret.get('price_snapshot'):
            try:
                product = Product.objects.get(id=ret['product_id'])
                ret['price_snapshot'] = float(product.price)
            except (Product.DoesNotExist, ValueError):
                pass
        
        # If owner_store_id is not provided, get it from the product
        if not ret.get('owner_store_id'):
            try:
                product = Product.objects.get(id=ret['product_id'])
                ret['owner_store_id'] = str(product.store_owner.id)
            except (Product.DoesNotExist, AttributeError):
                pass
        
        # Convert price_snapshot to float
        if 'price_snapshot' in ret and ret['price_snapshot'] is not None:
            if hasattr(ret['price_snapshot'], '__float__'):
                ret['price_snapshot'] = float(ret['price_snapshot'])
        
        return ret


class CartSerializer(serializers.ModelSerializer):
    """Serializer for Cart model"""
    # Force ObjectId to string for DRF representation
    id = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.SerializerMethodField(read_only=True)
    items = serializers.ListField(child=CartItemSerializer(), default=list)

    # Computed fields
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'user_id',
            'items',
            'total_items',
            'total_price',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user_id',
            'total_items',
            'total_price',
            'created_at',
            'updated_at',
        ]

    def get_id(self, obj):
        return str(obj.id) if obj.id is not None else None

    def get_user_id(self, obj):
        """Return user basic info"""
        return {
            'id': str(obj.user_id.id),
            'full_name': obj.user_id.full_name,
            'phone': obj.user_id.phone,
        }

    def get_total_items(self, obj):
        """Calculate total number of items in cart"""
        return sum(item.get('quantity', 0) for item in obj.items)

    def get_total_price(self, obj):
        """Calculate total price of all items in cart"""
        return sum(
            item.get('price_snapshot', 0) * item.get('quantity', 0)
            for item in obj.items
        )

    def validate_items(self, value):
        """Validate cart items"""
        if not isinstance(value, list):
            raise serializers.ValidationError("آیتم‌های سبد خرید باید یک لیست باشد")

        if len(value) == 0:
            return value

        # Check for duplicate product_ids
        product_ids = [item.get('product_id') for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("محصولات تکراری در سبد خرید مجاز نیستند")

        # Validate each item
        for item in value:
            item_serializer = CartItemSerializer(data=item)
            if not item_serializer.is_valid():
                raise serializers.ValidationError(item_serializer.errors)

        return value

    def to_internal_value(self, data):
        """Convert all Decimal objects to float for MongoDB compatibility"""
        ret = super().to_internal_value(data)

        # Convert Decimal objects in items to float
        if 'items' in ret:
            for item in ret['items']:
                if 'price_snapshot' in item and hasattr(item['price_snapshot'], '__float__'):
                    item['price_snapshot'] = float(item['price_snapshot'])

        return ret

    def create(self, validated_data):
        """Create a new cart - should use get_or_create instead"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("اطلاعات کاربر یافت نشد")

        user = request.user
        if not hasattr(user, 'user_type') or user.user_type != 'customer':
            raise serializers.ValidationError("فقط مشتریان می‌توانند سبد خرید داشته باشند")

        try:
            customer = Customer.objects.get(id=user.id)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("مشتری یافت نشد")

        # Use get_or_create for cart
        cart, created = Cart.objects.get_or_create(user_id=customer)
        if not created:
            # Update existing cart items if provided
            if 'items' in validated_data:
                cart.items = validated_data['items']
                cart.save()

        return cart

    def update(self, instance, validated_data):
        """Update cart items"""
        if 'items' in validated_data:
            instance.items = validated_data['items']
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
