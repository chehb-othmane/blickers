#!/usr/bin/env python3

import requests
import json

# Test announcement update API
API_BASE_URL = "http://localhost:8000"
ANNOUNCEMENT_ID = 17

def get_auth_token():
    """Login and get authentication token"""
    login_data = {
        'email': 'admin@admin.com',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/api/auth/login/", json=login_data)
        print(f"Login Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            access_token = data['tokens']['access']
            print(f"Got access token: {access_token[:50]}...")
            return access_token
        else:
            print(f"Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"Login Error: {e}")
        return None

def test_update_announcement():
    # First, login to get auth token
    token = get_auth_token()
    if not token:
        print("Failed to get authentication token")
        return
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Test GET request with auth
    try:
        response = requests.get(f"{API_BASE_URL}/api/announcements/{ANNOUNCEMENT_ID}/", headers=headers)
        print(f"\nGET Response Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"GET Response: Title='{data['title']}', Type='{data['announcement_type']}'")
        else:
            print(f"GET Error: {response.text}")
            
    except Exception as e:
        print(f"GET Error: {e}")
    
    # Now try to update the announcement with auth
    update_data = {
        'title': 'Updated Test Title',
        'content': 'Updated test content',
        'announcement_type': 'alert',
        'is_pinned': 'true'
    }
    
    try:
        response = requests.put(
            f"{API_BASE_URL}/api/announcements/{ANNOUNCEMENT_ID}/",
            data=update_data,
            headers=headers
        )
        print(f"\nPUT Response Status: {response.status_code}")
        print(f"PUT Response: {response.text}")
        
    except Exception as e:
        print(f"PUT Error: {e}")

if __name__ == "__main__":
    test_update_announcement()