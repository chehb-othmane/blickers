from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event, EventRegistration, ForumTopic, ForumCategory, Report, Message, Post, PostComment, Reaction, ForumReply, Notification, TwoFactorAuth, RecoveryCode, EventType
from .serializers import EventSerializer, ForumTopicListSerializer, PostSerializer
from django.utils import timezone
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
import os
from django.db import models
from django.db.models import Count, Q
from django.core.paginator import Paginator
from datetime import timedelta, datetime
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import pyotp
import qrcode
from io import BytesIO
import base64
import random
import string
from django.db.models import Q

User = get_user_model()

class EventListView(APIView):
    """API endpoint to retrieve all events"""
    # Removing permission_classes to allow public access
    
    def get(self, request):
        try:
            events = Event.objects.all()
            
            # Filter by type
            event_type = request.query_params.get('type')
            if event_type:
                events = events.filter(event_type__name=event_type)
            
            # Filter by status
            status = request.query_params.get('status')
            if status:
                events = events.filter(status=status)
            
            # Filter by date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date:
                events = events.filter(start_date__gte=start_date)
            if end_date:
                events = events.filter(start_date__lte=end_date)
            
            # Filter by location
            location = request.query_params.get('location')
            if location:
                events = events.filter(location__icontains=location)
            
            # Sort by date
            sort_by = request.query_params.get('sort_by', 'start_date')
            if sort_by == 'start_date':
                events = events.order_by('start_date')
            elif sort_by == '-start_date':
                events = events.order_by('-start_date')
            
            # Prefetch related data to avoid N+1 queries
            events = events.select_related('event_type').prefetch_related('registrations')
            
            # Pass request context to serializer for proper image URL generation
            serializer = EventSerializer(events, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        try:
            serializer = EventSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EventInterestView(APIView):
    """API endpoint to mark interest in an event"""
    permission_classes = [IsAuthenticated]  # Only authenticated users can mark interest
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Check if registration already exists
            registration, created = EventRegistration.objects.get_or_create(
                event=event,
                user=request.user,
                defaults={'status': 'INTERESTED'}
            )
            
            if not created:
                # Toggle between interested and cancelled
                if registration.status == 'INTERESTED':
                    registration.status = 'CANCELLED'
                else:
                    registration.status = 'INTERESTED'
                registration.save()
            
            return Response({
                'status': registration.status,
                'message': f"You are now {registration.get_status_display().lower()} in this event"
            })
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
class ForumTopicListView(APIView):
    """API endpoint to retrieve forum topics for preview"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get the most recent and active topics
        topics = ForumTopic.objects.filter(
            is_closed=False
        ).order_by('-is_pinned', '-updated_at')[:3]  # Limit to 3 topics for the preview
        
        serializer = ForumTopicListSerializer(topics, many=True)
        return Response(serializer.data)

class ForumCategoryListView(APIView):
    """API endpoint to retrieve all forum categories"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = ForumCategory.objects.all().order_by('order')
        return Response([{
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'icon': category.icon,
            'topics': category.topics.count(),
            'posts': sum(topic.replies.count() + 1 for topic in category.topics.all())  # +1 for the topic itself
        } for category in categories])

class ForumTopicDetailView(APIView):
    """API endpoint to retrieve a single forum topic with its replies"""
    permission_classes = [AllowAny]
    
    def get(self, request, topic_id):
        try:
            topic = ForumTopic.objects.get(id=topic_id)
            # Increment view count
            topic.views_count += 1
            topic.save()
            
            # Get topic details
            topic_data = {
                'id': topic.id,
                'title': topic.title,
                'content': topic.content,
                'category': {
                    'id': topic.category.id,
                    'name': topic.category.name
                },
                'author': {
                    'id': topic.created_by.id,
                    'name': topic.created_by.get_full_name() or topic.created_by.username,
                    'avatar': topic.created_by.profile_picture.url if topic.created_by.profile_picture else None
                },
                'created_at': topic.created_at,
                'updated_at': topic.updated_at,
                'is_pinned': topic.is_pinned,
                'is_closed': topic.is_closed,
                'views_count': topic.views_count,
                'replies': [{
                    'id': reply.id,
                    'content': reply.content,
                    'author': {
                        'id': reply.created_by.id,
                        'name': reply.created_by.get_full_name() or reply.created_by.username,
                        'avatar': reply.created_by.profile_picture.url if reply.created_by.profile_picture else None
                    },
                    'created_at': reply.created_at,
                    'updated_at': reply.updated_at,
                    'is_solution': reply.is_solution
                } for reply in topic.replies.all().order_by('created_at')]
            }
            return Response(topic_data)
        except ForumTopic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        
class SignupView(APIView):
    permission_classes = [AllowAny]
    
    @transaction.atomic
    def post(self, request):
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    'message': 'User registered successfully',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            
            # Format validation errors
            errors = {}
            for field, error_list in serializer.errors.items():
                if isinstance(error_list, list):
                    errors[field] = error_list[0]  # Take the first error message
                else:
                    errors[field] = str(error_list)
            
            return Response({
                'error': 'Validation failed',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        # Generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"http://localhost:3000/password-reset-confirm?token={token}&uid={uid}"
        
        # HTML email template
        html_message = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Email - Blickers</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body {{
                    font-family: 'Inter', sans-serif;
                }}
                a {{
                    color: #6c757d !important;
                    text-decoration: none;
                }}
                .button-link {{
                    color: white !important;
                    text-decoration: none;
                }}
            </style>
        </head>
        <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #fff; border-radius: 8px; border: 1px solid #dee2e6; overflow: hidden;">
                    <div style="background-color: #f1f3f5; padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #fd7e14; margin-right: 8px;"></div>
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #99c805; margin-right: 8px;"></div>
                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #9b9bff; margin-right: 8px;"></div>
                        </div>
                        <div style="font-size: 14px; color: #6c757d; margin-left: auto;">Email</div>
                    </div>
                    
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 16px;">
                            <p style="font-size: 14px; color: #6c757d; margin-bottom: 4px;">From: Blickers Support &lt;blickers.plat@gmail.com&gt;</p>
                            <p style="font-size: 14px; color: #6c757d; margin-bottom: 4px;">To: {user.get_full_name()} &lt;{email}&gt;</p>
                            <p style="font-size: 14px; color: #6c757d; margin-bottom: 4px;">Subject: Reset Your Blickers Password</p>
                        </div>

                        <div style="border-top: 1px solid #dee2e6; padding-top: 16px;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="font-family: 'Inter', sans-serif; font-weight: 700; font-size: 24px; margin-right: 8px;">Blickers</div>
                            </div>

                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">Hello,</p>
                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">
                                We received a request to reset your password for your Blickers account. If you didn't make this
                                request, you can safely ignore this email.
                            </p>
                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">To reset your password, click on the button below:</p>

                            <div style="text-align: center;">
                                <a href="{reset_link}" class="button-link" style="display: inline-block; background: linear-gradient(to right, #9b9bff, #6262cf); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 24px 0;">Reset Your Password</a>
                            </div>

                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">Or copy and paste the following URL into your browser:</p>
                            <div style="background-color: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 14px; color: #495057; margin-bottom: 16px; word-break: break-word;">
                                <a href="{reset_link}" style="color: #6c757d;">{reset_link}</a>
                            </div>

                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">
                                This link will expire in 24 hours. After that, you'll need to submit a new password reset request.
                            </p>

                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">
                                If you have any questions, please contact our support team at <a href="mailto:blickers.plat@gmail.com" style="color: #6c757d;">support@blickers.edu</a>.
                            </p>

                            <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: #495057; margin-bottom: 16px;">
                                Best regards,<br />
                                The Blickers Team
                            </p>

                            <div style="border-top: 1px solid #dee2e6; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #6c757d;">
                                <p style="font-family: 'Inter', sans-serif; font-weight: 400;">This is an automated message, please do not reply to this email.</p>
                                <p style="font-family: 'Inter', sans-serif; font-weight: 400;">© 2025 Blickers Student Union. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        try:
            send_mail(
                subject='Reset Your Blickers Password',
                message='',  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent successfully'})
        except Exception as e:
            print(f"Email sending error: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to send email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except User.DoesNotExist:
        # Don't reveal that the user doesn't exist
        return Response({'message': 'If an account exists with this email, you will receive a password reset link'})
    except Exception as e:
        print(f"General error: {str(e)}")  # For debugging
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    token = request.data.get('token')
    uid = request.data.get('uid')
    password = request.data.get('password')
    
    if not all([token, uid, password]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successful'})
        else:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError, User.DoesNotExist):
        return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get user data
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DashboardStatsView(APIView):
    """API endpoint to retrieve dashboard statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get total users count
        total_users = User.objects.count()
        
        # Get upcoming events count
        upcoming_events = Event.objects.filter(
            is_published=True,
            end_date__gte=timezone.now()
        ).count()
        
        # Get pending reports count
        pending_reports = Report.objects.filter(
            status='PENDING'
        ).count()
        
        # Get new messages count (messages from last 24 hours)
        new_messages = Message.objects.filter(
            timestamp__gte=timezone.now() - timedelta(days=1)
        ).count()
        
        # Calculate changes from last month
        last_month = timezone.now() - timedelta(days=30)
        
        # Users change
        last_month_users = User.objects.filter(
            date_joined__lt=last_month
        ).count()
        users_change = f"+{((total_users - last_month_users) / last_month_users * 100):.0f}%" if last_month_users > 0 else "+0%"
        
        # Events change
        last_month_events = Event.objects.filter(
            created_at__lt=last_month,
            is_published=True
        ).count()
        events_change = f"+{upcoming_events - last_month_events}" if upcoming_events > last_month_events else f"{upcoming_events - last_month_events}"
        
        # Reports change
        last_month_reports = Report.objects.filter(
            created_at__lt=last_month,
            status='PENDING'
        ).count()
        reports_change = f"{pending_reports - last_month_reports}"
        
        # Messages change
        last_month_messages = Message.objects.filter(
            timestamp__lt=last_month
        ).count()
        messages_change = f"+{new_messages - last_month_messages}" if new_messages > last_month_messages else f"{new_messages - last_month_messages}"
        
        return Response({
            'total_users': {
                'value': total_users,
                'change': users_change
            },
            'upcoming_events': {
                'value': upcoming_events,
                'change': events_change
            },
            'pending_reports': {
                'value': pending_reports,
                'change': reports_change
            },
            'new_messages': {
                'value': new_messages,
                'change': messages_change
            }
        })

class AnnouncementListView(APIView):
    """API endpoint to retrieve latest announcements"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get query parameters
            search_query = request.query_params.get('search', '')
            filter_type = request.query_params.get('type', 'all')
            sort_by = request.query_params.get('sort', 'newest')
            page = int(request.query_params.get('page', 1))
            per_page = int(request.query_params.get('per_page', 6))
            
            # Base queryset
            announcements = Post.objects.filter(is_announcement=True)
            
            # Apply search filter
            if search_query:
                announcements = announcements.filter(
                    Q(title__icontains=search_query) |
                    Q(content__icontains=search_query) |
                    Q(created_by__username__icontains=search_query) |
                    Q(created_by__first_name__icontains=search_query) |
                    Q(created_by__last_name__icontains=search_query)
                )
            
            # Apply type filter
            if filter_type != 'all':
                announcements = announcements.filter(announcement_type=filter_type)
            
            # Apply sorting
            if sort_by == 'newest':
                announcements = announcements.order_by('-is_pinned', '-created_at')
            elif sort_by == 'oldest':
                announcements = announcements.order_by('-is_pinned', 'created_at')
            elif sort_by == 'engagement':
                announcements = announcements.order_by('-is_pinned', '-views_count')
            elif sort_by == 'views':
                announcements = announcements.order_by('-is_pinned', '-views_count')
            
            # Calculate pagination
            total_count = announcements.count()
            total_pages = (total_count + per_page - 1) // per_page
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            
            # Get paginated announcements
            paginated_announcements = announcements[start_index:end_index]
            
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
                    'comments_count': announcement.comments_count,
                    'time_ago': time_ago,
                    'announcement_type': announcement.announcement_type,
                    'is_pinned': announcement.is_pinned,
                    'views_count': announcement.views_count,
                    'likes_count': announcement.likes_count,
                    'engagement_rate': announcement.engagement_rate,
                    'has_image': bool(announcement.image),
                    'has_file': bool(announcement.file),
                    'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
                }
                formatted_announcements.append(formatted_announcement)
            
            # Calculate next and previous page URLs
            next_page = page + 1 if page < total_pages else None
            previous_page = page - 1 if page > 1 else None
            
            return Response({
                'results': formatted_announcements,
                'count': total_count,
                'next': f"/api/announcements/?page={next_page}" if next_page else None,
                'previous': f"/api/announcements/?page={previous_page}" if previous_page else None
            })
        except Exception as e:
            print(f"Error in AnnouncementListView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to fetch announcements'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PendingModerationView(APIView):
    """API endpoint to retrieve pending moderation reports"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get pending reports with related information
        reports = Report.objects.filter(
            status='PENDING'
        ).order_by('-created_at')[:5]  # Limit to 5 most recent reports
        
        formatted_reports = []
        for report in reports:
            # Get the content type and ID
            content_type = report.content_type
            content_id = report.content_id
            
            # Get the reporter's name
            reporter_name = f"{report.reporter.first_name} {report.reporter.last_name}".strip() or report.reporter.username
            
            # Format the report data
            formatted_report = {
                'id': report.id,
                'type': report.get_content_type_display(),
                'content': report.reason[:100] + "..." if len(report.reason) > 100 else report.reason,
                'reporter': reporter_name,
                'time': self._get_time_ago(report.created_at),
                'content_id': content_id,
                'content_type': content_type
            }
            formatted_reports.append(formatted_report)
        
        return Response(formatted_reports)
    
    def _get_time_ago(self, created_at):
        """Helper method to format time ago"""
        now = timezone.now()
        diff = now - created_at
        
        if diff.days > 0:
            return f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} {'hour' if hours == 1 else 'hours'} ago"
        else:
            minutes = diff.seconds // 60
            return f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"

class ActivityOverviewView(APIView):
    """API endpoint to retrieve activity overview data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get user activity for the past week
        today = timezone.now().date()
        week_ago = today - timedelta(days=6)
        
        # Daily user activity (logins, posts, comments, etc.)
        daily_activity = []
        for i in range(7):
            date = week_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            
            # Count activities for this day
            activity_count = (
                User.objects.filter(last_login__date=date).count() +
                Post.objects.filter(created_at__date=date).count() +
                PostComment.objects.filter(created_at__date=date).count() +
                ForumTopic.objects.filter(created_at__date=date).count() +
                ForumReply.objects.filter(created_at__date=date).count()
            )
            
            daily_activity.append(activity_count)
        
        # Content engagement stats
        content_engagement = {
            'comments': PostComment.objects.count(),
            'posts': Post.objects.count(),
            'reactions': Reaction.objects.count(),
            'growth': self._calculate_growth()
        }
        
        # Event participation stats
        event_participation = []
        events = Event.objects.filter(
            is_published=True,
            end_date__gte=timezone.now()
        ).order_by('start_date')[:4]  # Get 4 upcoming events
        
        for event in events:
            registrations = EventRegistration.objects.filter(
                event=event,
                status__in=['REGISTERED', 'INTERESTED']
            ).count()
            
            event_participation.append({
                'name': event.title,
                'registered': registrations,
                'capacity': event.capacity or 0,
                'percentage': int((registrations / (event.capacity or 1)) * 100)
            })
        
        return Response({
            'user_activity': daily_activity,
            'content_engagement': content_engagement,
            'event_participation': event_participation
        })
    
    def _calculate_growth(self):
        """Calculate content growth percentage from last month"""
        last_month = timezone.now() - timedelta(days=30)
        
        # Get current month stats
        current_month = (
            Post.objects.filter(created_at__gte=last_month).count() +
            PostComment.objects.filter(created_at__gte=last_month).count() +
            Reaction.objects.filter(created_at__gte=last_month).count()
        )
        
        # Get previous month stats
        two_months_ago = last_month - timedelta(days=30)
        previous_month = (
            Post.objects.filter(created_at__gte=two_months_ago, created_at__lt=last_month).count() +
            PostComment.objects.filter(created_at__gte=two_months_ago, created_at__lt=last_month).count() +
            Reaction.objects.filter(created_at__gte=two_months_ago, created_at__lt=last_month).count()
        )
        
        if previous_month == 0:
            return 0
        
        growth = ((current_month - previous_month) / previous_month) * 100
        return int(growth)

    """API endpoint to toggle user active status"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            
            # Update last_login if activating user
            if user.is_active:
                user.last_login = timezone.now()
                user.save()
            
            return Response({
                'status': 'Active' if user.is_active else 'Inactive',
                'message': f"User is now {'active' if user.is_active else 'inactive'}"
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NotificationListView(APIView):
    """API endpoint to retrieve user notifications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get user's notifications
            notifications = Notification.objects.filter(
                user=request.user
            ).order_by('-created_at')[:10]  # Limit to 10 most recent notifications
            
            # Format the notifications data
            formatted_notifications = []
            for notification in notifications:
                # Calculate time ago
                now = timezone.now()
                diff = now - notification.created_at
                
                if diff.days > 0:
                    time_ago = f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
                elif diff.seconds > 3600:
                    hours = diff.seconds // 3600
                    time_ago = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                else:
                    minutes = diff.seconds // 60
                    time_ago = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                
                formatted_notification = {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.notification_type.name,
                    'icon': notification.notification_type.icon,
                    'is_read': notification.is_read,
                    'link': notification.link,
                    'time_ago': time_ago,
                    'created_at': notification.created_at.isoformat()
                }
                formatted_notifications.append(formatted_notification)
            
            return Response(formatted_notifications)
        except Exception as e:
            print(f"Error in NotificationListView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to fetch notifications'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarkNotificationsReadView(APIView):
    """API endpoint to mark notifications as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            notification_ids = request.data.get('notification_ids', [])
            
            if not notification_ids:
                # Mark all notifications as read
                Notification.objects.filter(
                    user=request.user,
                    is_read=False
                ).update(is_read=True)
            else:
                # Mark specific notifications as read
                Notification.objects.filter(
                    user=request.user,
                    id__in=notification_ids
                ).update(is_read=True)
            
            return Response({'message': 'Notifications marked as read'})
        except Exception as e:
            print(f"Error in MarkNotificationsReadView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to mark notifications as read'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(APIView):
    """API endpoint to retrieve user profile data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            # Format birthday if it exists
            birthday = user.birthday.strftime("%B %d, %Y") if user.birthday else None
            
            # Get the full URL for profile picture
            profile_picture_url = None
            if user.profile_picture:
                profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
            
            profile_data = {
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'phone': user.phone or "",
                'location': user.location or "",
                'birthday': birthday or "",
                'role': user.get_role_display(),
                'department': user.department or "",
                'joinDate': user.date_joined.strftime("%B %d, %Y"),
                'bio': user.bio or "",
                'website': user.website or "",
                'education': user.education or "",
                'languages': user.languages or [],
                'profile_picture': profile_picture_url
            }
            
            return Response(profile_data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileUpdateView(APIView):
    """API endpoint to update user profile data"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            data = request.data
            
            # Update basic fields
            if 'name' in data:
                name_parts = data['name'].split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            # Update other fields
            fields_to_update = [
                'phone', 'location', 'department', 'website', 
                'education', 'bio', 'languages'
            ]
            
            for field in fields_to_update:
                if field in data:
                    setattr(user, field, data[field])
            
            # Handle birthday separately due to date format
            if 'birthday' in data and data['birthday']:
                try:
                    from datetime import datetime
                    birthday = datetime.strptime(data['birthday'], "%B %d, %Y").date()
                    user.birthday = birthday
                except ValueError:
                    pass
            
            user.save()
            
            return Response({
                'message': 'Profile updated successfully',
                'profile': UserSerializer(user).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfilePictureUpdateView(APIView):
    """API endpoint to update user profile picture"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            profile_picture = request.FILES.get('profile_picture')
            
            if not profile_picture:
                return Response(
                    {'error': 'No image file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file type
            if not profile_picture.content_type.startswith('image/'):
                return Response(
                    {'error': 'Invalid file type. Please upload an image.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete old profile picture if it exists
            if user.profile_picture:
                try:
                    user.profile_picture.delete()
                except:
                    pass
            
            # Save new profile picture
            user.profile_picture = profile_picture
            user.save()
            
            # Return the full URL of the profile picture
            profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
            
            return Response({
                'message': 'Profile picture updated successfully',
                'profile_picture': profile_picture_url
            })
        except Exception as e:
            print(f"Error updating profile picture: {str(e)}")  # For debugging
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChangePasswordView(APIView):
    """API endpoint to change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            current_password = request.data.get('currentPassword')
            new_password = request.data.get('newPassword')
            confirm_password = request.data.get('confirmPassword')
            
            # Validate required fields
            if not all([current_password, new_password, confirm_password]):
                return Response({
                    'error': 'All fields are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if new password matches confirmation
            if new_password != confirm_password:
                return Response({
                    'error': 'New passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify current password
            user = request.user
            if not user.check_password(current_password):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate new password
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response({
                    'error': 'Password validation failed',
                    'details': list(e.messages)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': 'Password updated successfully'
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TwoFactorAuthView(APIView):
    """API endpoint to handle two-factor authentication"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get 2FA status and settings"""
        try:
            two_factor = request.user.two_factor
            return Response({
                'is_enabled': two_factor.is_enabled,
                'has_authenticator': bool(two_factor.secret_key),
                'has_email': bool(two_factor.backup_email),
                'email_verified': two_factor.email_verified
            })
        except TwoFactorAuth.DoesNotExist:
            return Response({
                'is_enabled': False,
                'has_authenticator': False,
                'has_email': False,
                'email_verified': False
            })
    
    def post(self, request):
        """Setup or update 2FA settings"""
        action = request.data.get('action')
        
        if action == 'setup_authenticator':
            return self._setup_authenticator(request)
        elif action == 'verify_authenticator':
            return self._verify_authenticator(request)
        elif action == 'setup_email':
            return self._setup_email(request)
        elif action == 'verify_email':
            return self._verify_email(request)
        elif action == 'generate_recovery_codes':
            return self._generate_recovery_codes(request)
        elif action == 'disable_2fa':
            return self._disable_2fa(request)
        
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _setup_authenticator(self, request):
        """Setup authenticator app"""
        try:
            # Generate secret key
            secret_key = pyotp.random_base32()
            
            # Generate QR code
            totp = pyotp.TOTP(secret_key)
            provisioning_uri = totp.provisioning_uri(
                request.user.email,
                issuer_name="Blickers"
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_code = base64.b64encode(buffer.getvalue()).decode()
            
            # Save secret key temporarily
            two_factor, _ = TwoFactorAuth.objects.get_or_create(user=request.user)
            two_factor.secret_key = secret_key
            two_factor.save()
            
            return Response({
                'secret_key': secret_key,
                'qr_code': qr_code
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _verify_authenticator(self, request):
        """Verify authenticator code"""
        try:
            code = request.data.get('code')
            if not code:
                return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            two_factor = request.user.two_factor
            if not two_factor.secret_key:
                return Response({'error': 'Authenticator not setup'}, status=status.HTTP_400_BAD_REQUEST)
            
            totp = pyotp.TOTP(two_factor.secret_key)
            if totp.verify(code):
                two_factor.is_enabled = True
                two_factor.save()
                return Response({'message': 'Authenticator verified successfully'})
            
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _setup_email(self, request):
        """Setup email as backup method"""
        try:
            email = request.data.get('email')
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate verification code
            verification_code = ''.join(random.choices(string.digits, k=6))
            
            # Save email and verification code
            two_factor, _ = TwoFactorAuth.objects.get_or_create(user=request.user)
            two_factor.backup_email = email
            two_factor.save()
            
            # Load and render the HTML template
            html_message = render_to_string('two-factor-email.html', {
                'verification_code': verification_code,
                'user_email': email,
                'user_name': request.user.get_full_name() or request.user.username
            })
            
            # Send verification email
            send_mail(
                subject='Your Two-Factor Authentication Code - Blickers',
                message=f'Your verification code is: {verification_code}',  # Plain text fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({'message': 'Verification code sent'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _verify_email(self, request):
        """Verify email code"""
        try:
            code = request.data.get('code')
            if not code:
                return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            two_factor = request.user.two_factor
            if not two_factor.backup_email:
                return Response({'error': 'Email not setup'}, status=status.HTTP_400_BAD_REQUEST)
            
            # In a real implementation, you would verify the code against what was sent
            # For now, we'll just mark it as verified
            two_factor.email_verified = True
            two_factor.save()
            
            return Response({'message': 'Email verified successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_recovery_codes(self, request):
        """Generate new recovery codes"""
        try:
            # Delete old recovery codes
            RecoveryCode.objects.filter(user=request.user).delete()
            
            # Generate new codes
            codes = []
            for _ in range(4):
                code = '-'.join([''.join(random.choices(string.ascii_uppercase + string.digits, k=4)) for _ in range(4)])
                RecoveryCode.objects.create(user=request.user, code=code)
                codes.append(code)
            
            return Response({'recovery_codes': codes})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _disable_2fa(self, request):
        """Disable 2FA"""
        try:
            two_factor = request.user.two_factor
            two_factor.is_enabled = False
            two_factor.secret_key = None
            two_factor.backup_email = None
            two_factor.email_verified = False
            two_factor.save()
            
            # Delete recovery codes
            RecoveryCode.objects.filter(user=request.user).delete()
            
            return Response({'message': '2FA disabled successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserListView(APIView):
    """API endpoint to retrieve all users"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            print("UserListView: Starting to fetch users")  # Debug log
            
            # Get filter parameters from query params
            join_date_from = request.query_params.get('join_date_from')
            join_date_to = request.query_params.get('join_date_to')
            last_activity = request.query_params.get('last_activity')
            
            # Start with base queryset
            users = User.objects.all()
            
            # Apply join date filters if provided
            if join_date_from:
                users = users.filter(date_joined__gte=join_date_from)
            if join_date_to:
                users = users.filter(date_joined__lte=join_date_to)
            
            # Apply last activity filter if provided
            if last_activity and last_activity != 'any':
                now = timezone.now()
                if last_activity == 'today':
                    users = users.filter(last_login__date=now.date())
                elif last_activity == 'week':
                    week_ago = now - timedelta(days=7)
                    users = users.filter(last_login__gte=week_ago)
                elif last_activity == 'month':
                    month_ago = now - timedelta(days=30)
                    users = users.filter(last_login__gte=month_ago)
            
            # Order by date joined
            users = users.order_by('-date_joined')
            
            print(f"UserListView: Found {users.count()} users")  # Debug log
            
            # Format the users data
            formatted_users = []
            for user in users:
                # Get the full name or username
                name = f"{user.first_name} {user.last_name}".strip() or user.username
                
                # Calculate last active time
                last_active = "Never"
                if user.last_login:
                    now = timezone.now()
                    diff = now - user.last_login
                    
                    if diff.days > 0:
                        last_active = f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
                    elif diff.seconds > 3600:
                        hours = diff.seconds // 3600
                        last_active = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                    else:
                        minutes = diff.seconds // 60
                        last_active = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                
                # Get profile picture URL
                avatar_url = None
                if user.profile_picture:
                    avatar_url = request.build_absolute_uri(user.profile_picture.url)
                
                formatted_user = {
                    'id': str(user.id),
                    'name': name,
                    'email': user.email,
                    'role': user.get_role_display(),
                    'status': 'Active' if user.is_active else 'Inactive',
                    'lastActive': last_active,
                    'joinDate': user.date_joined.strftime("%b %d, %Y"),
                    'avatar': avatar_url or "/placeholder.svg?height=40&width=40"
                }
                formatted_users.append(formatted_user)
            
            print("UserListView: Successfully formatted users")  # Debug log
            return Response(formatted_users)
        except Exception as e:
            print(f"UserListView Error: {str(e)}")  # Debug log
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CreateUserView(APIView):
    """API endpoint to create a new user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Extract data from request
            data = {
                'email': request.data.get('email'),
                'password': request.data.get('password'),
                'first_name': request.data.get('name', '').split(' ', 1)[0],
                'last_name': request.data.get('name', '').split(' ', 1)[1] if ' ' in request.data.get('name', '') else '',
                'role': request.data.get('role', 'STUDENT'),
                'is_active': True
            }
            
            # Create user
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data['role'],
                is_active=data['is_active']
            )
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateUserView(APIView):
    """API endpoint to update an existing user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Update user fields
            if 'name' in request.data:
                name_parts = request.data['name'].split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            if 'email' in request.data:
                user.email = request.data['email']
                user.username = request.data['email']  # Update username to match email
            
            if 'role' in request.data:
                user.role = request.data['role']
            
            if 'status' in request.data:
                user.is_active = request.data['status'] == 'Active'
            
            user.save()
            
            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteUserView(APIView):
    """API endpoint to delete a user"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({
                'message': 'User deleted successfully'
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ExportUsersView(APIView):
    """API endpoint to export users data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get all users
            users = User.objects.all().order_by('-date_joined')
            
            # Format users data for export
            export_data = []
            for user in users:
                # Get the full name or username
                name = f"{user.first_name} {user.last_name}".strip() or user.username
                
                user_data = {
                    'ID': str(user.id),
                    'Name': name,
                    'Email': user.email,
                    'Role': user.get_role_display(),
                    'Join Date': user.date_joined.strftime("%b %d, %Y"),
                    'Year of Study': user.year_of_study or 'N/A',
                    'Major': user.major or 'N/A',
                    'Phone': user.phone or 'N/A',
                    'Location': user.location or 'N/A'
                }
                export_data.append(user_data)
            
            return Response(export_data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EventRegistrationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Check if event is full
            if event.registrations.filter(status='REGISTERED').count() >= event.capacity:
                return Response(
                    {'error': 'Event is full'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user is already registered
            registration = EventRegistration.objects.filter(
                event=event,
                user=request.user,
                status='REGISTERED'
            ).first()
            
            if registration:
                return Response(
                    {'error': 'You are already registered for this event'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new registration
            registration = EventRegistration.objects.create(
                event=event,
                user=request.user,
                status='REGISTERED'
            )
            
            return Response(
                {'message': 'Successfully registered for event'},
                status=status.HTTP_201_CREATED
            )
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class EventUnregistrationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Find user's registration
            registration = EventRegistration.objects.filter(
                event=event,
                user=request.user,
                status='REGISTERED'
            ).first()
            
            if not registration:
                return Response(
                    {'error': 'You are not registered for this event'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete registration
            registration.delete()
            
            return Response(
                {'message': 'Successfully unregistered from event'},
                status=status.HTTP_200_OK
            )
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class CreateEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Validate required fields
            required_fields = ['title', 'description', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'capacity']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get or create event type
            try:
                event_type = EventType.objects.get(name=request.data['type'])
            except EventType.DoesNotExist:
                event_type = EventType.objects.create(name=request.data['type'])
            
            # Combine date and time fields into datetime objects and make them timezone-aware
            try:
                start_datetime = timezone.make_aware(datetime.combine(
                    datetime.strptime(request.data['start_date'], '%Y-%m-%d').date(),
                    datetime.strptime(request.data['start_time'], '%H:%M').time()
                ))
                
                end_datetime = timezone.make_aware(datetime.combine(
                    datetime.strptime(request.data['end_date'], '%Y-%m-%d').date(),
                    datetime.strptime(request.data['end_time'], '%H:%M').time()
                ))
            except ValueError as e:
                return Response(
                    {'error': f'Invalid date/time format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create event with all required fields
            event_data = {
                'title': request.data['title'],
                'description': request.data['description'],
                'event_type': event_type,
                'start_date': start_datetime,
                'end_date': end_datetime,
                'location': request.data['location'],
                'capacity': request.data['capacity'],
                'created_by': request.user,
                'status': request.data.get('status', 'Upcoming'),
                'is_published': request.data.get('is_published', True),
                'start_time': datetime.strptime(request.data['start_time'], '%H:%M').time(),
                'end_time': datetime.strptime(request.data['end_time'], '%H:%M').time()
            }
            
            # Handle image if provided
            if 'image' in request.FILES:
                event_data['image'] = request.FILES['image']
            
            # Create the event
            event = Event.objects.create(**event_data)
            
            # Serialize and return the created event with request context
            serializer = EventSerializer(event, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class EventTypeListView(APIView):
    """API endpoint to retrieve all event types"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            event_types = EventType.objects.all()
            return Response([{'id': et.id, 'name': et.name} for et in event_types])
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeleteEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Check if user has permission to delete the event
            if event.created_by != request.user and not request.user.is_staff:
                return Response(
                    {'error': 'You do not have permission to delete this event'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            event.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UpdateEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, event_id):
        try:
            # Get the event to update
            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                return Response(
                    {'error': 'Event not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if user has permission to update the event
            if event.created_by != request.user and not request.user.is_staff:
                return Response(
                    {'error': 'You do not have permission to update this event'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validate required fields
            required_fields = ['title', 'description', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'capacity']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get or create event type
            try:
                event_type = EventType.objects.get(name=request.data['type'])
            except EventType.DoesNotExist:
                event_type = EventType.objects.create(name=request.data['type'])
            
            # Parse dates and times
            try:
                # Parse dates
                start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
                end_date = datetime.strptime(request.data['end_date'], '%Y-%m-%d').date()
                
                # Parse times (handle both HH:MM and HH:MM:SS formats)
                start_time_str = request.data['start_time']
                end_time_str = request.data['end_time']
                
                # Remove seconds if present
                if len(start_time_str.split(':')) > 2:
                    start_time_str = ':'.join(start_time_str.split(':')[:2])
                if len(end_time_str.split(':')) > 2:
                    end_time_str = ':'.join(end_time_str.split(':')[:2])
                
                start_time = datetime.strptime(start_time_str, '%H:%M').time()
                end_time = datetime.strptime(end_time_str, '%H:%M').time()
                
                # Create timezone-aware datetimes
                start_datetime = timezone.make_aware(datetime.combine(start_date, start_time))
                end_datetime = timezone.make_aware(datetime.combine(end_date, end_time))
                
            except ValueError as e:
                return Response(
                    {'error': f'Invalid date/time format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update event fields
            event.title = request.data['title']
            event.description = request.data['description']
            event.event_type = event_type
            event.start_date = start_datetime
            event.end_date = end_datetime
            event.location = request.data['location']
            
            # Ensure capacity is properly converted to integer
            try:
                capacity = int(request.data['capacity'])
                if capacity <= 0:
                    return Response(
                        {'error': 'Capacity must be a positive number'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                event.capacity = capacity
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid capacity value'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Handle status and is_published
            if 'status' in request.data:
                event.status = request.data['status']
            if 'is_published' in request.data:
                # Convert string 'True'/'False' to boolean
                event.is_published = request.data['is_published'].lower() == 'true'
            
            # Set time fields
            event.start_time = start_time
            event.end_time = end_time
            
            # Handle image if provided
            if 'image' in request.FILES:
                event.image = request.FILES['image']
            
            # Save the updated event
            event.save()
            
            # Serialize and return the updated event with request context
            serializer = EventSerializer(event, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ExportEventsView(APIView):
    """API endpoint to export events data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Log request details for debugging
            print(f"Export request from user: {request.user.username}")
            print(f"Request headers: {request.headers}")
            
            # Get all events with related data
            events = Event.objects.all().select_related('event_type').prefetch_related('registrations')
            
            if not events.exists():
                return Response(
                    {'message': 'No events found'},
                    status=status.HTTP_200_OK
                )
            
            # Format events data for export
            export_data = []
            for event in events:
                try:
                    # Get registration statistics
                    registered_count = event.registrations.filter(status='REGISTERED').count()
                    interested_count = event.registrations.filter(status='INTERESTED').count()
                    attended_count = event.registrations.filter(status='ATTENDED').count()
                    
                    event_data = {
                        'ID': str(event.id),
                        'Title': event.title,
                        'Type': event.event_type.name if event.event_type else 'N/A',
                        'Description': event.description,
                        'Start Date': event.start_date.strftime("%Y-%m-%d"),
                        'Start Time': event.start_time.strftime("%H:%M") if event.start_time else 'N/A',
                        'End Date': event.end_date.strftime("%Y-%m-%d"),
                        'End Time': event.end_time.strftime("%H:%M") if event.end_time else 'N/A',
                        'Location': event.location,
                        'Capacity': str(event.capacity) if event.capacity else 'N/A',
                        'Status': event.status,
                        'Registered': str(registered_count),
                        'Interested': str(interested_count),
                        'Attended': str(attended_count),
                        'Created Date': event.created_at.strftime("%Y-%m-%d"),
                        'Published': 'Yes' if event.is_published else 'No'
                    }
                    export_data.append(event_data)
                except Exception as e:
                    print(f"Error processing event {event.id}: {str(e)}")
                    continue
            
            if not export_data:
                return Response(
                    {'message': 'No valid event data to export'},
                    status=status.HTTP_200_OK
                )
            
            return Response(export_data)
            
        except Exception as e:
            print(f"Export error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EventParticipantsView(APIView):
    """API endpoint to get event participants"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Get all registrations for the event with user details
            registrations = EventRegistration.objects.filter(
                event=event
            ).select_related('user').order_by('-registered_at')
            
            # Serialize the data
            participants_data = []
            for registration in registrations:
                participant = {
                    'id': registration.user.id,
                    'username': registration.user.username,
                    'email': registration.user.email,
                    'first_name': registration.user.first_name,
                    'last_name': registration.user.last_name,
                    'status': registration.status,
                    'registered_at': registration.registered_at,
                    'notes': registration.notes
                }
                participants_data.append(participant)
            
            return Response(participants_data)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )

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
            sort = request.query_params.get('sort', 'newest')
            
            # Base queryset - only announcements
            queryset = Post.objects.filter(is_announcement=True)
            
            # Apply search filter
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) | Q(content__icontains=search)
                )
            
            # Apply type filter
            if type_filter and type_filter != 'all':
                queryset = queryset.filter(announcement_type=type_filter)
            
            # Apply sorting
            if sort == 'newest':
                queryset = queryset.order_by('-is_pinned', '-created_at')
            elif sort == 'oldest':
                queryset = queryset.order_by('-is_pinned', 'created_at')
            elif sort == 'most_viewed':
                queryset = queryset.order_by('-is_pinned', '-views_count')
            elif sort == 'most_liked':
                queryset = queryset.order_by('-is_pinned', '-reactions__count')
            else:
                queryset = queryset.order_by('-is_pinned', '-created_at')
            
            # Get total count
            total_count = queryset.count()
            
            # Apply pagination
            start = (page - 1) * per_page
            end = start + per_page
            announcements = queryset[start:end]
            
            # Format announcements
            formatted_announcements = []
            for announcement in announcements:
                # Calculate time ago (simple implementation)
                time_diff = timezone.now() - announcement.created_at
                if time_diff.days > 0:
                    time_ago = f"{time_diff.days} days ago"
                elif time_diff.seconds > 3600:
                    hours = time_diff.seconds // 3600
                    time_ago = f"{hours} hours ago"
                elif time_diff.seconds > 60:
                    minutes = time_diff.seconds // 60
                    time_ago = f"{minutes} minutes ago"
                else:
                    time_ago = "Just now"
                
                formatted_announcement = {
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                    'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                    'created_at': announcement.created_at.isoformat(),
                    'updated_at': announcement.updated_at.isoformat(),
                    'announcement_type': announcement.announcement_type,
                    'is_pinned': announcement.is_pinned,
                    'views_count': announcement.views_count,
                    'likes_count': announcement.likes_count,
                    'comments_count': announcement.comments_count,
                    'has_image': bool(announcement.image),
                    'has_file': bool(announcement.file),
                    'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None,
                    'time_ago': time_ago,
                    'engagement_rate': announcement.engagement_rate,
                }
                formatted_announcements.append(formatted_announcement)
            
            # Calculate pagination info
            total_pages = (total_count + per_page - 1) // per_page
            has_next = page < total_pages
            has_previous = page > 1
            
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
            if not request.user.role in ['BDE', 'ADMIN']:
                print(f"Permission denied for user role: {request.user.role}")
                return Response(
                    {'error': 'You do not have permission to create announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
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

class AnnouncementListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            announcements = Post.objects.filter(is_announcement=True).order_by('-is_pinned', '-created_at')
            
            # Apply filters
            search = request.GET.get('search', '')
            announcement_type = request.GET.get('type', '')
            sort = request.GET.get('sort', 'newest')
            
            if search:
                announcements = announcements.filter(
                    Q(title__icontains=search) | Q(content__icontains=search)
                )
            
            if announcement_type and announcement_type != 'all':
                announcements = announcements.filter(announcement_type=announcement_type)
            
            # Apply sorting
            if sort == 'oldest':
                announcements = announcements.order_by('-is_pinned', 'created_at')
            elif sort == 'title':
                announcements = announcements.order_by('-is_pinned', 'title')
            elif sort == 'most_viewed':
                announcements = announcements.order_by('-is_pinned', '-views_count')
            else:  # newest (default)
                announcements = announcements.order_by('-is_pinned', '-created_at')
            
            # Pagination
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 12))
            
            paginator = Paginator(announcements, per_page)
            page_obj = paginator.get_page(page)
            
            # Format announcements
            formatted_announcements = []
            for announcement in page_obj:
                # Calculate time ago
                now = timezone.now()
                diff = now - announcement.created_at
                
                if diff.days > 0:
                    time_ago = f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
                elif diff.seconds > 3600:
                    hours = diff.seconds // 3600
                    time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
                elif diff.seconds > 60:
                    minutes = diff.seconds // 60
                    time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
                else:
                    time_ago = "Just now"
                
                formatted_announcements.append({
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                    'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                    'created_at': announcement.created_at.isoformat(),
                    'updated_at': announcement.updated_at.isoformat(),
                    'time_ago': time_ago,
                    'announcement_type': announcement.announcement_type,
                    'is_pinned': announcement.is_pinned,
                    'views_count': announcement.views_count,
                    'likes_count': announcement.likes_count,
                    'comments_count': announcement.comments_count,
                    'engagement_rate': announcement.engagement_rate,
                    'has_image': bool(announcement.image),
                    'has_file': bool(announcement.file),
                    'image': announcement.image.url if announcement.image else None,
                    'file': announcement.file.url if announcement.file else None,
                    'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None
                })
            
            return Response({
                'results': formatted_announcements,
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            })
            
        except Exception as e:
            print(f"Error in AnnouncementListView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to fetch announcements'},
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
            
            # Format response
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'comments_count': announcement.comments_count,
                'time_ago': 'Just now',  # You might want to calculate this
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
            print(f"Error in AnnouncementDetailView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to fetch announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        try:
            print(f"UPDATE REQUEST - PK: {pk}")
            print(f"REQUEST DATA: {request.data}")
            print(f"REQUEST FILES: {request.FILES}")
            
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to update
            if request.user != announcement.created_by and request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to update this announcement'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update fields
            announcement.title = request.data.get('title', announcement.title)
            announcement.content = request.data.get('content', announcement.content)
            announcement.announcement_type = request.data.get('announcement_type', request.data.get('type', announcement.announcement_type))
            # Handle is_pinned conversion from string to boolean
            is_pinned_value = request.data.get('is_pinned', announcement.is_pinned)
            if isinstance(is_pinned_value, str):
                announcement.is_pinned = is_pinned_value.lower() == 'true'
            else:
                announcement.is_pinned = bool(is_pinned_value)
            # Handle scheduled_at parsing
            scheduled_at_value = request.data.get('scheduled_at')
            if scheduled_at_value:
                try:
                    from datetime import datetime
                    if isinstance(scheduled_at_value, str):
                        # Parse ISO format datetime string
                        announcement.scheduled_at = datetime.fromisoformat(scheduled_at_value.replace('Z', '+00:00'))
                    else:
                        announcement.scheduled_at = scheduled_at_value
                except ValueError as e:
                    print(f"Error parsing scheduled_at: {e}")
                    # Keep the original value if parsing fails
                    pass
            
            # Handle file updates
            if 'image' in request.FILES:
                announcement.image = request.FILES['image']
            if 'file' in request.FILES:
                announcement.file = request.FILES['file']
            
            try:
                announcement.save()
                print(f"Announcement {pk} saved successfully")
            except Exception as save_error:
                print(f"Error saving announcement: {save_error}")
                return Response(
                    {'error': f'Failed to save announcement: {str(save_error)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Format the response to include the updated announcement
            time_diff = timezone.now() - announcement.created_at
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hours ago"
            elif time_diff.seconds > 60:
                minutes = time_diff.seconds // 60
                time_ago = f"{minutes} minutes ago"
            else:
                time_ago = "Just now"
            
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'comments_count': announcement.comments_count,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None,
                'time_ago': time_ago,
                'engagement_rate': announcement.engagement_rate,
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
            }
            
            return Response(formatted_announcement)
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementDetailView: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to update announcement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to delete
            if request.user != announcement.created_by and request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to delete this announcement'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            announcement.delete()
            return Response({'message': 'Announcement deleted successfully'})
            
        except Post.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in AnnouncementDetailView: {str(e)}")  # For debugging
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
            
            # Check if user has permission to pin
            if request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to pin announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Toggle pin status
            is_pinned = request.data.get('is_pinned', not announcement.is_pinned)
            announcement.is_pinned = is_pinned
            announcement.save()
            
            # Format the response to include the updated announcement
            time_diff = timezone.now() - announcement.created_at
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hours ago"
            elif time_diff.seconds > 60:
                minutes = time_diff.seconds // 60
                time_ago = f"{minutes} minutes ago"
            else:
                time_ago = "Just now"
            
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'comments_count': announcement.comments_count,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None,
                'time_ago': time_ago,
                'engagement_rate': announcement.engagement_rate,
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
                {'error': 'Failed to update pin status'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnnouncementBulkDeleteView(APIView):
    """API endpoint to bulk delete announcements"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        try:
            ids = request.data.get('ids', [])
            
            if not ids:
                return Response(
                    {'error': 'No announcement IDs provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user has permission to delete
            if request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to delete announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Delete announcements
            deleted_count = Post.objects.filter(
                id__in=ids, 
                is_announcement=True
            ).delete()[0]
            
            return Response({
                'message': f'{deleted_count} announcements deleted successfully',
                'deleted_count': deleted_count
            })
            
        except Exception as e:
            print(f"Error in AnnouncementBulkDeleteView: {str(e)}")
            return Response(
                {'error': 'Failed to delete announcements'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnouncementPinView(APIView):
    """API endpoint to pin/unpin an announcement"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        try:
            announcement = Post.objects.get(pk=pk, is_announcement=True)
            
            # Check if user has permission to pin
            if request.user.role not in ['BDE', 'ADMIN']:
                return Response(
                    {'error': 'You do not have permission to pin announcements'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update pin status
            is_pinned = request.data.get('is_pinned', False)
            announcement.is_pinned = is_pinned
            announcement.save()
            
            # Calculate time ago
            time_diff = timezone.now() - announcement.created_at
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hours ago"
            elif time_diff.seconds > 60:
                minutes = time_diff.seconds // 60
                time_ago = f"{minutes} minutes ago"
            else:
                time_ago = "Just now"
            
            # Return updated announcement data
            formatted_announcement = {
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'author': f"{announcement.created_by.first_name} {announcement.created_by.last_name}".strip() or announcement.created_by.username,
                'author_avatar': announcement.created_by.profile_picture.url if announcement.created_by.profile_picture else None,
                'created_at': announcement.created_at.isoformat(),
                'updated_at': announcement.updated_at.isoformat(),
                'announcement_type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'views_count': announcement.views_count,
                'likes_count': announcement.likes_count,
                'comments_count': announcement.comments_count,
                'has_image': bool(announcement.image),
                'has_file': bool(announcement.file),
                'image': announcement.image.url if announcement.image else None,
                'file': announcement.file.url if announcement.file else None,
                'scheduled_at': announcement.scheduled_at.isoformat() if announcement.scheduled_at else None,
                'time_ago': time_ago,
                'engagement_rate': announcement.engagement_rate,
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
                {'error': 'Failed to update announcement pin status'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
