from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrModeratorOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object or moderators/admins to edit it.
    Read-only access is allowed for any request.
    """

    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests from any user.
        if request.method in SAFE_METHODS:
            return True

        # For write methods, user must be authenticated.
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD, OPTIONS requests from any user.
        if request.method in SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object
        # or to users with roles 'ADMIN' or 'BDE'.
        # Assumes the object has a 'created_by' attribute.
        is_owner = hasattr(obj, 'created_by') and obj.created_by == request.user

        is_moderator = False
        if hasattr(request.user, 'role') and request.user.role in ['ADMIN', 'BDE']:
            is_moderator = True

        return is_owner or is_moderator

class IsModeratorOrAdmin(BasePermission):
    """
    Custom permission to only allow users with role 'ADMIN' or 'BDE'.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return hasattr(request.user, 'role') and request.user.role in ['ADMIN', 'BDE']

    def has_object_permission(self, request, view, obj):
        # Object-level permission is the same as view-level for this role-based check
        if not (request.user and request.user.is_authenticated):
            return False
        return hasattr(request.user, 'role') and request.user.role in ['ADMIN', 'BDE']

class IsTopicOwnerOrModerator(BasePermission):
    """
    Custom permission for actions like marking a reply as solution.
    Allows the topic owner or a moderator/admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj): # obj here is ForumReply
        # For ForumReply, obj.topic.created_by is the topic owner
        is_topic_owner = hasattr(obj, 'topic') and obj.topic.created_by == request.user

        is_moderator = False
        if hasattr(request.user, 'role') and request.user.role in ['ADMIN', 'BDE']:
            is_moderator = True

        return is_topic_owner or is_moderator
