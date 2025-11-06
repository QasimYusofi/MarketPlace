from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet


router = DefaultRouter()
router.register(r'users', CustomerViewSet, basename='customer')

urlpatterns = [
    path('api/', include(router.urls)),
]
