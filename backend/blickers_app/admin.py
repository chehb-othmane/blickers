from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from django.utils import timezone

from .models import (
    User, EventType, Event, EventRegistration, ForumCategory, 
    ForumTopic, ForumReply, ChatRoom, Message, Post, PostComment, 
    Reaction, NotificationType, Notification, Report, Settings
)

# Configuration de l'interface admin globale
admin.site.site_header = "Administration du Portail Étudiant"
admin.site.site_title = "Portail Étudiant"
admin.site.index_title = "Tableau de bord"


# Inlines pour afficher des modèles liés
class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    fields = ('user', 'status', 'registered_at')
    readonly_fields = ('registered_at',)


class PostCommentInline(admin.TabularInline):
    model = PostComment
    extra = 0
    fields = ('user', 'content', 'created_at')
    readonly_fields = ('created_at',)


class ReactionInline(admin.TabularInline):
    model = Reaction
    extra = 0
    fields = ('user', 'reaction_type', 'created_at')
    readonly_fields = ('created_at',)


class ForumReplyInline(admin.TabularInline):
    model = ForumReply
    extra = 0
    fields = ('created_by', 'content', 'created_at', 'is_solution')
    readonly_fields = ('created_at',)


# Modèles d'administration personnalisés
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'date_joined', 'is_online', 'last_online')
    list_filter = ('role', 'is_online', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = (
        ("Informations utilisateur", {
            'fields': ('username', 'password', 'email', 'first_name', 'last_name')
        }),
        ("Rôle et statut", {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ("Profil", {
            'fields': ('profile_picture', 'bio', 'year_of_study', 'major', 'is_online', 'last_online')
        }),
        ("Dates importantes", {
            'fields': ('date_joined', 'last_login')
        }),
    )
    readonly_fields = ('date_joined', 'last_login', 'last_online')
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('event_registrations', 'reactions')
    
    def has_delete_permission(self, request, obj=None):
        # Empêcher la suppression d'utilisateurs administrateurs
        if obj and obj.is_superuser:
            return False
        return super().has_delete_permission(request, obj)


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'events_count', 'description', 'icon')
    search_fields = ('name', 'description')
    
    def events_count(self, obj):
        return Event.objects.filter(event_type=obj).count()
    events_count.short_description = "Nombre d'événements"


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'start_date', 'location', 'created_by', 'participants_count', 'is_published', 'is_past_event')
    list_filter = ('event_type', 'is_published', 'start_date')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'start_date'
    inlines = [EventRegistrationInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('registrations').select_related('event_type', 'created_by')
    
    def participants_count(self, obj):
        return obj.registrations.filter(status='REGISTERED').count()
    participants_count.short_description = "Participants"
    
    def is_past_event(self, obj):
        past = obj.end_date < timezone.now()
        if past:
            return format_html('<span style="color: red;">✓</span>')
        return format_html('<span style="color: green;">✗</span>')
    is_past_event.short_description = "Événement passé"
    
    def save_model(self, request, obj, form, change):
        # Définir l'utilisateur courant comme créateur pour les nouveaux événements
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_link', 'status', 'registered_at')
    list_filter = ('status', 'registered_at')
    search_fields = ('event__title', 'user__username', 'user__email')
    date_hierarchy = 'registered_at'
    
    def event_link(self, obj):
        url = reverse('admin:blickers_app_event_change', args=[obj.event.id])
        return format_html('<a href="{}">{}</a>', url, obj.event.title)
    event_link.short_description = "Événement"


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'topics_count')
    list_editable = ('order',)
    search_fields = ('name', 'description')
    
    def topics_count(self, obj):
        return obj.topics.count()
    topics_count.short_description = "Nombre de sujets"


@admin.register(ForumTopic)
class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_by', 'created_at', 'views_count', 'replies_count', 'is_pinned', 'is_closed')
    list_filter = ('category', 'is_pinned', 'is_closed', 'created_at')
    search_fields = ('title', 'content', 'created_by__username')
    date_hierarchy = 'created_at'
    inlines = [ForumReplyInline]
    actions = ['close_topics', 'pin_topics', 'unpin_topics']
    
    def replies_count(self, obj):
        return obj.replies.count()
    replies_count.short_description = "Réponses"
    
    def close_topics(self, request, queryset):
        queryset.update(is_closed=True)
    close_topics.short_description = "Fermer les sujets sélectionnés"
    
    def pin_topics(self, request, queryset):
        queryset.update(is_pinned=True)
    pin_topics.short_description = "Épingler les sujets sélectionnés"
    
    def unpin_topics(self, request, queryset):
        queryset.update(is_pinned=False)
    unpin_topics.short_description = "Désépingler les sujets sélectionnés"


@admin.register(ForumReply)
class ForumReplyAdmin(admin.ModelAdmin):
    list_display = ('truncated_content', 'topic_link', 'created_by', 'created_at', 'is_solution')
    list_filter = ('is_solution', 'created_at')
    search_fields = ('content', 'created_by__username', 'topic__title')
    date_hierarchy = 'created_at'
    
    def truncated_content(self, obj):
        return (obj.content[:75] + '...') if len(obj.content) > 75 else obj.content
    truncated_content.short_description = "Contenu"
    
    def topic_link(self, obj):
        url = reverse('admin:bde_forumtopic_change', args=[obj.topic.id])
        return format_html('<a href="{}">{}</a>', url, obj.topic.title)
    topic_link.short_description = "Sujet"


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_group_chat', 'created_at', 'participants_list', 'messages_count')
    list_filter = ('is_group_chat', 'created_at')
    search_fields = ('name', 'participants__username')
    filter_horizontal = ('participants',)
    
    def participants_list(self, obj):
        return ", ".join([user.username for user in obj.participants.all()[:3]]) + ("..." if obj.participants.count() > 3 else "")
    participants_list.short_description = "Participants"
    
    def messages_count(self, obj):
        return obj.messages.count()
    messages_count.short_description = "Messages"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('truncated_content', 'sender', 'room_info', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('content', 'sender__username')
    date_hierarchy = 'timestamp'
    
    def truncated_content(self, obj):
        return (obj.content[:50] + '...') if len(obj.content) > 50 else obj.content
    truncated_content.short_description = "Message"
    
    def room_info(self, obj):
        if obj.room.name:
            return obj.room.name
        else:
            participants = ", ".join([user.username for user in obj.room.participants.all()[:3]])
            return f"Chat: {participants}{'...' if obj.room.participants.count() > 3 else ''}"
    room_info.short_description = "Conversation"


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at', 'is_announcement', 'is_pinned', 'likes_count', 'comments_count')
    list_filter = ('is_announcement', 'is_pinned', 'created_at')
    search_fields = ('title', 'content', 'created_by__username')
    date_hierarchy = 'created_at'
    inlines = [PostCommentInline, ReactionInline]
    actions = ['make_announcement', 'pin_posts', 'unpin_posts']
    
    def likes_count(self, obj):
        return obj.reactions.filter(reaction_type='LIKE').count()
    likes_count.short_description = "J'aime"
    
    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = "Commentaires"
    
    def make_announcement(self, request, queryset):
        queryset.update(is_announcement=True)
    make_announcement.short_description = "Marquer comme annonce officielle"
    
    def pin_posts(self, request, queryset):
        queryset.update(is_pinned=True)
    pin_posts.short_description = "Épingler les publications sélectionnées"
    
    def unpin_posts(self, request, queryset):
        queryset.update(is_pinned=False)
    unpin_posts.short_description = "Désépingler les publications sélectionnées"


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('truncated_content', 'post_link', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'user__username', 'post__title')
    date_hierarchy = 'created_at'
    
    def truncated_content(self, obj):
        return (obj.content[:75] + '...') if len(obj.content) > 75 else obj.content
    truncated_content.short_description = "Contenu"
    
    def post_link(self, obj):
        url = reverse('admin:bde_post_change', args=[obj.post.id])
        return format_html('<a href="{}">{}</a>', url, obj.post.title)
    post_link.short_description = "Publication"


@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'post_link', 'reaction_type', 'created_at')
    list_filter = ('reaction_type', 'created_at')
    search_fields = ('user__username', 'post__title')
    date_hierarchy = 'created_at'
    
    def post_link(self, obj):
        url = reverse('admin:bde_post_change', args=[obj.post.id])
        return format_html('<a href="{}">{}</a>', url, obj.post.title)
    post_link.short_description = "Publication"


@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'notifications_count')
    search_fields = ('name', 'description')
    
    def notifications_count(self, obj):
        return Notification.objects.filter(notification_type=obj).count()
    notifications_count.short_description = "Nombre de notifications"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'created_at', 'is_read')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    date_hierarchy = 'created_at'
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Marquer comme lues"


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'content_type', 'reason_preview', 'created_at', 'status', 'handled_by')
    list_filter = ('content_type', 'status', 'created_at')
    search_fields = ('reason', 'reporter__username', 'handled_by__username')
    date_hierarchy = 'created_at'
    actions = ['mark_as_reviewing', 'mark_as_resolved', 'mark_as_dismissed']
    
    def reason_preview(self, obj):
        return (obj.reason[:50] + '...') if len(obj.reason) > 50 else obj.reason
    reason_preview.short_description = "Raison"
    
    def mark_as_reviewing(self, request, queryset):
        queryset.update(status='REVIEWING', handled_by=request.user)
    mark_as_reviewing.short_description = "Marquer comme en cours de traitement"
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='RESOLVED', handled_by=request.user)
    mark_as_resolved.short_description = "Marquer comme résolu"
    
    def mark_as_dismissed(self, request, queryset):
        queryset.update(status='DISMISSED', handled_by=request.user)
    mark_as_dismissed.short_description = "Marquer comme rejeté"


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('school_name', 'contact_email', 'enable_student_posts', 'moderation_required')
    
    def has_add_permission(self, request):
        # Empêcher l'ajout de plusieurs configurations
        return Settings.objects.count() == 0
    
    def has_delete_permission(self, request, obj=None):
        # Empêcher la suppression de la configuration
        return False