#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blickers.settings')
django.setup()

from blickers_app.models import User

def create_test_admin():
    """Create a test admin user for testing announcements"""
    
    # Check if admin user already exists
    if User.objects.filter(username='testadmin').exists():
        print("Test admin user already exists")
        user = User.objects.get(username='testadmin')
        print(f"User: {user.username}, Role: {user.role}")
        return user
    
    # Create test admin user
    user = User.objects.create_user(
        username='testadmin',
        email='testadmin@example.com',
        password='testpassword123',
        first_name='Test',
        last_name='Admin',
        role='ADMIN'
    )
    
    print(f"Created test admin user: {user.username}")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print("Password: testpassword123")
    
    return user

def create_test_bde():
    """Create a test BDE user for testing announcements"""
    
    # Check if BDE user already exists
    if User.objects.filter(username='testbde').exists():
        print("Test BDE user already exists")
        user = User.objects.get(username='testbde')
        print(f"User: {user.username}, Role: {user.role}")
        return user
    
    # Create test BDE user
    user = User.objects.create_user(
        username='testbde',
        email='testbde@example.com',
        password='testpassword123',
        first_name='Test',
        last_name='BDE',
        role='BDE'
    )
    
    print(f"Created test BDE user: {user.username}")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print("Password: testpassword123")
    
    return user

if __name__ == '__main__':
    print("Creating test users for announcement testing...")
    create_test_admin()
    create_test_bde()
    print("Done!")