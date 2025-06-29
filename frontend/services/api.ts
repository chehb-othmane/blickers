import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  image: string;
  interested: number;
  capacity?: number;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface TokenRefreshResponse {
  access: string;
}

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post<TokenRefreshResponse>(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        
        // Update tokens
        localStorage.setItem('access_token', access);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Event related API calls
export const eventApi = {
  // Get all upcoming events
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await api.get('/api/events/');
      return response.data as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
  
  // Get a single event by ID
  getEvent: async (eventId: number): Promise<Event | null> => {
    try {
      const response = await api.get(`/api/events/${eventId}/`);
      return response.data as Event;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  },
  
  // Mark interest in an event
  markInterest: async (eventId: number): Promise<any> => {
    try {
      const response = await api.post(`/api/events/${eventId}/interest/`);
      return response.data;
    } catch (error) {
      console.error('Error marking interest:', error);
      throw error;
    }
  }
};


export interface ForumTopic {
    id: number;
    title: string;
    category_name: string;
    author: {
      name: string;
      avatar: string | null;
    };
    replies_count: number;
    last_activity: string;
    preview: string;
    is_pinned: boolean; // Can be used as 'hot' for UI
    views_count: number;
  }
  
  export interface ForumCategory {
    id: number;
    name: string;
    description: string;
    icon: string;
    topics: number;
    posts: number;
  }
  
  export interface ForumTopicDetail extends ForumTopic {
    content: string;
    category: {
      id: number;
      name: string;
    };
    created_at: string;
    updated_at: string;
    is_closed: boolean;
    replies: {
      id: number;
      content: string;
      author: {
        id: number;
        name: string;
        avatar: string | null;
      };
      created_at: string;
      updated_at: string;
      is_solution: boolean;
    }[];
  }
  
  // Add this to your api services
  export const forumApi = {
    // Get topics for preview
    getTopicPreviews: async (): Promise<ForumTopic[]> => {
      try {
        const response = await api.get('/api/forum/topics/preview/');
        return response.data as ForumTopic[];
      } catch (error) {
        console.error('Error fetching forum topics:', error);
        return [];
      }
    },
    
    // Get all forum categories
    getCategories: async (): Promise<ForumCategory[]> => {
      try {
        const response = await api.get('/api/forum/categories/');
        return response.data as ForumCategory[];
      } catch (error) {
        console.error('Error fetching forum categories:', error);
        return [];
      }
    },
    
    // Get a single topic with its replies
    getTopicDetail: async (topicId: number): Promise<ForumTopicDetail | null> => {
      try {
        const response = await api.get(`/api/forum/topics/${topicId}/`);
        return response.data as ForumTopicDetail;
      } catch (error) {
        console.error(`Error fetching topic ${topicId}:`, error);
        return null;
      }
    }
  };

export interface DashboardStats {
  total_users: {
    value: number;
    change: string;
  };
  upcoming_events: {
    value: number;
    change: string;
  };
  pending_reports: {
    value: number;
    change: string;
  };
  new_messages: {
    value: number;
    change: string;
  };
}

// Add this to your api services
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/api/dashboard/stats/');
      return response.data as DashboardStats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/api/users/profile/');
      return response.data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  comments_count: number;
  time_ago: string;
}

// Add this to your api services
export const announcementApi = {
  // Get latest announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await api.get('/api/announcements/');
      return response.data as Announcement[];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }
};

export interface PendingModerationReport {
  id: number;
  type: string;
  content: string;
  reporter: string;
  time: string;
  content_id: number;
  content_type: string;
}

// Add this to your api services
export const moderationApi = {
  // Get pending moderation reports
  getPendingReports: async (): Promise<PendingModerationReport[]> => {
    try {
      const response = await api.get('/api/moderation/pending/');
      return response.data as PendingModerationReport[];
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      return [];
    }
  }
};

export interface ActivityOverview {
  user_activity: number[];
  content_engagement: {
    comments: number;
    posts: number;
    reactions: number;
    growth: number;
  };
  event_participation: {
    name: string;
    registered: number;
    capacity: number;
    percentage: number;
  }[];
}

// Add this to your api services
export const activityApi = {
  // Get activity overview data
  getActivityOverview: async (): Promise<ActivityOverview> => {
    try {
      const response = await api.get('/api/dashboard/activity-overview/');
      return response.data as ActivityOverview;
    } catch (error) {
      console.error('Error fetching activity overview:', error);
      // Return default values in case of error
      return {
        user_activity: [0, 0, 0, 0, 0, 0, 0],
        content_engagement: {
          comments: 0,
          posts: 0,
          reactions: 0,
          growth: 0
        },
        event_participation: []
      };
    }
  }
};

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture: string | null;
  bio: string | null;
  year_of_study: number | null;
  major: string | null;
  is_online: boolean;
  is_active: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentYear: number;
  field: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  year_of_study?: number | null;
  major?: string | null;
  bio?: string | null;
}

// Add this to your api services
export const userApi = {
  // Get all users with optional filters
  getUsers: async (filters?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<User[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/api/users/?${params.toString()}`);
      return response.data as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserData): Promise<User | null> => {
    try {
      const response = await api.post('/api/users/', userData);
      return response.data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (userId: number, userData: UpdateUserData): Promise<User | null> => {
    try {
      const response = await api.put(`/api/users/${userId}/`, userData);
      return response.data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/api/users/${userId}/`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Toggle user status
  toggleUserStatus: async (userId: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/toggle-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to toggle user status')
      }
      const data = await response.json()
      return data as { status: string; message: string }
    } catch (error) {
      console.error('Error toggling user status:', error)
      throw error
    }
  }
};

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  icon: string | null;
  is_read: boolean;
  link: string | null;
  time_ago: string;
  created_at: string;
}

// Add this to your api services
export const notificationApi = {
  // Get user notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/api/notifications/');
      return response.data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notifications as read
  markAsRead: async (notificationIds?: number[]): Promise<void> => {
    try {
      await api.post('/api/notifications/mark-read/', {
        notification_ids: notificationIds || []
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }
};

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  birthday: string;
  role: string;
  department: string;
  joinDate: string;
  bio: string;
  website: string;
  education: string;
  languages: string[];
  profile_picture: string | null;
}

// Add this to your api services
export const profileApi = {
  // Get user profile data
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/api/users/profile/');
      return response.data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<{ message: string; profile: UserProfile }> => {
    try {
      const response = await api.post('/api/users/profile/update/', profileData);
      return response.data as { message: string; profile: UserProfile };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Update profile picture
  updateProfilePicture: async (file: Blob): Promise<{ message: string; profile_picture: string }> => {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file, 'profile.jpg');

      const response = await api.post('/api/users/profile/update-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as { message: string; profile_picture: string };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }
};

export interface TwoFactorAuth {
  is_enabled: boolean;
  has_authenticator: boolean;
  has_email: boolean;
  email_verified: boolean;
}

export interface TwoFactorSetup {
  secret_key: string;
  qr_code: string;
}

// Add this to your api services
export const twoFactorApi = {
  // Get 2FA status
  getStatus: async (): Promise<TwoFactorAuth> => {
    try {
      const response = await api.get('/api/users/two-factor/');
      return response.data as TwoFactorAuth;
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      throw error;
    }
  },

  // Setup authenticator app
  setupAuthenticator: async (): Promise<TwoFactorSetup> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'setup_authenticator'
      });
      return response.data as TwoFactorSetup;
    } catch (error) {
      console.error('Error setting up authenticator:', error);
      throw error;
    }
  },

  // Verify authenticator code
  verifyAuthenticator: async (code: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'verify_authenticator',
        code
      });
      return response.data as { message: string };
    } catch (error) {
      console.error('Error verifying authenticator:', error);
      throw error;
    }
  },

  // Setup email backup
  setupEmail: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'setup_email',
        email
      });
      return response.data as { message: string };
    } catch (error) {
      console.error('Error setting up email:', error);
      throw error;
    }
  },

  // Verify email code
  verifyEmail: async (code: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'verify_email',
        code
      });
      return response.data as { message: string };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  // Generate recovery codes
  generateRecoveryCodes: async (): Promise<{ recovery_codes: string[] }> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'generate_recovery_codes'
      });
      return response.data as { recovery_codes: string[] };
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/api/users/two-factor/', {
        action: 'disable_2fa'
      });
      return response.data as { message: string };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }
};

export default api;