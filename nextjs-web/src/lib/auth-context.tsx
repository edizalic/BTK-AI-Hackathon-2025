'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { TokenManager, API } from '@/api'
import type { UserProfile } from '@/api/types'

// Types for our auth system
export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'SUPERVISOR_TEACHER' | 'TEACHER' | 'STUDENT'
  isSupervisor: boolean
  profile: UserProfile
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  tokens: {
    accessToken: string | null
    refreshToken: string | null
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
  checkAuth: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    tokens: {
      accessToken: null,
      refreshToken: null
    }
  })

  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      checkAuth()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const storedTokens = TokenManager.getTokens()
      
      if (!storedTokens.accessToken) {
        // Ensure tokens are cleared
        TokenManager.clearTokens()
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          user: null, 
          isLoading: false,
          tokens: { accessToken: null, refreshToken: null }
        }))
        return
      }

      // Verify token with backend
      try {
        let userProfile = await API.auth.getProfile()
        
        // Handle double-wrapped response from backend
        if (userProfile && typeof userProfile === 'object' && 'data' in userProfile) {
          userProfile = (userProfile as any).data
        }
        
        // Validate that we have complete user data
        if (!userProfile || !userProfile.role || !userProfile.email) {
          throw new Error('Invalid user profile data')
        }
        
        setState(prev => ({
          ...prev,
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          tokens: storedTokens
        }))
      } catch (error) {
        // Token might be expired, try to refresh
        if (storedTokens.refreshToken) {
          try {
            await refreshTokens()
          } catch (refreshError) {
            // Refresh failed, clear auth state
            TokenManager.clearTokens()
            setState(prev => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isLoading: false,
              tokens: { accessToken: null, refreshToken: null }
            }))
          }
        } else {
          // No refresh token, clear auth state
          TokenManager.clearTokens()
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tokens: { accessToken: null, refreshToken: null }
          }))
        }
      }
    } catch (error) {
      // Clear tokens on any auth check failure
      TokenManager.clearTokens()
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        user: null, 
        isLoading: false,
        tokens: { accessToken: null, refreshToken: null }
      }))
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const loginResponse = await API.auth.login({ email, password })
      
      // Handle NestJS wrapped response
      let actualData = loginResponse
      if (loginResponse && typeof loginResponse === 'object' && 'data' in loginResponse) {
        actualData = (loginResponse as any).data
      }

      // Store tokens
      TokenManager.storeTokens(actualData)
      
      // Update auth state
      setState(prev => ({
        ...prev,
        user: actualData.user,
        isAuthenticated: true,
        isLoading: false,
        tokens: {
          accessToken: actualData.accessToken,
          refreshToken: actualData.refreshToken
        }
      }))
      
      // Add a small delay before redirect to ensure state is updated
      setTimeout(() => {
        redirectAfterLogin(actualData.user.role)
      }, 100)
      
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error // Re-throw so login page can handle it
    }
  }

  const logout = async () => {
    try {
      // Call logout API
      await API.auth.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with logout even if API call fails
    } finally {
      // Clear local state regardless of API call result
      TokenManager.clearTokens()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        tokens: { accessToken: null, refreshToken: null }
      })
      
      // Redirect to login
      router.push('/login')
    }
  }

  const refreshTokens = async () => {
    try {
      const tokens = TokenManager.getTokens()
      
      if (!tokens.refreshToken) {
        throw new Error('No refresh token available')
      }

      const refreshResponse = await API.auth.refreshToken({ refreshToken: tokens.refreshToken })
      
      // Handle NestJS wrapped response
      let actualData = refreshResponse
      if (refreshResponse && typeof refreshResponse === 'object' && 'data' in refreshResponse) {
        actualData = (refreshResponse as any).data
      }

      // Store new tokens
      TokenManager.storeTokens(actualData)
      
      // Update state
      setState(prev => ({
        ...prev,
        tokens: {
          accessToken: actualData.accessToken,
          refreshToken: actualData.refreshToken
        }
      }))
      
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Force logout on refresh failure
      await logout()
      throw error
    }
  }

  const redirectAfterLogin = (role: string) => {
    const redirectPath = role === 'STUDENT' ? '/student-portal'
      : role === 'TEACHER' || role === 'SUPERVISOR_TEACHER' ? '/teacher-portal'
      : role === 'ADMIN' ? '/admin-portal'
      : '/'
    
    // Use window.location for more reliable redirect after login
    window.location.href = redirectPath
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshTokens,
    checkAuth
  }

  // Debug utility - expose to window for console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).authDebug = {
        clearTokens: () => {
          TokenManager.clearTokens()
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tokens: { accessToken: null, refreshToken: null }
          })
          setTimeout(() => window.location.reload(), 100)
        },
        getAuthState: () => {
          return state
        },
        recheckAuth: () => {
          checkAuth()
        },
        forceLogout: () => {
          TokenManager.clearTokens()
          localStorage.clear()
          sessionStorage.clear()
          window.location.href = '/login'
        },
        resetAuth: () => {
          TokenManager.clearTokens()
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tokens: { accessToken: null, refreshToken: null }
          })
        }
      }
    }
  }, [state, checkAuth])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth guard hook for checking specific permissions
export function useAuthGuard(requiredRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const hasPermission = () => {
    if (!isAuthenticated || !user) return false
    if (!requiredRoles || requiredRoles.length === 0) return true
    return requiredRoles.includes(user.role)
  }

  return {
    isAuthenticated,
    isLoading,
    hasPermission: hasPermission(),
    user
  }
}