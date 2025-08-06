"use client"

import React, { useState, useEffect } from 'react'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Course } from "@/types/courses"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { AuthGuard } from "@/components/AuthGuard"
import { useAuth } from "@/lib/auth-context"
import { API } from "@/api"
import type { Course as APICourse } from "@/api/types"
import { WeeklyStudyPlan } from "@/components/WeeklyStudyPlan"

// Hook to load role-specific courses data
const useCoursesData = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCoursesData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('=== LOADING COURSES FOR USER ===')
        console.log('User role:', user.role)
        console.log('User ID:', user.id)
        console.log('User department:', user.profile?.department)
        
        // Fetch all courses first
        const allCoursesResponse = await API.courses.getCourses({})
        const allCoursesArray = allCoursesResponse.courses || []
        
        console.log('Total courses available:', allCoursesArray.length)
        
        let filteredCourses: APICourse[] = []
        
        if (user.role === 'STUDENT') {
          // For students: show courses they're enrolled in using the enrollment API
          console.log('=== LOADING ENROLLED COURSES FOR STUDENT ===')
          console.log('Student ID:', user.id)
          
          try {
            const enrollmentResponse = await API.enrollment.getStudentEnrollments(user.id)
            console.log('Full enrollment response:', enrollmentResponse)
            
            // The backend returns enrollment objects, not course objects directly
            const enrollments = enrollmentResponse.enrollments || []
            console.log('Enrollments found:', enrollments.length)
            
            // Extract course data from enrollments
            const enrolledCourses = enrollments
              .filter(enrollment => enrollment.status === 'ACTIVE')
              .map(enrollment => enrollment.course)
              .filter(course => course) // Remove any null/undefined courses
            
            console.log('Student enrolled courses:', enrolledCourses.length)
            console.log('Enrolled courses:', enrolledCourses.map(c => ({ code: c.code, name: c.name })))
            
            filteredCourses = enrolledCourses
          } catch (enrollmentError) {
            console.warn('Failed to load enrolled courses, falling back to all courses:', enrollmentError)
            // Fallback to showing all available courses if enrollment API fails
            filteredCourses = allCoursesArray
          }
          
        } else if (user.role === 'TEACHER') {
          // For teachers: show only courses they teach (where they are the instructor)
          console.log('=== FILTERING COURSES FOR TEACHER ===')
          console.log('Teacher ID:', user.id)
          
          filteredCourses = allCoursesArray.filter(course => {
            const isInstructor = course.instructorId === user.id
            
            console.log(`Course ${course.code}:`, {
              instructorId: course.instructorId,
              userId: user.id,
              instructor: course.instructor?.profile ? 
                `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}` : 
                course.instructor?.email,
              isInstructor: isInstructor,
              instructorIdType: typeof course.instructorId,
              userIdType: typeof user.id
            })
            
            return isInstructor
          })
          
          console.log('=== TEACHER FILTERING RESULTS ===')
          console.log('Teacher: Filtered to courses they teach:', filteredCourses.length)
          console.log('Teacher courses:', filteredCourses.map(c => ({
            code: c.code,
            name: c.name,
            instructorId: c.instructorId,
            instructor: c.instructor?.profile ? 
              `${c.instructor.profile.firstName} ${c.instructor.profile.lastName}` : 
              c.instructor?.email
          })))
          
        } else if (user.role === 'SUPERVISOR_TEACHER') {
          // For supervisors: show all courses in their department
          const supervisorDepartment = user.profile?.department
          filteredCourses = allCoursesArray.filter(course => {
            // Check if created by current supervisor or instructor is from same department
            const createdByCurrentUser = course.createdById === user.id
            const instructorInSameDept = course.instructor?.profile?.department === supervisorDepartment
            const matches = createdByCurrentUser || instructorInSameDept
            
            console.log(`Course ${course.code}: createdBy=${createdByCurrentUser}, instrInDept=${instructorInSameDept}, matches=${matches}`)
            return matches
          })
          console.log('Supervisor: Filtered to department courses:', filteredCourses.length)
          
        } else {
          // For other roles (ADMIN), show all courses
          filteredCourses = allCoursesArray
          console.log('Admin: Showing all courses')
        }
        
        // Convert API courses to display format
        const displayCourses: Course[] = filteredCourses.map(apiCourse => ({
          id: apiCourse.id,
          code: apiCourse.code,
          name: apiCourse.name,
          description: apiCourse.description,
          credits: apiCourse.credits,
          schedule: {
            days: apiCourse.scheduleDays,
            startTime: apiCourse.startTime,
            endTime: apiCourse.endTime,
            location: apiCourse.location,
            building: apiCourse.building,
            room: apiCourse.room
          },
          instructor: {
            id: apiCourse.instructor?.id || '',
            name: apiCourse.instructor?.profile ? 
              `${apiCourse.instructor.profile.firstName} ${apiCourse.instructor.profile.lastName}` : 
              'Unknown',
            email: apiCourse.instructor?.email || '',
            avatar: apiCourse.instructor?.avatar
          },
          semester: apiCourse.semester,
          year: apiCourse.year,
          capacity: apiCourse.capacity,
          enrolled: apiCourse.enrolled,
          status: apiCourse.status.toLowerCase(),
          prerequisites: [],
          category: apiCourse.category,
          department: apiCourse.instructor?.profile?.department || '',
          level: apiCourse.level.toLowerCase(),
          startDate: apiCourse.startDate,
          endDate: apiCourse.endDate,
          enrollmentDeadline: apiCourse.enrollmentDeadline
        }))
        
        console.log('Final courses for display:', displayCourses.length)
        setCourses(displayCourses)
        
      } catch (err) {
        console.error('Failed to load courses:', err)
        setError(err instanceof Error ? err.message : 'Failed to load courses data')
      } finally {
        setLoading(false)
      }
    }
    
    loadCoursesData()
  }, [user])
  
  return { courses, loading, error }
}

interface CourseCardProps {
  course: Course
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }



  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">{course.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{course.code}</p>
          </div>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(course.status))}>
            {course.status}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Instructor */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {course.instructor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{course.instructor.name}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="text-sm">
          <p className="text-foreground font-medium">
            {course.schedule.days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')} • {course.schedule.startTime}
          </p>
          <p className="text-muted-foreground">{course.schedule.location}</p>
        </div>



        {/* Action Button */}
        <Link href={`/courses/${course.id}`}>
          <Button variant="default" size="sm" className="w-full">
            View Course Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}



export default function CoursesPage() {
  const { user } = useAuth()
  const { courses, loading, error } = useCoursesData()

  const userData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Guest User",
    email: user?.email || "guest@example.com"
  }

  // Determine user type based on role, default to student for guests
  const userType = user?.role === 'STUDENT' ? 'student' : 'teacher'

  const drawerContent = (
    <AppDrawerContent 
      userType={userType}
      userData={userData}
    />
  )

  return (
    <AuthGuard requiredRoles={['STUDENT', 'TEACHER', 'SUPERVISOR_TEACHER']}>
      {loading && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
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

      {!loading && !error && (
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {userType === 'student' ? 'My Courses' : 'Teaching Courses'}
                </h1>
                <p className="text-muted-foreground">
                  {userType === 'student' ? 'Manage your enrolled courses' : 'Manage your teaching assignments'}
                </p>
              </div>

              {/* AI Weekly Study Plan for All Courses */}
              <div className="mb-8">
                <WeeklyStudyPlan 
                  courseId="all"
                  courseName="All Courses"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {userType === 'student' ? 'My Courses' : 'Teaching Courses'}
                  </h2>
                  <Button variant="outline">
                    {userType === 'student' ? 'Browse All Courses' : 'Course Management'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </ResponsiveDrawer>
      )}
    </AuthGuard>
  )
}