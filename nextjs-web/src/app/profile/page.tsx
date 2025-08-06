"use client"

import React, { useState, useEffect } from 'react'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserProfile, ProfileStats } from "@/types/profile"
import { cn } from "@/lib/utils"

// Hook to load profile data (will be replaced with real API call later)
const useProfileData = (userType: 'student' | 'teacher') => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate API call with mock data
        const mockData = await import('@/data/mock-profile.json')
        const profileData = mockData[userType] as UserProfile
        const statsData = mockData.profileStats[userType] as ProfileStats
        
        if (!profileData) {
          throw new Error(`Profile data not found for user type: ${userType}`)
        }
        
        setProfile(profileData)
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    
    loadProfileData()
  }, [userType])
  
  return { profile, stats, loading, error }
}

interface ProfileInfoCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: "bg-white dark:bg-slate-800 border-border",
    primary: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800",
    success: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800",
    warning: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800"
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {icon && <span className="text-3xl">{icon}</span>}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  // This would normally come from authentication context
  const [userType] = useState<'student' | 'teacher'>('student') // Change to 'teacher' to test teacher profile
  
  const { profile, stats, loading, error } = useProfileData(userType)

  const drawerContent = (
    <AppDrawerContent 
      userType={userType}
      userData={{
        name: profile?.name || '',
        email: profile?.email || ''
      }}
    />
  )

  if (loading) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  if (error || !profile) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600">{error || 'Profile not found'}</p>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  return (
    <ResponsiveDrawer drawerContent={drawerContent}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Header Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <p className="text-blue-100 text-lg">{profile.email}</p>
                  <p className="text-blue-100 capitalize mt-1">{profile.role}</p>
                  {profile.academicInfo && (
                    <p className="text-blue-100 mt-1">{profile.academicInfo.studentId} • {profile.academicInfo.grade}</p>
                  )}
                  {profile.professionalInfo && (
                    <p className="text-blue-100 mt-1">{profile.professionalInfo.position} • {profile.professionalInfo.department}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Last Login</p>
                  <p className="text-white font-semibold">
                    {new Date(profile.activity.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {stats && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Academic Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userType === 'student' ? (
                  <>
                    <ProfileInfoCard 
                      title="Current GPA" 
                      value={profile.academicInfo?.gpa?.toFixed(2) || 'N/A'} 
                      icon="🎯"
                      variant="primary"
                    />
                    <ProfileInfoCard 
                      title="Courses Enrolled" 
                      value={stats.coursesEnrolled || 0} 
                      subtitle="This semester"
                      icon="📚"
                      variant="success"
                    />
                    <ProfileInfoCard 
                      title="Average Grade" 
                      value={`${stats.averageGrade || 0}%`} 
                      subtitle="All courses"
                      icon="📊"
                      variant="default"
                    />
                    <ProfileInfoCard 
                      title="Attendance" 
                      value={`${stats.attendanceRate || 0}%`} 
                      subtitle="This semester"
                      icon="✅"
                      variant="success"
                    />
                  </>
                ) : (
                  <>
                    <ProfileInfoCard 
                      title="Courses Teaching" 
                      value={stats.coursesTeaching || 0} 
                      subtitle="This semester"
                      icon="👩‍🏫"
                      variant="primary"
                    />
                    <ProfileInfoCard 
                      title="Students Managed" 
                      value={stats.studentsManaged || 0} 
                      subtitle="Total enrolled"
                      icon="👥"
                      variant="success"
                    />
                    <ProfileInfoCard 
                      title="Average Class Grade" 
                      value={`${stats.averageClassGrade || 0}%`} 
                      subtitle="All classes"
                      icon="📊"
                      variant="default"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Personal Information</h3>
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Your personal contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-foreground font-semibold">{profile.personalInfo.firstName} {profile.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-semibold">{profile.email}</p>
                  </div>
                  {profile.personalInfo.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground font-semibold">{profile.personalInfo.phone}</p>
                    </div>
                  )}
                  {profile.personalInfo.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                      <p className="text-foreground font-semibold">
                        {new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic/Professional Information */}
          {profile.academicInfo && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Academic Information</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Student Details</CardTitle>
                  <CardDescription>Your academic information and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                      <p className="text-foreground font-semibold">{profile.academicInfo.studentId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Advisory Teacher</label>
                      <p className="text-foreground font-semibold">{profile.academicInfo.advisoryTeacher}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Grade Level</label>
                      <p className="text-foreground font-semibold">{profile.academicInfo.grade}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Major</label>
                      <p className="text-foreground font-semibold">{profile.academicInfo.major}</p>
                    </div>
                    {profile.academicInfo.minor && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Minor</label>
                        <p className="text-foreground font-semibold">{profile.academicInfo.minor}</p>
                      </div>
                    )}
                    {profile.academicInfo.advisoryTeacher && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Advisory Teacher</label>
                        <p className="text-foreground font-semibold">{profile.academicInfo.advisoryTeacher}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Enrollment Date</label>
                      <p className="text-foreground font-semibold">
                        {new Date(profile.academicInfo.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    {profile.academicInfo.graduationDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Expected Graduation</label>
                        <p className="text-foreground font-semibold">
                          {new Date(profile.academicInfo.graduationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {profile.professionalInfo && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Professional Information</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Details</CardTitle>
                  <CardDescription>Your professional information and role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                      <p className="text-foreground font-semibold">{profile.professionalInfo.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="text-foreground font-semibold">{profile.professionalInfo.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Position</label>
                      <p className="text-foreground font-semibold">{profile.professionalInfo.position}</p>
                    </div>
                    {profile.professionalInfo.officeLocation && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Office</label>
                        <p className="text-foreground font-semibold">{profile.professionalInfo.officeLocation}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                      <p className="text-foreground font-semibold">
                        {new Date(profile.professionalInfo.hireDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                      <p className="text-foreground font-semibold">
                        {profile.professionalInfo.specialization.join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Advisory Teacher (for students) */}
          {profile.advisoryTeacher && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Advisory Teacher</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Academic Advisor</CardTitle>
                  <CardDescription>Your assigned advisory teacher and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-semibold">{profile.advisoryTeacher.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground font-semibold">{profile.advisoryTeacher.email}</p>
                    </div>
                    {profile.advisoryTeacher.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-foreground font-semibold">{profile.advisoryTeacher.phone}</p>
                      </div>
                    )}
                    {profile.advisoryTeacher.office && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Office</label>
                        <p className="text-foreground font-semibold">{profile.advisoryTeacher.office}</p>
                      </div>
                    )}
                    {profile.advisoryTeacher.officeHours && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Office Hours</label>
                        <p className="text-foreground font-semibold">{profile.advisoryTeacher.officeHours}</p>
                      </div>
                    )}
                    {profile.advisoryTeacher.department && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-foreground font-semibold">{profile.advisoryTeacher.department}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Emergency Contact (for students) */}
          {profile.emergencyContact && (
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Emergency Contact</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Information</CardTitle>
                  <CardDescription>Contact information in case of emergency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-semibold">{profile.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <p className="text-foreground font-semibold">{profile.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground font-semibold">{profile.emergencyContact.phone}</p>
                    </div>
                    {profile.emergencyContact.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-foreground font-semibold">{profile.emergencyContact.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg">
              Edit Profile
            </Button>
            <Button variant="default" size="lg">
              Change Password
            </Button>
          </div>

        </div>
      </div>
    </ResponsiveDrawer>
  )
}