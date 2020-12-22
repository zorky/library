# permissions.py
from django.contrib.auth.models import Group
from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS


def is_in_group(user, group_name):
    return Group.objects.get(name=group_name).user_set.filter(id=user.id).exists()


class IsGestionnaire(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_in_group(request.user, 'gestionnaire') or \
               (request.user and request.user.is_staff)

class IsGestionnaireOrReadOnly(permissions.BasePermission):
    """
    Les requêtes GET / OPTIONS sont autorisées, les PUT, POST, DELETE sont soumises aux permissions
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return IsGestionnaire().has_permission(request, view) or\
               (request.user and request.user.is_staff)

class HasGroupPermission(permissions.BasePermission):
    """
    Ensure user is in required groups.
    https://stackoverflow.com/a/19429199/55465
    """
    def has_permission(self, request, view):
        # Get a mapping of methods -> required group.
        required_groups_mapping = getattr(view, "required_groups", {})

        # Determine the required groups for this particular request method.
        required_groups = required_groups_mapping.get(request.method, [])

        # Return True if the user has all the required groups or is staff.
        return all([is_in_group(request.user, group_name) if group_name != "__all__" else True for group_name in required_groups]) or (request.user and request.user.is_staff)