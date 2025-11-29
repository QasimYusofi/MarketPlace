from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse
from .models import Customer, StoreOwner, Product, ProductRating
from .serializers import CustomerSerializer, StoreOwnerSerializer, ProductSerializer, ProductRatingSerializer
from .permissions import IsAdminRole, IsSelfOrAdmin, IsStoreOwner, IsStoreOwnerOrAdmin, IsCustomer, IsCustomerOrAdmin



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

    def upload_image(self, request, pk=None):
        user = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.update_profile_image(file_obj)
        return Response({'detail': 'uploaded', 'profile_image_info': user.get_profile_image_info()})

    @action(detail=True, methods=['delete'], url_path='remove-image')
    def remove_image(self, request, pk=None):
        user = self.get_object()
        if not user.has_profile_image():
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        user.remove_profile_image()
        return Response({'detail': 'removed'})

    @action(detail=True, methods=['get'], url_path='image-info')
    def image_info(self, request, pk=None):
        user = self.get_object()
        info = user.get_profile_image_info()
        if not info:
            return Response({'detail': 'no image'}, status=status.HTTP_404_NOT_FOUND)
        return Response(info)

    @action(detail=True, methods=['get'], url_path='image')
    def download_image(self, request, pk=None):
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
    def upload_profile_image(self, request, pk=None):
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
    def remove_profile_image(self, request, pk=None):
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
    def profile_image_info(self, request, pk=None):
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
    def download_profile_image(self, request, pk=None):
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
    def upload_store_logo(self, request, pk=None):
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
    def remove_store_logo(self, request, pk=None):
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
    def store_logo_info(self, request, pk=None):
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
    def download_store_logo(self, request, pk=None):
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
    def statistics(self, request, pk=None):
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
    def rate_seller(self, request, pk=None):
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
    def rate_store(self, request, pk=None):
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

        # If user is store owner, only show their products
        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'store_owner':
            queryset = queryset.filter(store_owner=user)
        # If user is admin, show all products
        # For anonymous users or customers, only show active products

        # Filter by status - only show active products for non-store-owner users
        if not (user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'store_owner' and user.is_superuser):
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
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response('موفقانه ایجاد شد.', status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Set the store_owner to the current user"""
        serializer.save(store_owner=self.request.user)

    # Image Management Actions
    @action(detail=True, methods=['post'], url_path='add-image')
    def add_image(self, request, pk=None):
        """Add an image to a product"""
        product = self.get_object()

        # Get image data from request
        image_data = request.data
        if hasattr(request, 'FILES') and request.FILES.get('file'):
            # Handle file upload
            file_obj = request.FILES['file']
            image_data = {
                'filename': file_obj.name,
                'contentType': file_obj.content_type,
                'data': file_obj.read(),
                'size': file_obj.size
            }

        added_image = product.add_image(image_data)
        product.save()

        return Response({
            'detail': 'Image added successfully',
            'image': added_image
        })

    @action(detail=True, methods=['delete'], url_path=r'remove-image/(?P<image_index>\d+)')
    def remove_image(self, request, pk=None, image_index=None):
        """Remove an image from a product by index"""
        product = self.get_object()

        if image_index is None:
            return Response(
                {'detail': 'Image index is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            image_index = int(image_index)
        except ValueError:
            return Response(
                {'detail': 'Invalid image index'},
                status=status.HTTP_400_BAD_REQUEST
            )

        removed_image = product.remove_image(image_index)
        if removed_image is None:
            return Response(
                {'detail': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        product.save()
        return Response({
            'detail': 'Image removed successfully'
        })

    @action(detail=True, methods=['post'], url_path=r'set-primary-image/(?P<image_index>\d+)')
    def set_primary_image(self, request, pk=None, image_index=None):
        """Set an image as primary by index"""
        product = self.get_object()

        if image_index is None:
            return Response(
                {'detail': 'Image index is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            image_index = int(image_index)
        except ValueError:
            return Response(
                {'detail': 'Invalid image index'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not product.set_primary_image(image_index):
            return Response(
                {'detail': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        product.save()
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
