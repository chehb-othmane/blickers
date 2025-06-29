from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user for testing announcements'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Username for the admin user')
        parser.add_argument('--email', type=str, default='admin@test.com', help='Email for the admin user')
        parser.add_argument('--password', type=str, default='admin123', help='Password for the admin user')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    user = User.objects.get(username=username)
                    self.stdout.write(f'User {username} already exists')
                    
                    # Update role to ADMIN if not already
                    if user.role != 'ADMIN':
                        user.role = 'ADMIN'
                        user.save()
                        self.stdout.write(f'Updated {username} role to ADMIN')
                    else:
                        self.stdout.write(f'{username} is already an ADMIN')
                else:
                    # Create new admin user
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role='ADMIN',
                        first_name='Admin',
                        last_name='User'
                    )
                    self.stdout.write(f'Created admin user: {username}')

                # Display user info
                self.stdout.write(f'User details:')
                self.stdout.write(f'  Username: {user.username}')
                self.stdout.write(f'  Email: {user.email}')
                self.stdout.write(f'  Role: {user.role}')
                self.stdout.write(f'  Is active: {user.is_active}')
                self.stdout.write(f'  Is staff: {user.is_staff}')
                self.stdout.write(f'  Is superuser: {user.is_superuser}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin user: {str(e)}'))