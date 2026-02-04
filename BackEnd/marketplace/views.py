from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse
from django.db.models import Q
from .models import Customer, StoreOwner, Product, ProductRating, Cart, Order, OrderItem, Wishlist, WishlistItem, Comment
from .serializers import CartItemSerializer, CustomerSerializer, StoreOwnerSerializer, ProductSerializer, ProductRatingSerializer, CartSerializer, OrderSerializer, OrderItemSerializer, WishlistSerializer, WishlistItemSerializer, AddToWishlistSerializer, CommentSerializer
from .permissions import IsAdminRole, IsSelfOrAdmin, IsStoreOwner, IsStoreOwnerOrAdmin, IsCustomer, IsCustomerOrAdmin, IsStoreOwnerForOrders



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    lookup_field = 'phone'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value == 'me':
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            if self.request.user.user_type != 'customer':
                raise PermissionDenied("Not a customer")
            return self.request.user
        return super().get_object()

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if self.action in ['list']:
            return [IsAdminRole()]
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'upload_image', 'remove_image', 'image_info', 'download_image']:
            return [IsSelfOrAdmin()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'detail': 'created successfully'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='upload-image')

    def upload_image(self, request, phone=None):
        user = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.update_profile_image(file_obj)
        return Response({'detail': 'uploaded', 'profile_image_info': user.get_profile_image_info()})

    @action(detail=True, methods=['delete'], url_path='remove-image')
    def remove_image(self, request, phone=None):
        user = self.get_object()
        if not user.has_profile_image():
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        user.remove_profile_image()
        return Response({'detail': 'removed'})

    @action(detail=True, methods=['get'], url_path='image-info')
    def image_info(self, request, phone=None):
        user = self.get_object()
        info = user.get_profile_image_info()
        if not info:
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        return Response(info)

    @action(detail=True, methods=['get'], url_path='image')
    def download_image(self, request, phone=None):
        user = self.get_object()
        if not user.has_profile_image():
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(user.image_data, content_type=user.image_content_type or 'application/octet-stream')
        if user.image_filename:
            response['Content-Disposition'] = f'inline; filename="{user.image_filename}"'
        return response


class StoreOwnerViewSet(viewsets.ModelViewSet):
    """ViewSet for StoreOwner CRUD operations"""
    queryset = StoreOwner.objects.all().order_by('-created_at')
    serializer_class = StoreOwnerSerializer
    lookup_field = 'phone'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value == 'me':
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            if self.request.user.user_type != 'store_owner':
                raise PermissionDenied("Not a store owner")
            try:
                return StoreOwner.objects.get(id=self.request.user.id)
            except StoreOwner.DoesNotExist:
                raise PermissionDenied("Store owner not found")
        return super().get_object()


    def get_permissions(self):

        """Set permissions based on action"""
        if self.action in ['create']:
            # Anyone can register as a store owner
            return [permissions.AllowAny()]
        if self.action in ['list']:
            # Only admins can list all store owners
            return [IsAdminRole()]
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy',
                          'upload_profile_image', 'remove_profile_image',
                          'upload_store_logo', 'remove_store_logo',
                          'profile_image_info', 'store_logo_info',
                          'download_profile_image', 'download_store_logo',
                          'statistics']:
            # Store owner can manage their own data, admins can manage all
            return [IsSelfOrAdmin()]
        if self.action in ['test_upload_store_logo']:
            # Allow anyone for testing
            return [permissions.AllowAny()]
        if self.action in ['rate-seller', 'rate-store']:
            # Only customers and admins can rate
            return [IsCustomerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({'detail': 'created successfully'}, status=status.HTTP_201_CREATED)

    # Profile Image Actions

    @action(detail=True, methods=['post'], url_path='upload-profile-image')
    def upload_profile_image(self, request, phone=None):
        """Upload profile image for store owner"""
        store_owner = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'detail': 'file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        store_owner.update_profile_image(file_obj)
        return Response({
            'detail': 'Profile image uploaded successfully',
            'profile_image_info': store_owner.get_profile_image_info()
        })

    @action(detail=True, methods=['delete'], url_path='remove-profile-image')
    def remove_profile_image(self, request, phone=None):
        """Remove profile image for store owner"""
        store_owner = self.get_object()
        if not store_owner.has_profile_image():
            return Response(
                {'detail': 'No profile image found'},
                status=status.HTTP_404_NOT_FOUND
            )
        store_owner.remove_profile_image()
        return Response({'detail': 'Profile image removed successfully'})

    @action(detail=True, methods=['get'], url_path='profile-image-info')
    def profile_image_info(self, request, phone=None):
        """Get profile image metadata"""
        store_owner = self.get_object()
        info = store_owner.get_profile_image_info()
        if not info:
            return Response(
                {'detail': 'No profile image found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(info)

    @action(detail=True, methods=['get'], url_path='profile-image')
    def download_profile_image(self, request, phone=None):
        """Download profile image"""
        store_owner = self.get_object()
        if not store_owner.has_profile_image():
            return Response(
                {'detail': 'No profile image found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        response = HttpResponse(
            store_owner.image_data, 
            content_type=store_owner.image_content_type or 'application/octet-stream'
        )
        if store_owner.image_filename:
            response['Content-Disposition'] = f'inline; filename="{store_owner.image_filename}"'
        return response

    # Store Logo Actions
    @action(detail=True, methods=['post'], url_path='upload-store-logo')
    def upload_store_logo(self, request, phone=None):
        """Upload store logo"""
        store_owner = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'detail': 'file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        store_owner.update_store_logo(file_obj)
        return Response({
            'detail': 'Store logo uploaded successfully',
            'store_logo_info': store_owner.get_store_logo_info()
        })

    @action(detail=True, methods=['delete'], url_path='remove-store-logo')
    def remove_store_logo(self, request, phone=None):
        """Remove store logo"""
        store_owner = self.get_object()
        if not store_owner.has_store_logo():
            return Response(
                {'detail': 'No store logo found'},
                status=status.HTTP_404_NOT_FOUND
            )
        store_owner.remove_store_logo()
        return Response({'detail': 'Store logo removed successfully'})

    @action(detail=True, methods=['get'], url_path='store-logo-info')
    def store_logo_info(self, request, phone=None):
        """Get store logo metadata"""
        store_owner = self.get_object()
        info = store_owner.get_store_logo_info()
        if not info:
            return Response(
                {'detail': 'No store logo found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(info)

    @action(detail=True, methods=['get'], url_path='store-logo')
    def download_store_logo(self, request, phone=None):
        """Download store logo"""
        store_owner = self.get_object()
        if not store_owner.has_store_logo():
            return Response(
                {'detail': 'No store logo found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        response = HttpResponse(
            store_owner.store_logo_data, 
            content_type=store_owner.store_logo_content_type or 'application/octet-stream'
        )
        if store_owner.store_logo_filename:
            response['Content-Disposition'] = f'inline; filename="{store_owner.store_logo_filename}"'
        return response

    # Statistics Actions
    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, phone=None):
        """Get store owner statistics"""
        store_owner = self.get_object()
        return Response({
            'active_products_count': store_owner.active_products_count,
            'total_sales': store_owner.total_sales,
            'total_revenue': str(store_owner.total_revenue),
            'seller_rating': store_owner.seller_rating,
            'store_rating': store_owner.store_rating,
        })

    # Rating Actions
    @action(detail=True, methods=['post'], url_path='rate-seller')
    def rate_seller(self, request, phone=None):
        """Add a rating to the seller"""
        store_owner = self.get_object()
        rating = request.data.get('rating')

        if not rating:
            return Response(
                {'detail': 'rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = float(rating)
            if rating < 0 or rating > 5:
                return Response(
                    {'detail': 'Rating must be between 0 and 5'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid rating value'},
                status=status.HTTP_400_BAD_REQUEST
            )

        store_owner.update_seller_rating(rating)
        return Response({
            'detail': 'Seller rating updated successfully',
            'seller_rating': store_owner.seller_rating
        })

    @action(detail=True, methods=['post'], url_path='rate-store')
    def rate_store(self, request, phone=None):
        """Add a rating to the store"""
        store_owner = self.get_object()
        rating = request.data.get('rating')
        
        if not rating:
            return Response(
                {'detail': 'rating is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            rating = float(rating)
            if rating < 0 or rating > 5:
                return Response(
                    {'detail': 'Rating must be between 0 and 5'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid rating value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        store_owner.update_store_rating(rating)
        return Response({
            'detail': 'Store rating updated successfully',
            'store_rating': store_owner.store_rating
        })


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product CRUD operations"""
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def get_queryset(self):
        """Filter products based on user type"""
        user = self.request.user
        queryset = Product.objects.all()

        # If user is store owner, show all their products (active and inactive)
        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'store_owner':
            queryset = queryset.filter(store_owner=user)
        # If user is admin, show all products
        elif user.is_authenticated and user.is_superuser:
            # Admins can see all products (active and inactive)
            pass  # No filtering needed
        # For anonymous users or customers, only show active products
        else:
            queryset = queryset.filter(status='active')

        # Apply ordering
        queryset = queryset.order_by('-created_at')

        return queryset

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            # Anyone can list/retrieve products, but filtered appropriately
            return [permissions.AllowAny()]
        if self.action in ['create']:
            # Only store owners can create products
            return [IsStoreOwner()]
        if self.action in ['update', 'partial_update', 'destroy',
                          'add_image', 'remove_image', 'set_primary_image']:
            # Store owners can manage their own products, admins can manage all
            return [IsStoreOwnerOrAdmin()]
        if self.action in ['increment_views']:
            # Anyone can view products (increment view count)
            return [permissions.AllowAny()]
        if self.action in ['rate_product', 'get_my_rating', 'update_my_rating']:
            # Only customers and admins can rate products
            return [IsCustomerOrAdmin()]
        if self.action in ['store_products']:
            # Authenticated users can fetch products by store owner
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        product_data = request.data
        product_images = request.FILES.getlist('images')
       
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pr = serializer.save(store_owner=request.user)
        pr.add_image(product_images)
        
        # self.perform_create(serializer)
        return Response('موفقانه ایجاد شد.', status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Set the store_owner to the current user"""
        serializer.save(store_owner=self.request.user)

    # Image Management Actions
    @action(detail=True, methods=['post'], url_path='add-image')
    def add_image(self, request, pk=None):
        """Add an image to a product"""
        product = self.get_object()

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)

        added_image = product.add_image(file_obj)
        product.save()

        return Response({
            'detail': 'Image added successfully',
            'image_id': str(added_image.id),
            'image_url': added_image.image.url
        })

    @action(detail=True, methods=['delete'], url_path=r'remove-image/(?P<image_id>[^/]+)')
    def remove_image(self, request, pk=None, image_id=None):
        """Remove an image from a product by image ID"""
        product = self.get_object()

        if image_id is None:
            return Response(
                {'detail': 'Image ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        removed_image = product.remove_image(image_id)
        if removed_image is None:
            return Response(
                {'detail': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'detail': 'Image removed successfully'
        })

    @action(detail=True, methods=['post'], url_path=r'set-primary-image/(?P<image_id>[^/]+)')
    def set_primary_image(self, request, pk=None, image_id=None):
        """Set an image as primary by image ID"""
        product = self.get_object()

        if image_id is None:
            return Response(
                {'detail': 'Image ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not product.set_primary_image(image_id):
            return Response(
                {'detail': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'detail': 'Primary image set successfully'
        })

    # Rating Actions
    @action(detail=True, methods=['post'], url_path='rate')
    def rate_product(self, request, pk=None):
        """Add a rating to the product (customers can rate once per product)"""
        product = self.get_object()

        serializer = ProductRatingSerializer(
            data=request.data,
            context={'request': request, 'product_id': pk}
        )

        if serializer.is_valid():
            try:
                rating_obj = serializer.save()
                product.refresh_from_db()  # Refresh to get updated rating
                return Response({
                    'detail': 'Product rating added successfully',
                    'rating': product.rating,
                    'your_rating': rating_obj.rating
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='my-rating')
    def get_my_rating(self, request, pk=None):
        """Get current user's rating for this product"""
        product = self.get_object()
        user = request.user

        if not hasattr(user, 'user_type') or user.user_type != 'customer':
            return Response(
                {'detail': 'Only customers can view their ratings'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            customer = Customer.objects.get(id=user.id)
            rating = ProductRating.objects.get(customer=customer, product=product)
            serializer = ProductRatingSerializer(rating, context={'request': request})
            return Response(serializer.data)
        except (Customer.DoesNotExist, ProductRating.DoesNotExist):
            return Response(
                {'detail': 'You have not rated this product yet'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['put', 'patch'], url_path='my-rating')
    def update_my_rating(self, request, pk=None):
        """Update current user's rating for this product"""
        product = self.get_object()
        user = request.user

        if not hasattr(user, 'user_type') or user.user_type != 'customer':
            return Response(
                {'detail': 'Only customers can update their ratings'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            customer = Customer.objects.get(id=user.id)
            rating_obj = ProductRating.objects.get(customer=customer, product=product)

            serializer = ProductRatingSerializer(
                rating_obj,
                data=request.data,
                partial=(request.method == 'PATCH'),
                context={'request': request}
            )

            if serializer.is_valid():
                serializer.save()
                product.refresh_from_db()  # Refresh to get updated rating
                return Response({
                    'detail': 'Product rating updated successfully',
                    'rating': product.rating,
                    'your_rating': serializer.instance.rating
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except (Customer.DoesNotExist, ProductRating.DoesNotExist):
            return Response(
                {'detail': 'You have not rated this product yet'},
                status=status.HTTP_404_NOT_FOUND
            )

    # Analytics Action
    @action(detail=True, methods=['post'], url_path='view')
    def increment_views(self, request, pk=None):
        """Increment product view count"""
        product = self.get_object()
        product.increment_views()
        return Response({
            'detail': 'View count incremented',
            'views': product.views
        })

    # Bulk Actions
    @action(detail=False, methods=['get'], url_path='my-products')
    def my_products(self, request):
        """Get current store owner's products"""
        if not (request.user.is_authenticated and hasattr(request.user, 'user_type') and request.user.user_type == 'store_owner'):
            return Response(
                {'detail': 'Only store owners can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'store/(?P<store_owner_id>[^/]+)')
    def store_products(self, request, store_owner_id=None):
        """Get active products of a specific store owner (accessible by customers)"""
        if not store_owner_id:
            return Response(
                {'detail': 'Store owner ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            store_owner = StoreOwner.objects.get(id=store_owner_id)
        except StoreOwner.DoesNotExist:
            return Response(
                {'detail': 'Store owner not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get active products of this store owner
        products = Product.objects.filter(
            store_owner=store_owner,
            status='active'
        ).order_by('-created_at')

        # Serialize products
        serializer = self.get_serializer(products, many=True)
        return Response({
            'store': StoreOwnerSerializer(store_owner).data,
            'products': serializer.data,
            'total_products': len(serializer.data)
        })

class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for Comment operations"""
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer

    def get_queryset(self):
        """Filter comments - everyone can see comments, but filtered by product"""
        queryset = Comment.objects.all()

        # Filter by product if provided
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        # For nested comments, only show top-level comments by default
        # Replies are included in the 'replies' field of parent comments
        queryset = queryset.filter(parent__isnull=True)

        return queryset.order_by('-created_at')

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            # Anyone can view comments
            return [permissions.AllowAny()]
        if self.action in ['create']:
            # Only authenticated users can create comments
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            # Only comment author can update their own comments
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        """Add product_id to serializer context"""
        context = super().get_serializer_context()
        # Get product_id from URL if it's a product-scoped action
        if 'product_pk' in self.kwargs:
            context['product_id'] = self.kwargs['product_pk']
        elif 'product_id' in self.request.query_params:
            context['product_id'] = self.request.query_params['product_id']
        return context

    def create(self, request, *args, **kwargs):
        """Create a new comment - must be associated with a product"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, instance, validated_data):
        """Update comment - only allow content updates"""
        # Check if user can update this comment (only author)
        if instance.author != self.request.user:
            raise PermissionDenied("You can only update your own comments")

        # Only allow updating content
        if 'content' in validated_data:
            instance.content = validated_data['content']
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, instance, *args, **kwargs):
        """Delete comment - only author or admin can delete"""
        if instance.author != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("You can only delete your own comments")

        # Soft delete or hard delete? For now, hard delete
        # But in production, consider soft delete
        instance.delete()
        return Response({'detail': 'Comment deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    # Custom actions for product-specific comments
    @action(detail=False, methods=['get'], url_path=r'product/(?P<product_id>[^/]+)')
    def product_comments(self, request, product_id=None):
        """Get all comments for a specific product"""
        if not product_id:
            return Response(
                {'detail': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get top-level comments for this product
        comments = Comment.objects.filter(
            product_id=product_id,
            parent__isnull=True
        ).order_by('-created_at')

        serializer = self.get_serializer(comments, many=True)
        return Response({
            'product_id': product_id,
            'comments': serializer.data,
            'total_comments': len(serializer.data)
        })

    @action(detail=True, methods=['post'], url_path='reply')
    def reply_to_comment(self, request, pk=None):
        """Reply to a specific comment"""
        parent_comment = self.get_object()

        # Check if user can reply to this comment
        if not parent_comment.can_reply(request.user):
            return Response(
                {'detail': 'You do not have permission to reply to this comment'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create reply data
        reply_data = {
            'content': request.data.get('content'),
            'parent': str(parent_comment.id)
        }

        serializer = self.get_serializer(data=reply_data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save()

        serializer = self.get_serializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistViewSet(viewsets.GenericViewSet):
    """ViewSet for Wishlist operations"""
    queryset = Wishlist.objects.all().order_by('-created_at')
    serializer_class = WishlistSerializer

    def get_queryset(self):
        """Filter wishlists - customers can only see their own wishlist, admins can see all"""
        user = self.request.user

        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'customer':
            # Customers can only see their own wishlist
            return Wishlist.objects.filter(user=user)
        elif user.is_authenticated and user.is_superuser:
            # Admins can see all wishlists
            return Wishlist.objects.all()
        else:
            # Anonymous users can't see wishlists
            return Wishlist.objects.none()

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'add_product', 'remove_product', 'clear', 'check_product']:
            # Customers can manage their own wishlist, admins can view all
            return [IsCustomerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        """Override to get wishlist by user for 'me' lookup"""
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value == 'me':
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            if not hasattr(self.request.user, 'user_type') or self.request.user.user_type != 'customer':
                raise PermissionDenied("Only customers can access their wishlist")

            # Get the Customer instance
            try:
                customer = Customer.objects.get(id=self.request.user.id)
            except Customer.DoesNotExist:
                raise PermissionDenied("Customer profile not found")

            # Get or create wishlist for the customer
            wishlist, created = Wishlist.objects.get_or_create(user=customer)
            return wishlist

        return super().get_object()

    def list(self, request, *args, **kwargs):
        """List user's wishlists (for customers, only their own)"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific wishlist"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='add')
    def add_product(self, request, pk=None):
        """Add a product to the wishlist"""
        wishlist = self.get_object()

        serializer = AddToWishlistSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            result = wishlist.add_product(product_id)
            return Response(result, status=status.HTTP_200_OK if not result['added'] else status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path=r'remove/(?P<product_id>[^/]+)')
    def remove_product(self, request, pk=None, product_id=None):
        """Remove a product from the wishlist"""
        wishlist = self.get_object()

        if not product_id:
            return Response(
                {'detail': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = wishlist.remove_product(product_id)
        status_code = status.HTTP_200_OK if result['removed'] else status.HTTP_404_NOT_FOUND
        return Response(result, status=status_code)

    @action(detail=True, methods=['post'], url_path='clear')
    def clear(self, request, pk=None):
        """Clear all products from the wishlist"""
        wishlist = self.get_object()
        result = wishlist.clear()
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path=r'check/(?P<product_id>[^/]+)')
    def check_product(self, request, pk=None, product_id=None):
        """Check if a product is in the user's wishlist"""
        wishlist = self.get_object()

        if not product_id:
            return Response(
                {'detail': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_in_wishlist = wishlist.has_product(product_id)
        return Response({
            'product_id': product_id,
            'in_wishlist': is_in_wishlist
        }, status=status.HTTP_200_OK)

    

class CategoryViewSet(viewsets.ViewSet):
    """ViewSet for category-based operations on the home page"""

    def get_permissions(self):
        """Allow anyone to access category endpoints"""
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'], url_path='stores')
    def stores_by_category(self, request, pk=None):
        """Get stores that have products in the specified category"""
        category = pk

        # Validate category
        valid_categories = ['men', 'women', 'kids']
        if category not in valid_categories:
            return Response(
                {'detail': f'Invalid category. Valid categories: {", ".join(valid_categories)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get stores that have active products in this category
        stores = StoreOwner.objects.filter(
            products__category=category,
            products__status='active',
            seller_status='approved'
        ).distinct()

        # Format response
        store_list = []
        for store in stores:
            store_data = {
                'id': str(store.id),
                'store_name': store.store_name,
                'store_rating': store.store_rating or {'average': 0, 'count': 0},
                'store_logo': store.store_logo.url if store.store_logo else None,
                'products_count': store.products.filter(
                    category=category,
                    status='active'
                ).count()
            }
            store_list.append(store_data)

        return Response({
            'category': category,
            'stores': store_list,
            'total_stores': len(store_list)
        })

    @action(detail=True, methods=['get'], url_path=r'stores/(?P<store_id>[^/]+)/products')
    def products_by_store_category(self, request, pk=None, store_id=None):
        """Get products of a specific store in the specified category"""
        category = pk
        store_id = store_id

        # Validate category
        valid_categories = ['men', 'women', 'kids']
        if category not in valid_categories:
            return Response(
                {'detail': f'Invalid category. Valid categories: {", ".join(valid_categories)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate store exists and has products in this category
        try:
            store = StoreOwner.objects.get(id=store_id, seller_status='approved')
        except StoreOwner.DoesNotExist:
            return Response(
                {'detail': 'Store not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get products
        products = Product.objects.filter(
            store_owner=store,
            category=category,
            status='active'
        ).order_by('-created_at')

        # Serialize products
        serializer = ProductSerializer(products, many=True, context={'request': request})

        return Response({
            'category': category,
            'store': {
                'id': str(store.id),
                'store_name': store.store_name,
                'store_rating': store.store_rating or {'average': 0, 'count': 0}
            },
            'products': serializer.data,
            'total_products': len(serializer.data)
        })


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for Cart operations"""
    queryset = Cart.objects.all().order_by('-created_at')
    serializer_class = CartSerializer

    def get_queryset(self):
        """Filter carts - customers can only see their own cart, admins can see all"""
        user = self.request.user

        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'customer':
            # Customers can only see their own cart
            return Cart.objects.filter(user_id=user)
        elif user.is_authenticated and user.is_superuser:
            # Admins can see all carts
            return Cart.objects.all()
        else:
            # Anonymous users or other types can't see carts
            return Cart.objects.none()

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            # Customers can view their own cart, admins can view all
            return [IsCustomerOrAdmin()]
        if self.action in ['create', 'update', 'partial_update', 'destroy',
                          'add_item', 'update_item', 'remove_item', 'clear_cart']:
            # Only customers can manage their own cart
            return [IsCustomer()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        """Override to get cart by user for 'me' lookup"""
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value == 'me':
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            if not hasattr(self.request.user, 'user_type') or self.request.user.user_type != 'customer':
                raise PermissionDenied("Only customers can access their cart")

            # Get the Customer instance
            try:
                customer = Customer.objects.get(id=self.request.user.id)
            except Customer.DoesNotExist:
                raise PermissionDenied("Customer profile not found")

            # Get or create cart for the customer
            cart, created = Cart.objects.get_or_create(user_id=customer)
            return cart

        return super().get_object()

    def create(self, request, *args, **kwargs):
        """Create a new cart - actually uses get_or_create"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = serializer.save()
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Cart Item Management Actions
    @action(detail=True, methods=['post'], url_path='add-item')
    def add_item(self, request, pk=None):
        """Add an item to the cart"""
        cart = self.get_object()

        # Validate item data
        item_data = request.data
        if not item_data:
            return Response(
                {'detail': 'Item data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item_serializer = CartItemSerializer(data=item_data)
        if not item_serializer.is_valid():
            return Response(item_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_item = item_serializer.validated_data

        # Check if item already exists in cart
        existing_item = None
        for item in cart.items:
            if item['product_id'] == validated_item['product_id']:
                existing_item = item
                break

        if existing_item:
            # Update quantity
            existing_item['quantity'] += validated_item['quantity']
            cart.save()
            return Response({
                'detail': 'Item quantity updated successfully',
            })
        else:
            # Add new item
            cart.items.append(validated_item)
            cart.save()
            return Response({
                'detail': 'Item added to cart successfully',
            })

    @action(detail=True, methods=['put', 'patch'], url_path=r'update-item/(?P<product_id>[^/]+)')
    def update_item(self, request, pk=None, product_id=None):
        """Update an item in the cart"""
        cart = self.get_object()

        if not product_id:
            return Response(
                {'detail': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the item
        item_found = False
        for item in cart.items:
            if item['product_id'] == product_id:
                # Update item fields
                if 'quantity' in request.data:
                    item['quantity'] = request.data['quantity']
                if 'color' in request.data:
                    item['color'] = request.data['color']
                if 'size' in request.data:
                    item['size'] = request.data['size']
                item_found = True
                break

        if not item_found:
            return Response(
                {'detail': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate updated item
        item_serializer = CartItemSerializer(data=item)
        if not item_serializer.is_valid():
            return Response(item_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart.save()
        return Response({
            'detail': 'Item updated successfully',
            'item': item
        })

    @action(detail=True, methods=['delete'], url_path=r'remove-item/(?P<product_id>[^/]+)')
    def remove_item(self, request, pk=None, product_id=None):
        """Remove an item from the cart"""
        cart = self.get_object()

        if not product_id:
            return Response(
                {'detail': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find and remove the item
        original_length = len(cart.items)
        cart.items = [item for item in cart.items if item['product_id'] != product_id]

        if len(cart.items) == original_length:
            return Response(
                {'detail': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart.save()
        return Response({'detail': 'Item removed from cart successfully'})

    @action(detail=True, methods=['post'], url_path='clear')
    def clear_cart(self, request, pk=None):
        """Clear all items from the cart"""
        cart = self.get_object()
        cart.items = []
        cart.save()
        return Response({'detail': 'Cart cleared successfully'})

    # Additional Cart Actions
    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request, pk=None):
        """Get cart summary with totals"""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        data = serializer.data

        return Response({
            'cart': data,
            'summary': {
                'total_items': data['total_items'],
                'total_price': str(data['total_price']),
                'item_count': len(data['items'])
            }
        })


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order operations"""
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def get_queryset(self):
        """Filter orders based on user type"""
        user = self.request.user

        if user.is_authenticated and hasattr(user, 'user_type'):
            if user.user_type == 'customer':
                # Customers can only see their own orders
                return Order.objects.filter(user=user)
            elif user.user_type == 'store_owner':
                # Store owners can only see orders for their store
                return Order.objects.filter(store=user)
            elif user.is_superuser:
                # Admins can see all orders
                return Order.objects.all()

        # Anonymous users can't see orders
        return Order.objects.none()

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create']:
            # Only customers can create orders
            return [IsCustomer()]
        if self.action in ['list', 'retrieve']:
            # Customers can view their own orders, store owners their store's orders, admins all
            return [IsCustomerOrAdmin()]
        if self.action in ['update', 'partial_update']:
            # Store owners can update their store's orders, admins can update all
            return [IsStoreOwnerForOrders()]
        if self.action in ['destroy']:
            # Only admins can delete orders
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """Create a new order from cart items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        orders = serializer.save()
        
        # Handle list of orders (when products are from different stores)
        if isinstance(orders, list):
            serializer = self.get_serializer(orders, many=True)
            data = serializer.data
        else:
            serializer = self.get_serializer(orders)
            data = serializer.data

        return Response({
            'detail': 'Order created successfully',
            'data': data
        }, status=status.HTTP_201_CREATED)

    # Additional Order Actions
    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response(
                {'detail': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate status
        valid_statuses = [choice[0] for choice in Order.Status.choices]
        if new_status not in valid_statuses:
            return Response(
                {'detail': f'Invalid status. Valid statuses: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check permissions - only store owners of this order's store or admins can update status
        user = request.user
        # if not (user.is_superuser or (hasattr(user, 'user_type') and user.user_type == 'store_owner' and order.store.id == user.id)):
        if not (user.is_superuser or (hasattr(user, 'user_type') and user.user_type == 'customer' and order.user.id == user.id)):
            return Response(
                {'detail': 'You do not have permission to update this order status'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_status = order.status
        order.status = new_status

        # If status changed to shipped and there's no tracking number, add one
        if new_status == 'paid' and not order.tracking_number:
            import uuid
            order.tracking_number = str(uuid.uuid4())[:12].upper()

        order.save()

        return Response({
            'detail': 'Order status updated successfully',
            'old_status': old_status,
            'new_status': order.status,
            'tracking_number': order.tracking_number
        })

    @action(detail=True, methods=['post'], url_path='add-tracking')
    def add_tracking(self, request, pk=None):
        """Add tracking number to order"""
        order = self.get_object()
        tracking_number = request.data.get('tracking_number')

        if not tracking_number:
            return Response(
                {'detail': 'Tracking number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check permissions
        user = request.user
        if not (user.is_superuser or (hasattr(user, 'user_type') and user.user_type == 'store_owner' and order.store.id == user.id)):
            return Response(
                {'detail': 'You do not have permission to add tracking number'},
                status=status.HTTP_403_FORBIDDEN
            )

        order.tracking_number = tracking_number
        order.save()

        return Response({
            'detail': 'Tracking number added successfully',
            'tracking_number': order.tracking_number
        })

    @action(detail=False, methods=['get'], url_path='my-orders')
    def my_orders(self, request):
        """Get current user's orders"""
        if not (request.user.is_authenticated and hasattr(request.user, 'user_type') and request.user.user_type == 'customer'):
            return Response(
                {'detail': 'Only customers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='store-orders')
    def store_orders(self, request):
        """Get current store owner's orders"""
        if not (request.user.is_authenticated and hasattr(request.user, 'user_type') and request.user.user_type == 'store_owner'):
            return Response(
                {'detail': 'Only store owners can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
