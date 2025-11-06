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

