/**
 * API Services Index
 * Central export point for all API services and utilities
 */

// Import for local use
import { API_CONFIG } from './config'
import { TokenManager, AuthAPI } from './api-auth'
import { UsersAPI } from './api-users'
import { CoursesAPI } from './api-courses'
import { EnrollmentAPI } from './api-enrollment'
import { AssignmentsAPI } from './api-assignments'
import { GradesAPI } from './api-grades'
import { MaterialsAPI } from './api-materials'
import { QuizzesAPI } from './api-quizzes'
import { NotificationsAPI } from './api-notifications'
import { FilesAPI } from './api-files'
import { PagesAPI } from './api-pages'
import { AdminAPI } from './api-admin'

// Re-export for external use
export { apiClient, apiRequest, API_CONFIG } from './config'
export { TokenManager } from './api-auth'
export { AuthAPI } from './api-auth'
export { UsersAPI } from './api-users'
export { CoursesAPI } from './api-courses'
export { EnrollmentAPI } from './api-enrollment'
export { AssignmentsAPI } from './api-assignments'
export { GradesAPI } from './api-grades'
export { MaterialsAPI } from './api-materials'
export { QuizzesAPI } from './api-quizzes'
export { NotificationsAPI } from './api-notifications'
export { FilesAPI } from './api-files'
export { PagesAPI } from './api-pages'
export { AdminAPI } from './api-admin'

// Type exports
export type * from './types'

// API Error types
export type { ApiResponse, ApiError } from './config'

/**
 * Unified API object for easy access to all services
 * Usage: API.auth.login(), API.courses.getCourses(), etc.
 */
export const API = {
  auth: AuthAPI,
  users: UsersAPI,
  courses: CoursesAPI,
  enrollment: EnrollmentAPI,
  assignments: AssignmentsAPI,
  grades: GradesAPI,
  materials: MaterialsAPI,
  quizzes: QuizzesAPI,
  notifications: NotificationsAPI,
  files: FilesAPI,
  pages: PagesAPI,
  admin: AdminAPI,
} as const

/**
 * API Service status and health check utilities
 */
export class APIStatus {
  /**
   * Check if API is accessible
   */
  static async isOnline(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get API version and build info
   */
  static async getVersion(): Promise<{
    version: string
    build: string
    environment: string
  }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/version`)
      return await response.json()
    } catch (error) {
      throw new Error('Failed to get API version')
    }
  }

  /**
   * Test API connectivity with authentication
   */
  static async testConnection(): Promise<{
    isConnected: boolean
    isAuthenticated: boolean
    responseTime: number
    version?: string
  }> {
    const startTime = Date.now()
    
    try {
      // Test basic connectivity
      const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/health`)
      const isConnected = healthResponse.ok
      
      if (!isConnected) {
        return {
          isConnected: false,
          isAuthenticated: false,
          responseTime: Date.now() - startTime
        }
      }

      // Test authentication
      try {
        await AuthAPI.getProfile()
        return {
          isConnected: true,
          isAuthenticated: true,
          responseTime: Date.now() - startTime,
          version: (await this.getVersion()).version
        }
      } catch {
        return {
          isConnected: true,
          isAuthenticated: false,
          responseTime: Date.now() - startTime,
          version: (await this.getVersion()).version
        }
      }
    } catch {
      return {
        isConnected: false,
        isAuthenticated: false,
        responseTime: Date.now() - startTime
      }
    }
  }
}

/**
 * Development utilities for testing API endpoints
 */
export class APIDev {
  /**
   * Mock user data for development/testing
   */
  static readonly MOCK_USERS = {
    student: {
      email: 'student@test.edu',
      password: 'password123',
      role: 'STUDENT' as const
    },
    teacher: {
      email: 'teacher@test.edu',
      password: 'password123',
      role: 'TEACHER' as const
    },
    supervisor: {
      email: 'supervisor@test.edu',
      password: 'password123',
      role: 'SUPERVISOR_TEACHER' as const
    },
    admin: {
      email: 'admin@test.edu',
      password: 'password123',
      role: 'ADMIN' as const
    }
  }

  /**
   * Quick login for development (DO NOT USE IN PRODUCTION)
   */
  static async quickLogin(userType: keyof typeof this.MOCK_USERS) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('quickLogin is not available in production')
    }
    
    const user = this.MOCK_USERS[userType]
    return API.auth.login(user)
  }

  /**
   * Clear all stored tokens and data
   */
  static clearAll() {
    TokenManager.clearTokens()
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  /**
   * Log current user status
   */
  static logStatus() {
    if (process.env.NODE_ENV === 'production') return
    
    console.group('🔧 API Development Status')
    console.log('🔐 Authenticated:', TokenManager.isAuthenticated())
    console.log('👤 Current User:', TokenManager.getUser())
    console.log('🎫 Access Token:', TokenManager.getAccessToken() ? '✓ Present' : '✗ Missing')
    console.log('🔄 Refresh Token:', TokenManager.getRefreshToken() ? '✓ Present' : '✗ Missing')
    console.log('🌐 API Base URL:', API_CONFIG.BASE_URL)
    console.groupEnd()
  }
}

// Default export for convenience
export default API