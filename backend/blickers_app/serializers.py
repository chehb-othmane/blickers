from datetime import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, User, Post, Reaction
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Event, ForumTopic

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        error_messages={
            'required': 'Password is required',
            'blank': 'Password cannot be blank'
        }
    )
    confirmPassword = serializers.CharField(
        write_only=True, 
        required=True,
        error_messages={
            'required': 'Please confirm your password',
            'blank': 'Please confirm your password'
        }
    )
    firstName = serializers.CharField(
        source='first_name',
        error_messages={
            'required': 'First name is required',
            'blank': 'First name cannot be blank'
        }
    )
    lastName = serializers.CharField(
        source='last_name',
        error_messages={
            'required': 'Last name is required',
            'blank': 'Last name cannot be blank'
        }
    )
    studentYear = serializers.IntegerField(
        source='year_of_study',
        error_messages={
            'required': 'Year of study is required',
            'invalid': 'Please enter a valid year'
        }
    )
    field = serializers.CharField(
        source='major',
        error_messages={
            'required': 'Field of study is required',
            'blank': 'Field of study cannot be blank'
        }
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'studentYear', 'field']
        extra_kwargs = {
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Email is required',
                    'blank': 'Email cannot be blank',
                    'invalid': 'Please enter a valid email address'
                }
            }
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            year_of_study=validated_data['year_of_study'],
            major=validated_data['major'],
            role='STUDENT'
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'profile_picture', 'bio', 'year_of_study', 'major', 'is_online']
        read_only_fields = ['id', 'is_online', 'last_online']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    formatted_timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'formatted_timestamp', 'is_read']
        
    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime("%H:%M %d/%m/%Y")


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'participants', 'created_at', 'updated_at', 
                  'is_group_chat', 'last_message', 'unread_count']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user:
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0
    

class EventSerializer(serializers.ModelSerializer):
    registered = serializers.SerializerMethodField()
    createdDate = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    endTime = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'type', 'date', 'time', 'endTime',
            'location', 'capacity', 'registered', 'status', 'image', 'createdDate',
            'start_date', 'end_date', 'start_time', 'end_time', 'is_published',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_registered(self, obj):
        return obj.registrations.filter(status='REGISTERED').count()
    
    def get_createdDate(self, obj):
        return obj.created_at.strftime("%b %d, %Y")
    
    def get_time(self, obj):
        return obj.start_date.strftime("%H:%M")
    
    def get_endTime(self, obj):
        if obj.end_time:
            return obj.end_time.strftime("%H:%M")
        return obj.end_date.strftime("%H:%M")
    
    def get_date(self, obj):
        return obj.start_date.strftime("%Y-%m-%d")
    
    def get_type(self, obj):
        return obj.event_type.name if obj.event_type else "Other"
        
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Ensure we're using the correct domain and protocol
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ForumTopicListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name')
    author = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = ['id', 'title', 'category_name', 'author', 'replies_count', 
                  'last_activity', 'preview', 'is_pinned', 'views_count']
    
    def get_author(self, obj):
        return {
            'name': obj.created_by.get_full_name() or obj.created_by.username,
            'avatar': obj.created_by.profile_picture.url if obj.created_by.profile_picture else None
        }
    
    def get_replies_count(self, obj):
        return obj.replies.count()
        
    def get_last_activity(self, obj):
        last_reply = obj.replies.order_by('-created_at').first()
        last_activity = last_reply.created_at if last_reply else obj.created_at
        
        try:
            # Calculate time difference
            now = timezone.now()
            diff = now - last_activity
            
            if diff.days > 0:
                return f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"{hours} {'hour' if hours == 1 else 'hours'} ago"
            else:
                minutes = diff.seconds // 60
                return f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
        except Exception as e:
            # Return a fallback value if there's any error in time calculation
            return "recently"
    
    def get_preview(self, obj):
        # Return the first 150 characters of the content as a preview
        return obj.content[:150] + "..." if len(obj.content) > 150 else obj.content

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    announcement_type = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    event = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'created_at', 'updated_at',
            'comments_count', 'time_ago', 'announcement_type', 'is_pinned',
            'is_announcement', 'likes', 'views', 'image', 'event', 'user_reaction'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        print("Validating data:", data)
        if data.get('is_announcement'):
            if not data.get('announcement_type'):
                raise serializers.ValidationError({'announcement_type': 'Announcement type is required for announcements'})
            if data.get('announcement_type') not in dict(Post.ANNOUNCEMENT_TYPES):
                raise serializers.ValidationError({'announcement_type': 'Invalid announcement type'})
        return data
    
    def get_author(self, obj):
        return {
            'id': obj.created_by.id,
            'name': obj.created_by.get_full_name() or obj.created_by.username,
            'avatar': obj.created_by.profile_picture.url if obj.created_by.profile_picture else None,
            'role': obj.created_by.get_role_display()
        }
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_time_ago(self, obj):
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} {'day' if diff.days == 1 else 'days'} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} {'hour' if hours == 1 else 'hours'} ago"
        else:
            minutes = diff.seconds // 60
            return f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
    
    def get_announcement_type(self, obj):
        if obj.is_announcement and obj.announcement_type:
            return {
                'type': obj.announcement_type,
                'display': dict(Post.ANNOUNCEMENT_TYPES).get(obj.announcement_type, '')
            }
        return None
    
    def get_likes(self, obj):
        return obj.likes_count
    
    def get_views(self, obj):
        return 0  # TODO: Implement views tracking
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_event(self, obj):
        if obj.event:
            return {
                'id': obj.event.id,
                'title': obj.event.title,
                'date': obj.event.start_date.strftime("%Y-%m-%d"),
                'time': obj.event.start_date.strftime("%H:%M")
            }
        return None
    
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            if reaction:
                return {
                    'type': reaction.reaction_type,
                    'display': dict(Reaction.REACTION_TYPES).get(reaction.reaction_type, '')
                }
        return None