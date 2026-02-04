from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """
    Permission check for admin users.
    For now, checks is_superuser. Later, will check if user is Admin model instance.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # TODO: When Admin model is created, check: isinstance(user, Admin) or user.is_superuser
        return getattr(user, 'is_superuser', False)


class IsSelfOrAdmin(BasePermission):
    """
    Permission check: user can access their own record, or admin can access any.
    For now, checks is_superuser. Later, will check if user is Admin model instance.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # TODO: When Admin model is created, check: isinstance(user, Admin) or user.is_superuser
        if getattr(user, 'is_superuser', False):
            return True
        return getattr(obj, 'id', None) == getattr(user, 'id', None)


class IsStoreOwnerOrAdmin(BasePermission):
    """
    Permission check: store owner can manage their own products, admin can manage all.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all
        if getattr(user, 'is_superuser', False):
            return True
        # Store owners can access their own products
        if hasattr(user, 'user_type') and user.user_type == 'store_owner':
            return True
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all objects
        if getattr(user, 'is_superuser', False):
            return True
        # Store owner can only access their own products
        if hasattr(user, 'user_type') and user.user_type == 'store_owner':
            if hasattr(obj, 'store_owner'):
                return obj.store_owner.id == user.id
        return False


class IsCustomer(BasePermission):
    """
    Permission check: only customers can access customer-specific actions like rating.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return hasattr(user, 'user_type') and user.user_type == 'customer'


class IsCustomerOrAdmin(BasePermission):
    """
    Permission check: customers can access actions, admins can access all.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all
        if getattr(user, 'is_superuser', False):
            return True
        # Customers can access
        if hasattr(user, 'user_type') and user.user_type == 'customer':
            return True
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all objects
        if getattr(user, 'is_superuser', False):
            return True
        # Customer can access any object (for rating)
        if hasattr(user, 'user_type') and user.user_type == 'customer':
            return True
        return False


class IsStoreOwner(BasePermission):
    """
    Permission check: only store owners can create/manipulate products.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return hasattr(user, 'user_type') and user.user_type == 'store_owner'


class IsStoreOwnerForOrders(BasePermission):
    """
    Permission check: store owner can manage their own store's orders, admin can manage all.
    Allows store owners to use PUT/PATCH on orders for their store.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all
        if getattr(user, 'is_superuser', False):
            return True
        # Store owners can access their own orders
        if hasattr(user, 'user_type') and user.user_type == 'store_owner':
            return True
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin can access all objects
        if getattr(user, 'is_superuser', False):
            return True
        # Store owner can only access their own store's orders
        if hasattr(user, 'user_type') and user.user_type == 'store_owner':
            if hasattr(obj, 'store'):
                return obj.store.id == user.id
        return False
