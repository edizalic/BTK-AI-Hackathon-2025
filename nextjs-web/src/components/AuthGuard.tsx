'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AuthGuardProps {
  children: ReactNode
  requiredRoles?: string[]
  fallbackPath?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Store the attempted URL for redirect after login
      const returnUrl = pathname !== '/login' ? `?returnUrl=${encodeURIComponent(pathname)}` : ''
      router.push(`${fallbackPath}${returnUrl}`)
      return
    }

    // If user is authenticated but doesn't have required role
    if (isAuthenticated && user && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        // Redirect to appropriate portal based on user role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin-portal')
            break
          case 'SUPERVISOR_TEACHER':
          case 'TEACHER':
            router.push('/teacher-portal')
            break
          case 'STUDENT':
            router.push('/student-portal')
            break
          default:
            router.push('/')
        }
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, pathname, fallbackPath, requireAuth])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If role check fails, don't render children
  if (isAuthenticated && user && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null
  }

  // All checks passed, render children
  return <>{children}</>
}

// Specific guard components for common use cases
export function StudentGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRoles={['STUDENT']}>
      {children}
    </AuthGuard>
  )
}

export function TeacherGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRoles={['TEACHER', 'SUPERVISOR_TEACHER']}>
      {children}
    </AuthGuard>
  )
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRoles={['ADMIN']}>
      {children}
    </AuthGuard>
  )
}

// Guard that redirects authenticated users away from login/signup pages
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're completely sure the user is authenticated
    // AND we have valid user data AND we're not loading
    if (!isLoading && isAuthenticated && user && user.role) {
      // Add a delay to prevent redirect loops
      const redirectTimer = setTimeout(() => {
        const redirectPath = user.role === 'STUDENT' ? '/student-portal' 
          : user.role === 'TEACHER' || user.role === 'SUPERVISOR_TEACHER' ? '/teacher-portal'
          : user.role === 'ADMIN' ? '/admin-portal' 
          : '/'
        
        window.location.href = redirectPath
      }, 500) // 500ms delay
      
      return () => clearTimeout(redirectTimer)
    }
  }, [isAuthenticated, isLoading, user, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Loading the dashboard...</p>
      </div>
    )
  }

  // Only render children if user is definitively not authenticated OR has invalid data
  if (!isAuthenticated || !user || !user.role) {
    return <>{children}</>
  }

  // User is authenticated, show redirect message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading the dashboard...</p>
      </div>
    </div>
  )
}