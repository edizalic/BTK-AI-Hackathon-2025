"use client"

import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { DynamicRenderer, usePageConfig } from "@/components/DynamicRenderer"
import { TeacherGuard } from "@/components/AuthGuard"
import { useAuth } from "@/lib/auth-context"

export default function TeacherPortal() {
  const { user } = useAuth()
  const { pageConfig, loading, error } = usePageConfig('teacher-portal')

  const teacherData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Loading...",
    email: user?.email || ""
  }

  const drawerContent = (
    <AppDrawerContent 
      userType="teacher" 
      userData={teacherData}
    />
  )

  return (
    <TeacherGuard>
      {loading && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading teacher dashboard...</p>
            </div>
          </div>
        </ResponsiveDrawer>
      )}

      {error && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </ResponsiveDrawer>
      )}

      {!loading && !error && !pageConfig && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-600 mb-2">Page Not Found</h1>
              <p className="text-gray-600">The teacher portal configuration could not be loaded.</p>
            </div>
          </div>
        </ResponsiveDrawer>
      )}

      {!loading && !error && pageConfig && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <DynamicRenderer pageConfig={pageConfig} userData={teacherData} />
        </ResponsiveDrawer>
      )}
    </TeacherGuard>
  )
}