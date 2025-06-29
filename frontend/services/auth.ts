import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_picture: string | null;
    bio: string | null;
    year_of_study: number | null;
    major: string | null;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, { email, password });
    const data = response.data as LoginResponse;
    // Store tokens in localStorage
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    const access_token = localStorage.getItem('access_token');
    
    if (refresh_token && access_token) {
      await axios.post(
        `${API_URL}/auth/logout/`, 
        { refresh_token },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
    }
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear tokens even if the API call fails
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/password-reset/`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string, uid: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/password-reset/confirm/`, {
      token,
      uid,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};