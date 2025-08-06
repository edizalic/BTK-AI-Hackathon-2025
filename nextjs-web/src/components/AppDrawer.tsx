"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useAuth } from "@/lib/auth-context"

interface AppDrawerContentProps {
  userType: "student" | "teacher"
  userData?: {
    name: string
    email: string
    avatar?: string
  }
}

export function AppDrawerContent({ userType, userData }: AppDrawerContentProps) {
  const { logout, isLoading, user } = useAuth()
  
  // Use real user data from auth context, fallback to prop if needed
  const displayName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : userData?.name || "Loading..."
  const displayEmail = user?.email || userData?.email || ""

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DrawerHeader className="border-b">
        <DrawerTitle className="flex items-center space-x-2">
          <span>{userType === "student" ? "🎓" : "👩‍🏫"}</span>
          <span>{userType === "student" ? "Student" : "Teacher"} Portal</span>
        </DrawerTitle>
        <DrawerDescription>
          {userType === "student" ? "Your learning dashboard" : "Manage your classroom"}
        </DrawerDescription>
      </DrawerHeader>

      {/* Profile Section */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {displayEmail}
            </p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-green-600 dark:text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-4 border-b">
        <nav className="space-y-2">
          {userType === "student" ? (
            <>
              <Link href="/student-portal" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>🏠</span>
                <span>Dashboard</span>
              </Link>
              <Link href="/profile" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>👤</span>
                <span>My Profile</span>
              </Link>
              <Link href="/courses" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📚</span>
                <span>My Courses</span>
              </Link>
              <Link href="/assignments" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📝</span>
                <span>Assignments</span>
              </Link>
              <Link href="/grades" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📊</span>
                <span>Grades</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/teacher-portal" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>🏠</span>
                <span>Dashboard</span>
              </Link>
              <Link href="/courses" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📚</span>
                <span>My Courses</span>
              </Link>
              <Link href="/assignments" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📝</span>
                <span>Assignments</span>
              </Link>
              <Link href="/grades" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                <span>📊</span>
                <span>Grades</span>
              </Link>
              {/* Supervisor Teacher only features */}
              {user?.role === 'SUPERVISOR_TEACHER' && (
                <>
                  <Link href="/supervisor-courses" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                    <span>📚</span>
                    <span>Department Courses</span>
                  </Link>
                  <Link href="/manage-students" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                    <span>👥</span>
                    <span>Manage Students</span>
                  </Link>
                  <Link href="/signup" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                    <span>➕</span>
                    <span>Register Users</span>
                  </Link>
                  <Link href="/analytics" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
                    <span>📈</span>
                    <span>Analytics</span>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Spacer for future content - Scrollable Area */}
      <div className="flex-1"></div>

      {/* Fixed Bottom Section - Logout and Settings */}
      <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 mt-auto">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            size="sm"
          >
            <span className="mr-2">⚙️</span>
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            size="sm"
          >
            <span className="mr-2">❓</span>
            Help & Support
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <span className="mr-2">🚪</span>
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  )
}