import { useState, useEffect, useCallback } from 'react'
import { announcementAPI, Announcement, CreateAnnouncementData } from '@/lib/api/announcements'

export interface UseAnnouncementsOptions {
  initialPage?: number
  itemsPerPage?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAnnouncementsReturn {
  announcements: Announcement[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  
  // Actions
  fetchAnnouncements: (params?: {
    page?: number
    search?: string
    type?: string
    sort?: string
  }) => Promise<void>
  createAnnouncement: (data: CreateAnnouncementData) => Promise<Announcement | null>
  updateAnnouncement: (id: number, data: Partial<CreateAnnouncementData>) => Promise<Announcement | null>
  deleteAnnouncement: (id: number) => Promise<boolean>
  pinAnnouncement: (id: number, isPinned: boolean) => Promise<boolean>
  bulkDelete: (ids: number[]) => Promise<boolean>
  refresh: () => Promise<void>
  clearError: () => void
  
  // Pagination
  goToPage: (page: number) => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
}

export const useAnnouncements = (options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn => {
  const {
    initialPage = 1,
    itemsPerPage = 6,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [lastFetchParams, setLastFetchParams] = useState<any>({})

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  const fetchAnnouncements = useCallback(async (params: {
    page?: number
    search?: string
    type?: string
    sort?: string
  } = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchParams = {
        page: params.page || currentPage,
        limit: itemsPerPage,
        search: params.search,
        type: params.type,
        sort: params.sort,
      }
      
      setLastFetchParams(fetchParams)
      
      const response = await announcementAPI.getAnnouncements(fetchParams)
      
      setAnnouncements(response.results)
      setTotalCount(response.count)
      setCurrentPage(fetchParams.page || currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements'
      setError(errorMessage)
      console.error('Error fetching announcements:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage])

  const createAnnouncement = useCallback(async (data: CreateAnnouncementData): Promise<Announcement | null> => {
    try {
      setError(null)
      console.log('useAnnouncements: Creating announcement with data:', data)
      
      const newAnnouncement = await announcementAPI.createAnnouncement(data)
      console.log('useAnnouncements: Successfully created announcement:', newAnnouncement)
      
      // Add to the beginning of the list
      setAnnouncements(prev => [newAnnouncement, ...prev])
      setTotalCount(prev => prev + 1)
      
      return newAnnouncement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create announcement'
      setError(errorMessage)
      console.error('useAnnouncements: Error creating announcement:', err)
      
      // More detailed error logging
      const errorDetails = {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : 'Unknown',
        data,
        timestamp: new Date().toISOString()
      }
      
      console.error('useAnnouncements: Detailed error information:')
      console.error('- Error message:', errorDetails.message)
      console.error('- Error name:', errorDetails.name)
      console.error('- Data being sent:', errorDetails.data)
      console.error('- Timestamp:', errorDetails.timestamp)
      if (errorDetails.stack) {
        console.error('- Stack trace:', errorDetails.stack)
      }
      
      return null
    }
  }, [])

  const updateAnnouncement = useCallback(async (id: number, data: Partial<CreateAnnouncementData>): Promise<Announcement | null> => {
    try {
      setError(null)
      const updatedAnnouncement = await announcementAPI.updateAnnouncement(id, data)
      
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id ? updatedAnnouncement : announcement
        )
      )
      
      return updatedAnnouncement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update announcement'
      setError(errorMessage)
      console.error('Error updating announcement:', err)
      return null
    }
  }, [])

  const deleteAnnouncement = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await announcementAPI.deleteAnnouncement(id)
      
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id))
      setTotalCount(prev => prev - 1)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete announcement'
      setError(errorMessage)
      console.error('Error deleting announcement:', err)
      return false
    }
  }, [])

  const pinAnnouncement = useCallback(async (id: number, isPinned: boolean): Promise<boolean> => {
    try {
      setError(null)
      const updatedAnnouncement = await announcementAPI.pinAnnouncement(id, isPinned)
      
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id ? updatedAnnouncement : announcement
        )
      )
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pin announcement'
      setError(errorMessage)
      console.error('Error pinning announcement:', err)
      return false
    }
  }, [])

  const bulkDelete = useCallback(async (ids: number[]): Promise<boolean> => {
    try {
      setError(null)
      await announcementAPI.bulkDeleteAnnouncements(ids)
      
      setAnnouncements(prev => prev.filter(announcement => !ids.includes(announcement.id)))
      setTotalCount(prev => prev - ids.length)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete announcements'
      setError(errorMessage)
      console.error('Error bulk deleting announcements:', err)
      return false
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchAnnouncements(lastFetchParams)
  }, [fetchAnnouncements, lastFetchParams])

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      await fetchAnnouncements({ ...lastFetchParams, page })
    }
  }, [fetchAnnouncements, lastFetchParams, totalPages])

  const nextPage = useCallback(async () => {
    if (hasNext) {
      await goToPage(currentPage + 1)
    }
  }, [goToPage, currentPage, hasNext])

  const previousPage = useCallback(async () => {
    if (hasPrevious) {
      await goToPage(currentPage - 1)
    }
  }, [goToPage, currentPage, hasPrevious])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAnnouncements()
  }, []) // Only run once on mount

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refresh])

  return {
    announcements,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    pinAnnouncement,
    bulkDelete,
    refresh,
    
    goToPage,
    nextPage,
    previousPage,
    clearError,
  }
}