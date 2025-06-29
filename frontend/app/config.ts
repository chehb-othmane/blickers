export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 30000, // 30 seconds
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  announcements: {
    types: ['info', 'alert', 'event'] as const,
    defaultType: 'info',
  },
} as const;

// Type for announcement types
export type AnnouncementType = typeof config.announcements.types[number];

// Type for API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
}

// Type for paginated API response
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
} 