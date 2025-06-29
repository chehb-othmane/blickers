from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import uuid


class User(AbstractUser):
    """Modèle d'utilisateur étendu avec des champs supplémentaires"""
    ROLE_CHOICES = (
        ('STUDENT', 'Étudiant'),
        ('BDE', 'Membre BDE'),
        ('ADMIN', 'Administrateur'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    year_of_study = models.PositiveSmallIntegerField(null=True, blank=True)
    major = models.CharField(max_length=100, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    last_online = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    birthday = models.DateField(null=True, blank=True)
    department = models.CharField(max_length=200, blank=True, null=True)
    website = models.URLField(max_length=200, blank=True, null=True)
    education = models.CharField(max_length=200, blank=True, null=True)
    languages = models.JSONField(default=list, blank=True)

    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def get_unread_messages_count(self):
        """Retourne le nombre de messages non lus"""
        return Message.objects.filter(receiver=self, is_read=False).count()
    
    def get_notifications_count(self):
        """Retourne le nombre de notifications non lues"""
        return Notification.objects.filter(user=self, is_read=False).count()


class EventType(models.Model):
    """Types d'événements (bénévolat, hackathon, soirée, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)  # Nom d'icône CSS
    
    def __str__(self):
        return self.name


class Event(models.Model):
    """Événements organisés par le BDE"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    start_time = models.TimeField(null=True, blank=True)  # Start time of the event
    end_time = models.TimeField(null=True, blank=True)  # End time of the event
    location = models.CharField(max_length=200)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='event_images/', blank=True, null=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)  # Nombre maximal de participants
    is_published = models.BooleanField(default=True)  # Pour brouillons/publications
    status = models.CharField(max_length=20, default='Upcoming', choices=[
        ('Upcoming', 'Upcoming'),
        ('Full', 'Full'),
        ('Past', 'Past'),
        ('Cancelled', 'Cancelled')
    ])
    manually_set_status = models.BooleanField(default=False)  # Track if status was manually set
    
    def __str__(self):
        return self.title
    
    @property
    def is_past(self):
        # Ensure end_date is timezone-aware before comparison
        if timezone.is_naive(self.end_date):
            end_date = timezone.make_aware(self.end_date)
        else:
            end_date = self.end_date
        return end_date < timezone.now()
    
    @property
    def participants_count(self):
        if not self.pk:  # If the event hasn't been saved yet
            return 0
        return self.registrations.filter(status='REGISTERED').count()
    
    @property
    def is_full(self):
        if not self.pk:  # If the event hasn't been saved yet
            return False
        if self.capacity:
            return self.participants_count >= self.capacity
        return False
    
    def save(self, *args, **kwargs):
        # Only auto-update status if it wasn't manually set
        if not self.manually_set_status:
            # Ensure end_date is timezone-aware before comparison
            if timezone.is_naive(self.end_date):
                end_date = timezone.make_aware(self.end_date)
            else:
                end_date = self.end_date
                
            # Check if event is past based on end_date and end_time
            is_past = False
            if end_date.date() < timezone.now().date():
                is_past = True
            elif end_date.date() == timezone.now().date() and self.end_time:
                current_time = timezone.now().time()
                if self.end_time < current_time:
                    is_past = True
            
            if is_past:
                self.status = 'Past'
            elif self.is_full:
                self.status = 'Full'
            else:
                self.status = 'Upcoming'
        
        super().save(*args, **kwargs)
    
    def set_status_manually(self, new_status):
        """Method to manually set the status and mark it as manually set"""
        self.status = new_status
        self.manually_set_status = True
        self.save()
    
    def reset_auto_status(self):
        """Method to reset to automatic status updates"""
        self.manually_set_status = False
        self.save()


class EventRegistration(models.Model):
    """Inscriptions des étudiants aux événements"""
    STATUS_CHOICES = (
        ('REGISTERED', 'Inscrit'),
        ('INTERESTED', 'Intéressé'),
        ('CANCELLED', 'Annulé'),
        ('ATTENDED', 'A participé'),
    )
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REGISTERED')
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)  # Notes additionnelles (allergies, besoins spéciaux)
    
    class Meta:
        unique_together = ('event', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title} ({self.get_status_display()})"


class ForumCategory(models.Model):
    """Catégorie pour le forum (aide, questions, débats, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)  # Nom d'icône CSS
    order = models.PositiveIntegerField(default=0)  # Pour l'ordre d'affichage
    
    class Meta:
        verbose_name_plural = "Forum categories"
        ordering = ['order']
    
    def __str__(self):
        return self.name


class ForumTopic(models.Model):
    """Sujet de discussion sur le forum"""
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='topics')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_topics')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)  # Épinglé en haut du forum
    is_closed = models.BooleanField(default=False)  # Fermé aux nouvelles réponses
    views_count = models.PositiveIntegerField(default=0)
    tags = models.CharField(max_length=255, blank=True, default="", help_text="Comma-separated tags")
    upvotes = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def replies_count(self):
        return self.replies.count()
    
    @property
    def last_reply(self):
        return self.replies.order_by('-created_at').first()


class ForumReply(models.Model):
    """Réponse à un sujet du forum"""
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_solution = models.BooleanField(default=False)  # Marque une réponse comme solution
    upvotes = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Forum replies"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Réponse de {self.created_by.username} à {self.topic.title}"


class ChatRoom(models.Model):
    """Salle de chat privée entre deux utilisateurs ou plus"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True, null=True)  # Optionnel pour groupes
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group_chat = models.BooleanField(default=False)
    
    def __str__(self):
        if self.is_group_chat and self.name:
            return f"Groupe: {self.name}"
        
        participants_list = ", ".join([user.username for user in self.participants.all()])
        return f"Chat: {participants_list}"
    
    @property
    def last_message(self):
        return self.messages.order_by('-timestamp').first()


class Message(models.Model):
    """Message envoyé dans un chat"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='read_messages', blank=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message de {self.sender.username} à {self.timestamp}"


class Post(models.Model):
    """Publication/annonce du BDE ou des étudiants (selon configuration)"""
    ANNOUNCEMENT_TYPES = (
        ('alert', 'Alerte'),
        ('info', 'Information'),
        ('event', 'Événement'),
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    file = models.FileField(upload_to='post_files/', blank=True, null=True)  # Added for file attachments
    is_pinned = models.BooleanField(default=False)
    is_announcement = models.BooleanField(default=False)  # Annonce officielle BDE
    announcement_type = models.CharField(max_length=10, choices=ANNOUNCEMENT_TYPES, null=True, blank=True)  # Type d'annonce
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    scheduled_at = models.DateTimeField(null=True, blank=True)  # Added for scheduling
    views_count = models.PositiveIntegerField(default=0)  # Added for views tracking
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def likes_count(self):
        return self.reactions.filter(reaction_type='LIKE').count()
    
    @property
    def comments_count(self):
        return self.comments.count()
    
    @property
    def engagement_rate(self):
        """Calculate engagement rate based on views, likes, and comments"""
        total_interactions = self.likes_count + self.comments_count
        if self.views_count == 0:
            return 0
        return min(100, int((total_interactions / self.views_count) * 100))
    
    def increment_views(self):
        """Increment the views count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class PostComment(models.Model):
    """Commentaire sur une publication"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Commentaire de {self.user.username} sur {self.post.title}"


class Reaction(models.Model):
    """Réactions (like, emoji) sur les publications"""
    REACTION_TYPES = (
        ('LIKE', '👍'),
        ('LOVE', '❤️'),
        ('HAHA', '😄'),
        ('WOW', '😮'),
        ('SAD', '😢'),
        ('ANGRY', '😠'),
    )
    
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES, default='LIKE')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'user')
    
    def __str__(self):
        return f"{self.user.username} a réagi {self.get_reaction_type_display()} à {self.post.title}"


class NotificationType(models.Model):
    """Types de notification pour le système"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.name


class Notification(models.Model):
    """Notification pour les utilisateurs"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    link = models.URLField(blank=True, null=True)  # Lien vers l'objet concerné
    related_object_id = models.PositiveIntegerField(null=True, blank=True)  # ID générique de l'objet concerné
    related_object_type = models.CharField(max_length=100, null=True, blank=True)  # Type d'objet (event, post, etc.)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification pour {self.user.username}: {self.title}"


class Report(models.Model):
    """Signalement de contenu inapproprié"""
    REPORT_TYPES = (
        ('POST', 'Publication'),
        ('COMMENT', 'Commentaire'),
        ('FORUM_TOPIC', 'Sujet de forum'),
        ('FORUM_REPLY', 'Réponse de forum'),
        ('USER', 'Utilisateur'),
        ('MESSAGE', 'Message privé'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('REVIEWING', 'En cours de traitement'),
        ('RESOLVED', 'Résolu'),
        ('DISMISSED', 'Rejeté'),
    )
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_sent')
    content_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    content_id = models.PositiveIntegerField()
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    handled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                 null=True, blank=True, related_name='reports_handled')
    resolution_note = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Signalement de {self.reporter.username} - {self.get_content_type_display()}"


class Settings(models.Model):
    """Paramètres généraux de l'application"""
    school_name = models.CharField(max_length=200)
    school_logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    contact_email = models.EmailField()
    enable_student_posts = models.BooleanField(default=False)  # Si False, seul le BDE peut poster
    moderation_required = models.BooleanField(default=True)  # Si True, modération avant publication
    home_page_message = models.TextField(blank=True, null=True)
    footer_text = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Settings"
    
    def __str__(self):
        return f"Paramètres de {self.school_name}"


class TwoFactorAuth(models.Model):
    """Two-factor authentication settings for users"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='two_factor')
    is_enabled = models.BooleanField(default=True)
    secret_key = models.CharField(max_length=32, blank=True, null=True)
    backup_email = models.EmailField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"2FA settings for {self.user.username}"


class RecoveryCode(models.Model):
    """Recovery codes for 2FA"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recovery_codes')
    code = models.CharField(max_length=20)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recovery code for {self.user.username}"