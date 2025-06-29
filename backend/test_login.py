#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blickers.settings')
django.setup()

def test_login_and_create_announcement():
    """Test login and announcement creation"""
    
    base_url = "http://localhost:8000"
    
    # Test login
    print("=== Testing Login ===")
    login_data = {
        "email": "testadmin@example.com",
        "password": "testpassword123"
    }
    
    try:
        login_response = requests.post(f"{base_url}/api/auth/login/", json=login_data)
        print(f"Login response status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('tokens', {}).get('access')
            
            if access_token:
                print(f"Login successful! Access token: {access_token[:20]}...")
                
                # Test announcement creation
                print("\n=== Testing Announcement Creation ===")
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                
                announcement_data = {
                    "title": "Test Announcement",
                    "content": "This is a test announcement created via API",
                    "announcement_type": "info",
                    "is_pinned": False
                }
                
                create_response = requests.post(
                    f"{base_url}/api/announcements/create/", 
                    json=announcement_data,
                    headers=headers
                )
                
                print(f"Create announcement response status: {create_response.status_code}")
                print(f"Create announcement response: {create_response.text}")
                
                # Test getting announcements
                print("\n=== Testing Get Announcements ===")
                get_response = requests.get(
                    f"{base_url}/api/announcements/",
                    headers=headers
                )
                
                print(f"Get announcements response status: {get_response.status_code}")
                print(f"Get announcements response: {get_response.text}")
                
                # Test comment and like functionality if announcement was created
                if create_response.status_code == 201:
                    created_announcement = create_response.json()
                    announcement_id = created_announcement.get('id')
                    
                    if announcement_id:
                        # Test adding a comment
                        print("\n=== Testing Add Comment ===")
                        comment_data = {
                            "content": "This is a test comment!"
                        }
                        
                        comment_response = requests.post(
                            f"{base_url}/api/announcements/{announcement_id}/comments/",
                            json=comment_data,
                            headers=headers
                        )
                        
                        print(f"Add comment response status: {comment_response.status_code}")
                        print(f"Add comment response: {comment_response.text}")
                        
                        # Test getting comments
                        print("\n=== Testing Get Comments ===")
                        get_comments_response = requests.get(
                            f"{base_url}/api/announcements/{announcement_id}/comments/",
                            headers=headers
                        )
                        
                        print(f"Get comments response status: {get_comments_response.status_code}")
                        print(f"Get comments response: {get_comments_response.text}")
                        
                        # Test liking the announcement
                        print("\n=== Testing Like Announcement ===")
                        like_response = requests.post(
                            f"{base_url}/api/announcements/{announcement_id}/like/",
                            headers=headers
                        )
                        
                        print(f"Like response status: {like_response.status_code}")
                        print(f"Like response: {like_response.text}")
                        
                        # Test getting like status
                        print("\n=== Testing Get Like Status ===")
                        get_like_response = requests.get(
                            f"{base_url}/api/announcements/{announcement_id}/like/",
                            headers=headers
                        )
                        
                        print(f"Get like status response status: {get_like_response.status_code}")
                        print(f"Get like status response: {get_like_response.text}")
                
            else:
                print("No access token in login response")
        else:
            print("Login failed")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_login_and_create_announcement()