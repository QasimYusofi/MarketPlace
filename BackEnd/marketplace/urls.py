from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, StoreOwnerViewSet, ProductViewSet


router = DefaultRouter()
router.register(r'users', CustomerViewSet, basename='customer')
router.register(r'store-owners', StoreOwnerViewSet, basename='storeowner')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('api/', include(router.urls)),
]
