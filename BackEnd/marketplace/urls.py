from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, StoreOwnerViewSet, ProductViewSet, CategoryViewSet, CartViewSet, OrderViewSet, WishlistViewSet, CommentViewSet


router = DefaultRouter()
router.register(r'users', CustomerViewSet, basename='customer')
router.register(r'store-owners', StoreOwnerViewSet, basename='storeowner')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'wishlists', WishlistViewSet, basename='wishlist')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('api/', include(router.urls)),
]
