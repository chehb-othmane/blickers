import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'Upcoming' | 'Full' | 'Past' | 'Cancelled';
  image: string | null;
  createdDate: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  interested?: number; // Optional field for backward compatibility
}

export interface EventType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface EventParticipant {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: 'REGISTERED' | 'INTERESTED' | 'CANCELLED' | 'ATTENDED';
  registered_at: string;
  notes: string | null;
}

class EventService {
  async getEvents(): Promise<Event[]> {
    const response = await axiosInstance.get<Event[]>('/api/events/');
    return response.data;
  }

  async getEventTypes(): Promise<EventType[]> {
    const response = await axiosInstance.get<EventType[]>('/api/events/types/');
    return response.data;
  }

  async createEvent(formData: FormData): Promise<Event> {
    const response = await axiosInstance.post<Event>('/api/events/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateEvent(eventId: number, formData: FormData): Promise<Event> {
    try {
      // Log the form data for debugging
      console.log('Updating event with data:', Object.fromEntries(formData.entries()));
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'location', 'capacity'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`${field} is required`);
        }
      }
      
      // Ensure dates and times are in correct format
      const startDate = formData.get('start_date');
      const endDate = formData.get('end_date');
      const startTime = formData.get('start_time');
      const endTime = formData.get('end_time');
      
      // Format time to HH:MM if it includes seconds
      if (typeof startTime === 'string' && startTime.split(':').length > 2) {
        formData.set('start_time', startTime.split(':').slice(0, 2).join(':'));
      }
      if (typeof endTime === 'string' && endTime.split(':').length > 2) {
        formData.set('end_time', endTime.split(':').slice(0, 2).join(':'));
      }
      
      // Ensure is_published is sent as a string 'True' or 'False'
      const isPublished = formData.get('is_published');
      if (isPublished !== null) {
        formData.set('is_published', isPublished.toString());
      }
      
      // Ensure capacity is a positive number
      const capacity = formData.get('capacity');
      if (capacity) {
        const capacityNum = parseInt(capacity.toString(), 10);
        if (isNaN(capacityNum) || capacityNum <= 0) {
          throw new Error('Capacity must be a positive number');
        }
        formData.set('capacity', capacityNum.toString());
      }
      
      const response = await axiosInstance.put<Event>(`/api/events/${eventId}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data) {
        throw new Error('No response data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Update event error:', error);
      
      if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as any;
        const errorMessage = axiosError.response?.data?.error || 
                           axiosError.response?.data?.detail || 
                           axiosError.message || 
                           'Failed to update event';
        throw new Error(errorMessage);
      }
      
      throw error instanceof Error ? error : new Error('Failed to update event');
    }
  }

  async deleteEvent(eventId: number): Promise<void> {
    await axiosInstance.delete(`/api/events/${eventId}/delete/`);
  }

  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    try {
      const response = await axiosInstance.get<EventParticipant[]>(`/api/events/${eventId}/participants/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      throw error;
    }
  }
}

export const eventService = new EventService(); 