import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RATE_LIMIT_PER_MINUTE: 100
}

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken
          })
          
          const { accessToken } = response.data
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken)
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T
  message?: string
  statusCode: number
}

// Generic API error response
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

// Generic API request wrapper with error handling
export const apiRequest = async <T = any>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await requestFn()
    
    // Handle NestJS standard response format: { data: actualData, timestamp, path }
    const responseData = response.data as any
    
    if (responseData && typeof responseData === 'object' && responseData.data) {
      // Extract the actual data from the wrapper
      return responseData.data
    }
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiError
    }
    throw {
      statusCode: 500,
      message: error.message || 'Network error occurred',
      error: 'NetworkError'
    } as ApiError
  }
}