from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Post, PostComment, Reaction


class AnnouncementListView(APIView):
    """API endpoint to retrieve announcements with filtering and pagination"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get query parameters
            page = int(request.query_params.get('page', 1))
            per_page = int(request.query_params.get('per_page', 6))
            search = request.query_params.get('search', '')
            type_filter = request.query_params.get('type', 'all')
            sort_by = request.query_params.get('sort', 'newest')
            
            print(f"AnnouncementListView: Received parameters:")
            print(f"  page: {page}")
            print(f"  per_page: {per_page}")
            print(f"  search: {search}")
            print(f"  type_filter: {type_filter}")
            print(f"  sort_by: {sort_by}")
            
            # Base queryset
            announcements = Post.objects.filter(is_announcement=True)
            print(f"AnnouncementListView: Base queryset count: {announcements.count()}")
            
            # Apply search filter
            if search:
                announcements = announcements.filter(
                    Q(title__icontains=search) |
                    Q(content__icontains=search) |
                    Q(created_by__username__icontains=search) |
                    Q(created_by__first_name__icontains=search) |
                    Q(created_by__last_name__icontains=search)
                )
                print(f"AnnouncementListView: After search filter count: {announcements.count()}")
            
            # Apply type filter
            if type_filter != 'all':
                announcements = announcements.filter(announcement_type=type_filter)
                print(f"AnnouncementListView: After type filter count: {announcements.count()}")
            
            # Apply sorting
            if sort_by == 'newest':
                announcements = announcements.order_by('-is_pinned', '-created_at')
            elif sort_by == 'oldest':
                announcements = announcements.order_by('-is_pinned', 'created_at')
            elif sort_by == 'engagement':
                announcements = announcements.order_by('-is_pinned', '-views_count')
            elif sort_by == 'views':
                announcements = announcements.order_by('-is_pinned', '-views_count')
            else:
                announcements = announcements.order_by('-is_pinned', '-created_at')
            
            # Calculate pagination
            total_count = announcements.count()
            total_pages = (total_count + per_page - 1) // per_page
            has_next = page < total_pages
            has_previous = page > 1
            
            print(f"AnnouncementListView: Pagination info:")
            print(f"  total_count: {total_count}")
            print(f"  total_pages: {total_pages}")
            print(f"  has_next: {has_next}")
            print(f"  has_previous: {has_previous}")
            
            # Get paginated announcements
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            paginated_announcements = announcements[start_index:end_index]
            
            print(f"AnnouncementListView: Paginated announcements count: {len(paginated_announcements)}")
            
            # Format the announcements data
            formatted_announcements = []
            for announcement in paginated_announcements:
                # Get the author's name
                author_name = f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username
                
                # Calculate time ago
                now = timezone.now()
                diff = now - announcement.created_at
                
                if diff.days > 0:
                    time_ago = f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
                elif diff.seconds > 3600:
                    hours = diff.seconds // 3600
                    time_ago = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                else:
                    minutes = diff.seconds // 60
                    time_ago = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                
                formatted_announcement = {
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'author': author_name,
                    'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                    'created_at': announcement.created_at.isoformat(),
                    'updated_at': announcement.updated_at.isoformat(),
                    'comments_count': announcement.comments_count,
                    'time_ago': time_ago,
                    'announcement_type': announcement.announcement_type,
                    'is_pinned': announcement.is_pinned,
                    'views_count': announcement.views_count,
                    'likes_count': announcement.likes_count,
                    'engagement_rate': announcement.engagement_rate,
                    'has_image': bool(announcement.image),
                    'has_file': bool(announcement.file),
                    'image': announcement.image.url if announcement.image else None,
                    'file': announcement.file.url if announcement.file else None,
                    'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
                }
                formatted_announcements.append(formatted_announcement)
            
            print(f"AnnouncementListView: Formatted {len(formatted_announcements)} announcements")
            
            return Response({
                'results': formatted_announcements,
                'count': total_count,
                'next': None,  # Could implement full URL if needed
                'previous': None,  # Could implement full URL if needed
                'total_pages': total_pages,
                'current_page': page,
                'has_next': has_next,
                'has_previous': has_previous,
            })

        except Exception as e:
            print(f"Error in AnnouncementListView: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response(
                {'error': 'Failed to fetch announcements'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementCreateView(APIView):
    """API endpoint to create new announcements"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            print(f"=== AnnouncementCreateView POST Request ===")
            print(f"User: {request.user}")
            print(f"User role: {getattr(request.user, 'role', 'No role attribute')}")
            print(f"User authenticated: {request.user.is_authenticated}")
            print(f"Request data: {request.data}")
            print(f"Request FILES: {request.FILES}")
            
            # Check if user has permission to create announcements
            user_role = getattr(request.user, 'role', None)
            if not user_role or user_role not in ['BDE', 'ADMIN']:
                print(f"Permission denied for user role: {user_role}")
                # For development/testing, allow if user is superuser
                if not request.user.is_superuser:
                    return Response(
                        {'error': f'You do not have permission to create announcements. Your role: {user_role}'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                else:
                    print(f"Allowing superuser {request.user.username} to create announcements")
            
            # Get data from request
            title = request.data.get('title')
            content = request.data.get('content')
            announcement_type = request.data.get('announcement_type')
            is_pinned = request.data.get('is_pinned', False)
            scheduled_at = request.data.get('scheduled_at')
            image = request.FILES.get('image')
            file = request.FILES.get('file')
            
            print(f"Extracted data:")
            print(f"  title: {title}")
            print(f"  content: {content}")
            print(f"  announcement_type: {announcement_type}")
            print(f"  is_pinned: {is_pinned}")
            print(f"  scheduled_at: {scheduled_at}")
            print(f"  image: {image}")
            print(f"  file: {file}")
            
            # Validate required fields
            if not title or not content:
                print(f"Validation failed: missing title or content")
                return Response(
                    {'error': 'Title and content are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convert string boolean to actual boolean
            if isinstance(is_pinned, str):
                is_pinned = is_pinned.lower() in ['true', '1', 'yes']
            
            # Create announcement
            print(f"Creating announcement...")
            announcement = Post.objects.create(
                title=title,
                content=content,
                created_by=request.user,
                announcement_type=announcement_type,
                is_pinned=is_pinned,
                is_announcement=True,
                scheduled_at=scheduled_at,
                image=image,
                file=file
            )
            print(f"Announcement created successfully: {announcement.id}")
            
            # Format response
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                'author_avatar': request.user.profile_picture.url if request.user.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'comments_count': 0,
                'time_ago': 'Just now',
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': 0,
                'likes_count': 0,
                'engagement_rate': 0,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
            }
            
            return Response(formatted_announcement, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"=== ERROR in AnnouncementCreateView ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Full traceback:")
            print(traceback.format_exc())
            print(f"=== END ERROR ===")
            return Response(
                {'error': f'Failed to create announcement: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementDetailView(APIView):
    """API endpoint to get, update, or delete a specific announcement"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Increment views
            announcement.increment_views()
            
            # Calculate time ago
            now = timezone.now()
            diff = now - announcement.created_at
            
            if diff.days > 0:
                time_ago = f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                time_ago = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
            else:
                minutes = diff.seconds // 60
                time_ago = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
            
            # Format response
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'comments_count': announcement.comments_count,
                'time_ago': time_ago,
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'engagement_rate': announcement.engagement_rate,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
            }
            
            return Response(formatted_announcement)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementDetailView: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response(
                {'error': 'Failed to fetch announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to update announcements
            if not hasattr(request.user, 'role') or request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to update announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get data from request
            title = request.data.get('title', announcement.title)
            content = request.data.get('content', announcement.content)
            announcement_type = request.data.get('announcement_type', announcement.announcement_type)
            is_pinned = request.data.get('is_pinned', announcement.is_pinned)
            scheduled_at = request.data.get('scheduled_at', announcement.scheduled_at)
            
            # Convert string boolean to actual boolean
            if isinstance(is_pinned, str):
                is_pinned = is_pinned.lower() in ['true', '1', 'yes']
            
            # Update fields
            announcement.title = title
            announcement.content = content
            announcement.announcement_type = announcement_type
            announcement.is_pinned = is_pinned
            announcement.scheduled_at = scheduled_at
            
            # Handle file uploads
            if 'image' in request.FILES:
                announcement.image = request.FILES['image']
            if 'file' in request.FILES:
                announcement.file = request.FILES['file']
            
            announcement.save()
            
            # Format response
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'comments_count': announcement.comments_count,
                'time_ago': 'Just updated',
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'engagement_rate': announcement.engagement_rate,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
            }
            
            return Response(formatted_announcement)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementDetailView PUT: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response(
                {'error': 'Failed to update announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to delete announcements
            if not hasattr(request.user, 'role') or request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to delete announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            announcement.delete()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementDetailView DELETE: {str(e)}")
            return Response(
                {'error': 'Failed to delete announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementPinView(APIView):
    """API endpoint to pin/unpin announcements"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to pin announcements
            if not hasattr(request.user, 'role') or request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to pin announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            is_pinned = request.data.get('is_pinned', False)
            
            # Convert string boolean to actual boolean
            if isinstance(is_pinned, str):
                is_pinned = is_pinned.lower() in ['true', '1', 'yes']
            
            announcement.is_pinned = is_pinned
            announcement.save()
            
            # Format response
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'comments_count': announcement.comments_count,
                'time_ago': 'Just updated',
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'engagement_rate': announcement.engagement_rate,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
            }
            
            return Response(formatted_announcement)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementPinView: {str(e)}")
            return Response(
                {'error': 'Failed to pin/unpin announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementBulkDeleteView(APIView):
    """API endpoint to bulk delete announcements"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        try:
            # Check if user has permission to delete announcements
            if not hasattr(request.user, 'role') or request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to delete announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            ids = request.data.get('ids', [])
            
            if not ids:
                return Response(
                    {'error': 'No announcement IDs provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete announcements
            deleted_count = Post.objects.filter(
                id__in=ids, 
                is_announcement=True
            ).delete()[0]
            
            return Response({
                'message': f'Successfully deleted {deleted_count} announcements',
                'deleted_count': deleted_count
            })
            
        except Exception as e:
            print(f"Error in AnnouncementBulkDeleteView: {str(e)}")
            return Response(
                {'error': 'Failed to delete announcements'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementCommentsView(APIView):
    """API endpoint to get comments for an announcement"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            # Get the announcement
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Get comments for this announcement
            comments = PostComment.objects.filter(post=announcement).order_by('created_at')
            
            # Format comments
            formatted_comments = []
            for comment in comments:
                # Calculate time ago
                now = timezone.now()
                diff = now - comment.created_at
                
                if diff.days > 0:
                    time_ago = f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
                elif diff.seconds > 3600:
                    hours = diff.seconds // 3600
                    time_ago = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                else:
                    minutes = diff.seconds // 60
                    time_ago = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                
                # Check if commenter is the author of the announcement
                is_author = comment.user.id == announcement.created_by.id
                
                formatted_comment = {
                    'id': comment.id,
                    'content': comment.content,
                    'user': {
                        'id': comment.user.id,
                        'username': comment.user.username,
                        'first_name': comment.user.first_name,
                        'last_name': comment.user.last_name,
                        'profile_picture': comment.user.profile_picture.url if comment.user.profile_picture else None,
                    },
                    'created_at': comment.created_at.isoformat(),
                    'time_ago': time_ago,
                    'is_author': is_author,
                }
                formatted_comments.append(formatted_comment)
            
            return Response({
                'comments': formatted_comments,
                'count': len(formatted_comments)
            })
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementCommentsView: {str(e)}")
            return Response(
                {'error': 'Failed to fetch comments'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, pk):
        """Add a comment to an announcement"""
        try:
            # Get the announcement
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Get comment content
            content = request.data.get('content', '').strip()
            
            if not content:
                return Response(
                    {'error': 'Comment content is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the comment
            comment = PostComment.objects.create(
                post=announcement,
                user=request.user,
                content=content
            )
            
            # Check if commenter is the author of the announcement
            is_author = comment.user.id == announcement.created_by.id
            
            # Format the response
            formatted_comment = {
                'id': comment.id,
                'content': comment.content,
                'user': {
                    'id': comment.user.id,
                    'username': comment.user.username,
                    'first_name': comment.user.first_name,
                    'last_name': comment.user.last_name,
                    'profile_picture': comment.user.profile_picture.url if comment.user.profile_picture else None,
                },
                'created_at': comment.created_at.isoformat(),
                'time_ago': 'Just now',
                'is_author': is_author,
            }
            
            return Response(formatted_comment, status=status.HTTP_201_CREATED)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementCommentsView POST: {str(e)}")
            return Response(
                {'error': 'Failed to create comment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementLikeView(APIView):
    """API endpoint to like/unlike an announcement"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            # Get the announcement
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user already liked this announcement
            existing_reaction = Reaction.objects.filter(
                post=announcement,
                user=request.user,
                reaction_type='LIKE'
            ).first()
            
            if existing_reaction:
                # Unlike - remove the reaction
                existing_reaction.delete()
                liked = False
            else:
                # Like - create new reaction
                Reaction.objects.create(
                    post=announcement,
                    user=request.user,
                    reaction_type='LIKE'
                )
                liked = True
            
            # Get updated like count
            likes_count = announcement.likes_count
            
            return Response({
                'liked': liked,
                'likes_count': likes_count
            })
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementLikeView: {str(e)}")
            return Response(
                {'error': 'Failed to process like'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request, pk):
        """Check if user has liked this announcement"""
        try:
            # Get the announcement
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user liked this announcement
            liked = Reaction.objects.filter(
                post=announcement,
                user=request.user,
                reaction_type='LIKE'
            ).exists()
            
            return Response({
                'liked': liked,
                'likes_count': announcement.likes_count
            })
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementLikeView GET: {str(e)}")
            return Response(
                {'error': 'Failed to check like status'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )