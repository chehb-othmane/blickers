from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blickers_app.models import Post
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test announcements for development'

    def handle(self, *args, **options):
        # Create a test admin user if it doesn't exist
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin/admin123'))

        # Sample announcements data
        announcements_data = [
            {
                'title': 'Welcome to the New Academic Year!',
                'content': 'We are excited to welcome all students to the new academic year. Get ready for an amazing journey filled with learning, events, and networking opportunities.',
                'announcement_type': 'info',
                'is_pinned': True,
            },
            {
                'title': 'Important: Exam Schedule Changes',
                'content': 'Due to unforeseen circumstances, some exam dates have been rescheduled. Please check your student portal for updated information.',
                'announcement_type': 'alert',
                'is_pinned': True,
            },
            {
                'title': 'Join Our Upcoming Hackathon!',
                'content': 'Registration is now open for our annual hackathon. This is a great opportunity to showcase your skills and win amazing prizes!',
                'announcement_type': 'event',
                'is_pinned': False,
            },
            {
                'title': 'Career Fair Next Month',
                'content': 'Major companies will be visiting our campus for recruitment. Prepare your resumes and dress professionally!',
                'announcement_type': 'info',
                'is_pinned': False,
            },
            {
                'title': 'Library Hours Extended',
                'content': 'Good news! The library will now be open 24/7 during exam periods to help you with your studies.',
                'announcement_type': 'info',
                'is_pinned': False,
            },
            {
                'title': 'Sports Tournament Registration',
                'content': 'Annual inter-department sports tournament is coming up. Register your teams before the deadline!',
                'announcement_type': 'event',
                'is_pinned': False,
            },
            {
                'title': 'Cafeteria Menu Updates',
                'content': 'We have added new healthy options to our cafeteria menu based on student feedback. Come try them out!',
                'announcement_type': 'info',
                'is_pinned': False,
            },
            {
                'title': 'Workshop: Industry 4.0 and AI',
                'content': 'Join us for an exclusive workshop on Industry 4.0 and Artificial Intelligence. Limited seats available!',
                'announcement_type': 'event',
                'is_pinned': False,
            },
        ]

        # Delete existing test announcements
        Post.objects.filter(is_announcement=True).delete()

        # Create new announcements
        for i, data in enumerate(announcements_data):
            # Vary the creation dates to make it more realistic
            created_at = timezone.now() - timedelta(days=random.randint(0, 30))
            
            announcement = Post.objects.create(
                title=data['title'],
                content=data['content'],
                created_by=admin_user,
                announcement_type=data['announcement_type'],
                is_pinned=data['is_pinned'],
                is_announcement=True,
                created_at=created_at,
                views_count=random.randint(50, 500),
            )
            
            self.stdout.write(f'Created announcement: {announcement.title}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(announcements_data)} test announcements'
            )
        )