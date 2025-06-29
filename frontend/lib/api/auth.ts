// Simple auth token management
// You should replace this with your actual authentication system

export const getAuthToken = async (): Promise<string | null> => {
  // Check localStorage for token - prioritize access_token (JWT) over authToken
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token')
    const authToken = localStorage.getItem('authToken')
    
    // Return the first available token, preferring access_token
    return accessToken || authToken
  }
  return null
}

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    localStorage.removeItem('access_token')
  }
}

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken()
  return !!token
}