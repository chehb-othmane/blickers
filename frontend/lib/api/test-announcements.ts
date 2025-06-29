// Test file for debugging announcement creation issues
import { announcementAPI, CreateAnnouncementData } from './announcements'

export const testAnnouncementCreation = async () => {
  console.log('=== TESTING ANNOUNCEMENT CREATION ===')
  
  const testData: CreateAnnouncementData = {
    title: 'Test Announcement',
    content: 'This is a test announcement to debug the API',
    announcement_type: 'info',
    is_pinned: false,
  }
  
  try {
    console.log('Test data:', testData)
    const result = await announcementAPI.createAnnouncement(testData)
    console.log('Test successful! Result:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Test failed with error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}

export const testAPIConnection = async () => {
  console.log('=== TESTING API CONNECTION ===')
  
  try {
    const result = await announcementAPI.getAnnouncements({ page: 1, limit: 1 })
    console.log('API connection test successful:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('API connection test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}

// Function to test with minimal data
export const testMinimalAnnouncement = async () => {
  console.log('=== TESTING MINIMAL ANNOUNCEMENT ===')
  
  const minimalData: CreateAnnouncementData = {
    title: 'Minimal Test',
    content: 'Minimal test content',
    announcement_type: 'info',
    is_pinned: false,
  }
  
  try {
    const result = await announcementAPI.createAnnouncement(minimalData)
    console.log('Minimal test successful:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Minimal test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}