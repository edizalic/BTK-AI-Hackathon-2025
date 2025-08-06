import { apiClient, apiRequest } from './config'
import type {
  LoginDto,
  LoginResponse,
  RefreshTokenDto,
  ChangePasswordDto,
  ResetPasswordDto,
  User,
  Session
} from './types'

/**
 * Authentication API Service
 * Handles user authentication, session management, and profile operations
 */
export class AuthAPI {
  private static readonly BASE_PATH = '/auth'

  /**
   * User login with email and password
   */
  static async login(credentials: LoginDto): Promise<LoginResponse> {
    return apiRequest(() =>
      apiClient.post<LoginResponse>(`${this.BASE_PATH}/login`, credentials)
    )
  }

  /**
   * User logout and invalidate session
   */
  static async logout(): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.post<{ message: string }>(`${this.BASE_PATH}/logout`)
    )
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return apiRequest(() =>
      apiClient.post<{ accessToken: string }>(`${this.BASE_PATH}/refresh`, refreshTokenDto)
    )
  }

  /**
   * Change user password
   */
  static async changePassword(changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`${this.BASE_PATH}/change-password`, changePasswordDto)
    )
  }

  /**
   * Reset user password (SUPERVISOR_TEACHER only)
   */
  static async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`/users/${userId}/reset-password`, resetPasswordDto)
    )
  }

  /**
   * Get user's active sessions
   */
  static async getSessions(): Promise<Session[]> {
    return apiRequest(() =>
      apiClient.get<Session[]>(`${this.BASE_PATH}/sessions`)
    )
  }

  /**
   * Invalidate all user sessions
   */
  static async invalidateSession(sessionId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.post<{ message: string }>(`${this.BASE_PATH}/sessions/${sessionId}/invalidate`)
    )
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<User>): Promise<User> {
    return apiRequest(() =>
      apiClient.put<User>(`${this.BASE_PATH}/profile`, profileData)
    )
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<LoginResponse['user']> {
    return apiRequest(() =>
      apiClient.get<LoginResponse['user']>(`${this.BASE_PATH}/profile`)
    )
  }
}

/**
 * Token management utilities
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private static readonly USER_KEY = 'user'

  /**
   * Store authentication tokens and user data
   */
  static storeTokens(loginResponse: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken)
      localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken)
      localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user))
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    }
    return null
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }
    return null
  }

  /**
   * Get stored user data
   */
  static getUser(): LoginResponse['user'] | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  /**
   * Get all stored tokens
   */
  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken()
    }
  }

  /**
   * Clear all stored authentication data
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.role === role
  }

  /**
   * Check if user is supervisor
   */
  static isSupervisor(): boolean {
    const user = this.getUser()
    return user?.isSupervisor === true
  }
}