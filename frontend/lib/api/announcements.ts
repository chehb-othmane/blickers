import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export interface Announcement {
  id: number
  title: string
  content: string
  author: string
  author_avatar: string | null
  created_at: string
  updated_at: string
  announcement_type: 'alert' | 'info' | 'event'
  is_pinned: boolean
  views_count: number
  likes_count: number
  comments_count: number
  has_image: boolean
  has_file: boolean
  scheduled_at: string | null
  time_ago: string
  engagement_rate?: number
}

export interface Comment {
  id: number
  content: string
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
    profile_picture: string | null
  }
  created_at: string
  time_ago: string
  is_author: boolean
}

export interface CreateAnnouncementData {
  title: string
  content: string
  announcement_type: 'alert' | 'info' | 'event'
  is_pinned: boolean
  scheduled_at?: string | null
  image?: File
  file?: File
}

class AnnouncementAPI {
  private async getHeaders(includeContentType = true): Promise<HeadersInit> {
    const token = await getAuthToken()
    console.log('Auth token:', token ? `${token.substring(0, 10)}...` : 'No token found')
    
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('No authentication token found')
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('handleResponse: Processing response', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`
      let errorData: any = null
      let rawResponseText = ''
      
      try {
        // First, try to get the raw text
        rawResponseText = await response.text()
        console.log('Raw error response text:', rawResponseText)
        
        if (rawResponseText) {
          try {
            // Try to parse as JSON
            errorData = JSON.parse(rawResponseText)
            console.log('Parsed error data:', errorData)
          } catch (jsonError) {
            console.log('Response is not JSON, using as text:', rawResponseText)
            errorMessage = rawResponseText || errorMessage
          }
        }
        
        if (errorData) {
          // Extract error message from various possible fields
          const possibleErrorMessages = [
            errorData.error,
            errorData.message,
            errorData.detail,
            errorData.non_field_errors?.[0],
            Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : null
          ].filter(Boolean)
          
          if (possibleErrorMessages.length > 0) {
            errorMessage = possibleErrorMessages[0]
          }
          
          // If it's a validation error, include details
          if (errorData.errors) {
            console.log('Validation errors found:', errorData.errors)
            errorMessage += ` - Validation errors: ${JSON.stringify(errorData.errors)}`
          }
          
          // Handle Django REST framework field errors
          if (typeof errorData === 'object' && !errorData.error && !errorData.message && !errorData.detail) {
            const fieldErrors = Object.entries(errorData)
              .filter(([key, value]) => key !== 'non_field_errors' && (Array.isArray(value) || typeof value === 'string'))
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            
            if (fieldErrors.length > 0) {
              errorMessage = `Validation errors: ${fieldErrors.join('; ')}`
            }
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        errorMessage = `${errorMessage} (Failed to parse error details)`
      }
      
      // Log the full error context for debugging
      const fullErrorContext = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponseText,
        parsedErrorData: errorData,
        finalErrorMessage: errorMessage
      }
      
      console.error('Full error context:', fullErrorContext)
      
      throw new Error(errorMessage)
    }
    
    try {
      const responseText = await response.text()
      console.log('Success response text:', responseText)
      
      if (!responseText) {
        throw new Error('Empty response')
      }
      
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse successful response:', parseError)
      throw new Error('Invalid response format')
    }
  }

  async getAnnouncements(params?: {
    page?: number
    limit?: number
    type?: string
    search?: string
    sort?: string
  }): Promise<{
    results: Announcement[]
    count: number
    next: string | null
    previous: string | null
  }> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('per_page', params.limit.toString())
    if (params?.type && params.type !== 'all') searchParams.append('type', params.type)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.sort) searchParams.append('sort', params.sort)

    const url = `${API_BASE_URL}/api/announcements/?${searchParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<{
      results: Announcement[]
      count: number
      next: string | null
      previous: string | null
    }>(response)
  }

  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    console.log('Creating announcement with data:', data)
    
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('announcement_type', data.announcement_type)
    formData.append('is_pinned', data.is_pinned.toString())
    
    if (data.scheduled_at) {
      formData.append('scheduled_at', data.scheduled_at)
    }
    
    if (data.image) {
      formData.append('image', data.image)
      console.log('Image file attached:', data.image.name, data.image.size)
    }
    
    if (data.file) {
      formData.append('file', data.file)
      console.log('File attached:', data.file.name, data.file.size)
    }

    // Log FormData contents (for debugging)
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    const headers = await this.getHeaders(false) // Don't include Content-Type for FormData
    delete (headers as any)['Content-Type'] // Let browser set the boundary

    console.log('Request headers:', headers)
    console.log('Request URL:', `${API_BASE_URL}/api/announcements/create/`)

    let response: Response
    
    try {
      response = await fetch(`${API_BASE_URL}/api/announcements/create/`, {
        method: 'POST',
        headers,
        body: formData,
      })
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      })
    } catch (fetchError) {
      console.error('Fetch request failed:', fetchError)
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown network error'}`)
    }

    return this.handleResponse<Announcement>(response)
  }

  async getAnnouncement(id: number): Promise<Announcement> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/`, {
      method: 'GET',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<Announcement>(response)
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementData>): Promise<Announcement> {
    console.log('Updating announcement:', id, data)
    
    const formData = new FormData()
    
    if (data.title) formData.append('title', data.title)
    if (data.content) formData.append('content', data.content)
    if (data.announcement_type) formData.append('announcement_type', data.announcement_type)
    if (data.is_pinned !== undefined) formData.append('is_pinned', data.is_pinned.toString())
    if (data.scheduled_at) formData.append('scheduled_at', data.scheduled_at)
    if (data.image) formData.append('image', data.image)
    if (data.file) formData.append('file', data.file)

    // Log FormData contents
    console.log('FormData contents prepared for request')
    // Note: FormData contents will be visible in network tab

    const headers = await this.getHeaders(false)
    delete (headers as any)['Content-Type']

    console.log('Request headers:', headers)
    console.log('Request URL:', `${API_BASE_URL}/api/announcements/${id}/`)

    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/`, {
      method: 'PUT',
      headers,
      body: formData,
    })

    return this.handleResponse<Announcement>(response)
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  }

  async pinAnnouncement(id: number, isPinned: boolean): Promise<Announcement> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/pin/`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify({ is_pinned: isPinned }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to ${isPinned ? 'pin' : 'unpin'} announcement`)
    }

    return this.handleResponse<Announcement>(response)
  }

  async bulkDeleteAnnouncements(ids: number[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/bulk-delete/`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
      body: JSON.stringify({ ids }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to delete announcements`)
    }
  }

  async getComments(announcementId: number): Promise<{ comments: Comment[], count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/comments/`, {
      method: 'GET',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<{ comments: Comment[], count: number }>(response)
  }

  async addComment(announcementId: number, content: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/comments/`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ content }),
    })

    return this.handleResponse<Comment>(response)
  }

  async toggleLike(announcementId: number): Promise<{ liked: boolean, likes_count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/like/`, {
      method: 'POST',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<{ liked: boolean, likes_count: number }>(response)
  }

  async getLikeStatus(announcementId: number): Promise<{ liked: boolean, likes_count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/like/`, {
      method: 'GET',
      headers: await this.getHeaders(),
    })

    return this.handleResponse<{ liked: boolean, likes_count: number }>(response)
  }
}

export const announcementAPI = new AnnouncementAPI()

// Helper function to test API connectivity
export const testAPIConnection = async (): Promise<{ connected: boolean, details: any }> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  
  try {
    console.log('Testing API connection to:', `${baseUrl}/api/announcements/`)
    
    const response = await fetch(`${baseUrl}/api/announcements/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const details = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      ok: response.ok
    }
    
    console.log('API Connection test result:', details)
    
    return {
      connected: response.status < 500, // Accept any non-server error status
      details
    }
  } catch (error) {
    console.error('API Connection test failed:', error)
    return {
      connected: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof TypeError ? 'Network/CORS error' : 'Other error'
      }
    }
  }
}

// Helper function to test authentication
export const testAuthentication = async (): Promise<{ isAuthenticated: boolean, userRole?: string, error?: string }> => {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { isAuthenticated: false, error: 'No token found' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/users/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const userData = await response.json()
      return { 
        isAuthenticated: true, 
        userRole: userData.role 
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return { 
        isAuthenticated: false, 
        error: `HTTP ${response.status}: ${errorData.error || response.statusText}` 
      }
    }
  } catch (error) {
    return { 
      isAuthenticated: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}