"use client"

import React, { useState, useEffect } from 'react'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthGuard } from "@/components/AuthGuard"
import { useAuth } from "@/lib/auth-context"
import { API } from "@/api"
import type { Course, CreateCourseDto, CourseLevel } from "@/api/types"
import { UserRole } from "@/api/types"
import { cn } from "@/lib/utils"
import Link from 'next/link'

export default function SupervisorCoursesPage() {
  const { user } = useAuth()
  
  // Get supervisor's department from profile
  const supervisorDepartment = user?.profile?.department || "Computer Science"
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  
  // Form state for creating course
  const [createForm, setCreateForm] = useState({
    code: "",
    name: "",
    description: "",
    credits: 3,
    scheduleDays: [] as string[],
    startTime: "",
    endTime: "",
    location: "",
    building: "",
    room: "",
    instructorId: "",
    semester: "",
    year: new Date().getFullYear(),
    capacity: 30,
    category: "",
    level: "UNDERGRADUATE" as CourseLevel,
    startDate: "",
    endDate: "",
    enrollmentDeadline: ""
  })

  // Auto-clear messages after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Fetch courses when component mounts or department changes
  useEffect(() => {
    if (supervisorDepartment) {
      fetchCourses()
      fetchTeachers()
    }
  }, [supervisorDepartment])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== FETCHING COURSES FOR DEPARTMENT ===')
      console.log('Supervisor department:', supervisorDepartment)
      
      // Try fetching all courses first to see what's available
      console.log('Fetching all courses first...')
      const allCoursesResponse = await API.courses.getCourses({})
      
      console.log('All courses API response:', allCoursesResponse)
      console.log('All courses response keys:', Object.keys(allCoursesResponse))
      
      // Handle different response structures - API returns data array
      const allCoursesArray = allCoursesResponse.courses || []
      console.log('All courses array:', allCoursesArray)
      console.log('Total courses in system:', allCoursesArray.length)
      
      // Log each course to understand the structure
      allCoursesArray.forEach((course, index) => {
        console.log(`Course ${index}:`, {
          id: course.id,
          code: course.code,
          name: course.name,
          departmentId: course.departmentId,
          instructor: course.instructor?.profile ? 
            `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}` : 
            course.instructor?.email,
          createdBy: course.createdBy?.profile ? 
            `${course.createdBy.profile.firstName} ${course.createdBy.profile.lastName}` : 
            course.createdBy?.email
        })
      })
      
      // Filter courses by department - need to check if course was created by current supervisor
      // or belongs to the same department (since departmentId is a UUID, not department name)
      const filteredCourses = allCoursesArray.filter(course => {
        // Option 1: Check if created by current supervisor
        const createdByCurrentUser = course.createdById === user?.id
        
        // Option 2: Check if instructor belongs to same department
        const instructorInSameDept = course.instructor?.profile?.department === supervisorDepartment
        
        // Option 3: For now, show all courses created by this supervisor
        const matches = createdByCurrentUser || instructorInSameDept
        
        console.log(`Course ${course.code}:`, {
          departmentId: course.departmentId,
          createdById: course.createdById,
          currentUserId: user?.id,
          createdByCurrentUser,
          instructorDept: course.instructor?.profile?.department,
          supervisorDept: supervisorDepartment,
          instructorInSameDept,
          finalMatch: matches
        })
        
        return matches
      })
      
      console.log('Courses after filtering by department:', filteredCourses.length)
      console.log('Filtered courses:', filteredCourses)
      
      setCourses(filteredCourses)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setError('Failed to load courses')
      setMessage({type: 'error', text: 'Failed to load courses for your department'})
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      
      // Fetch both teachers and supervisors using the working API pattern
      const teachersResponse = await API.users.getUsers({
        role: UserRole.TEACHER
      })
      
      const supervisorsResponse = await API.users.getUsers({
        role: UserRole.SUPERVISOR_TEACHER
      })
      
      // Handle different response structures for both
      const teachersArray = teachersResponse.users || []
      const supervisorsArray = supervisorsResponse.users || []
      
      // Combine both arrays
      const allInstructors = [...teachersArray, ...supervisorsArray]
      
      // Filter instructors by department matching supervisor's department
      const filteredInstructors = allInstructors.filter(instructor => {
        const instructorDepartment = instructor.profile?.department
        return instructorDepartment === supervisorDepartment
      })
      
      setTeachers(filteredInstructors)
    } catch (error) {
      console.error('Failed to fetch teachers and supervisors:', error)
      setMessage({type: 'error', text: 'Failed to load instructors list'})
    } finally {
      setLoadingTeachers(false)
    }
  }

  // Filter courses based on search term and status
  const filteredCourses = courses.filter(course => {
    const instructorName = course.instructor?.profile ? 
      `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}` : 
      ''
    
    const matchesSearch = searchTerm === "" || 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group courses by status
  const coursesByStatus = filteredCourses.reduce((groups, course) => {
    const status = course.status || 'unknown'
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(course)
    return groups
  }, {} as Record<string, Course[]>)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '🟢'
      case 'completed':
        return '✅'
      case 'upcoming':
        return '🔜'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
    }
  }

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'scheduleDays') {
      // Handle multiple select for schedule days
      const selectElement = e.target as HTMLSelectElement
      const selectedOptions = Array.from(selectElement.selectedOptions, option => option.value)
      setCreateForm(prev => ({ ...prev, [name]: selectedOptions }))
    } else if (type === 'number') {
      setCreateForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setCreateForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleScheduleDayToggle = (day: string) => {
    setCreateForm(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }))
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // Enhanced validation
      console.log('=== VALIDATING FORM DATA ===')
      console.log('Form data:', createForm)
      
      if (!createForm.code || !createForm.name || !createForm.instructorId || !createForm.semester) {
        const missingFields = []
        if (!createForm.code) missingFields.push('Code')
        if (!createForm.name) missingFields.push('Name')
        if (!createForm.instructorId) missingFields.push('Instructor')
        if (!createForm.semester) missingFields.push('Semester')
        
        setMessage({type: 'error', text: `Please fill in all required fields: ${missingFields.join(', ')}`})
        setIsCreating(false)
        return
      }

      if (createForm.scheduleDays.length === 0) {
        setMessage({type: 'error', text: 'Please select at least one schedule day'})
        setIsCreating(false)
        return
      }
      
      // Validate instructor exists
      const selectedInstructor = teachers.find(t => t.id === createForm.instructorId)
      if (!selectedInstructor) {
        setMessage({type: 'error', text: 'Selected instructor not found. Please refresh and try again.'})
        setIsCreating(false)
        return
      }
      
      console.log('Selected instructor:', selectedInstructor)
      console.log('Supervisor department for course:', supervisorDepartment)

      const courseData: CreateCourseDto = {
        code: createForm.code,
        name: createForm.name,
        description: createForm.description,
        credits: createForm.credits,
        scheduleDays: createForm.scheduleDays,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        location: createForm.location,
        building: createForm.building || undefined,
        room: createForm.room || undefined,
        instructorId: createForm.instructorId,
        semester: createForm.semester,
        year: createForm.year,
        capacity: createForm.capacity,
        category: createForm.category,
        departmentId: supervisorDepartment, // Use supervisor's department
        level: createForm.level,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        enrollmentDeadline: createForm.enrollmentDeadline || undefined
      }

      console.log('=== CREATING COURSE ===')
      console.log('Course data:', JSON.stringify(courseData, null, 2))
      
      const result = await API.courses.createCourse(courseData)
      console.log('Course creation result:', result)
      
      // Refresh courses list
      await fetchCourses()
      
      // Reset form and close modal
      setCreateForm({
        code: "",
        name: "",
        description: "",
        credits: 3,
        scheduleDays: [],
        startTime: "",
        endTime: "",
        location: "",
        building: "",
        room: "",
        instructorId: "",
        semester: "",
        year: new Date().getFullYear(),
        capacity: 30,
        category: "",
        level: "UNDERGRADUATE" as CourseLevel,
        startDate: "",
        endDate: "",
        enrollmentDeadline: ""
      })
      setShowCreateModal(false)
      setMessage({type: 'success', text: `Course ${createForm.code} - ${createForm.name} created successfully!`})
    } catch (error) {
      console.error('=== COURSE CREATION ERROR ===')
      console.error('Full error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      let errorMessage = 'Unknown error occurred'
      
      // Handle different error formats
      if (error && typeof error === 'object') {
        console.error('Error keys:', Object.keys(error))
        
        // Check for API error with message
        if ('message' in error) {
          const apiError = error as any
          console.error('Error message:', apiError.message)
          if (Array.isArray(apiError.message)) {
            errorMessage = apiError.message.join(', ')
          } else if (typeof apiError.message === 'string') {
            errorMessage = apiError.message
          } else {
            errorMessage = JSON.stringify(apiError.message)
          }
        }
        // Check for HTTP response error
        else if ('response' in error) {
          const httpError = error as any
          console.error('HTTP response:', httpError.response)
          if (httpError.response?.data?.message) {
            errorMessage = Array.isArray(httpError.response.data.message) 
              ? httpError.response.data.message.join(', ')
              : httpError.response.data.message
          } else if (httpError.response?.statusText) {
            errorMessage = `${httpError.response.status}: ${httpError.response.statusText}`
          } else {
            errorMessage = `HTTP Error: ${httpError.response?.status || 'Unknown'}`
          }
        }
        // Check for error property
        else if ('error' in error) {
          const apiError = error as any
          errorMessage = apiError.error
        }
        // Fallback to string representation
        else {
          errorMessage = JSON.stringify(error)
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.error('Final error message:', errorMessage)
      setMessage({type: 'error', text: `Failed to create course: ${errorMessage}`})
    } finally {
      setIsCreating(false)
    }
  }

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">{course.name}</CardTitle>
            <p className="text-muted-foreground text-sm font-mono">{course.code}</p>
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
            {course.instructor?.profile ? 
              `${course.instructor.profile.firstName[0]}${course.instructor.profile.lastName[0]}` : 
              'N/A'
            }
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {course.instructor?.profile ? 
                `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}` : 
                'No instructor assigned'
              }
            </p>
            <p className="text-xs text-muted-foreground">{course.instructor?.email}</p>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credits:</span>
            <span className="font-medium">{course.credits || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">{course.capacity || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Enrolled:</span>
            <span className="font-medium">{course.enrolled || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Semester:</span>
            <span className="font-medium">{course.semester} {course.year}</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="text-sm">
          <p className="text-foreground font-medium">
            {course.scheduleDays?.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')} • {course.startTime}
          </p>
          <p className="text-muted-foreground">{course.location}</p>
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

  const userData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Loading...",
    email: user?.email || ""
  }

  const drawerContent = (
    <AppDrawerContent 
      userType="teacher"
      userData={userData}
    />
  )

  return (
    <AuthGuard requiredRoles={['SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Department Courses</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage all courses in {supervisorDepartment} department
              </p>
            </div>

            {/* Success/Error Message */}
            {message && (
              <Card className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {message.text}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMessage(null)}
                      className="ml-4"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Courses</Label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by course name, code, or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <span className="mr-2 text-white font-black text-xl">+</span>
                      Create New Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? '...' : filteredCourses.length}
                  </div>
                  <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Courses</div>
                </CardContent>
              </Card>
              
              {['active', 'upcoming', 'completed'].map(status => (
                <Card key={status} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {loading ? '...' : (coursesByStatus[status]?.length || 0)}
                    </div>
                    <div className="text-sm text-green-600/80 dark:text-green-400/80 capitalize">{status}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600 dark:text-slate-400">Loading courses...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-8 text-center">
                  <div className="text-red-600 dark:text-red-400">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium mb-2">Error Loading Courses</h3>
                    <p className="text-sm">{error}</p>
                    <Button 
                      onClick={fetchCourses} 
                      className="mt-4"
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses by Status */}
            {!loading && !error && (
              <div className="space-y-6">
                {Object.keys(coursesByStatus).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-slate-500 dark:text-slate-400">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== "all" 
                            ? "No courses match your current filters." 
                            : "No courses are available in your department yet."
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  Object.entries(coursesByStatus).map(([status, statusCourses]) => (
                    <Card key={status}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="text-2xl">{getStatusIcon(status)}</span>
                          <span className="capitalize">{status} Courses</span>
                          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                            {statusCourses.length} courses
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {statusCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Create Course Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-green-600 font-black text-2xl">+</span>
                    <span>Create New Course</span>
                  </CardTitle>
                  <CardDescription>
                    Create a new course for {supervisorDepartment} department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCourse} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="course-code">Course Code *</Label>
                          <Input
                            id="course-code"
                            name="code"
                            type="text"
                            placeholder="CS101"
                            value={createForm.code}
                            onChange={handleCreateFormChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course-name">Course Name *</Label>
                          <Input
                            id="course-name"
                            name="name"
                            type="text"
                            placeholder="Introduction to Computer Science"
                            value={createForm.name}
                            onChange={handleCreateFormChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="course-description">Description</Label>
                        <textarea
                          id="course-description"
                          name="description"
                          placeholder="Course description..."
                          value={createForm.description}
                          onChange={handleCreateFormChange}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="credits">Credits</Label>
                          <Input
                            id="credits"
                            name="credits"
                            type="number"
                            min="1"
                            max="6"
                            value={createForm.credits}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            min="1"
                            max="200"
                            value={createForm.capacity}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Level</Label>
                          <select
                            id="level"
                            name="level"
                            value={createForm.level}
                            onChange={handleCreateFormChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="UNDERGRADUATE">Undergraduate</option>
                            <option value="GRADUATE">Graduate</option>
                            <option value="DOCTORAL">Doctoral</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Schedule Information</h3>
                      
                      <div className="space-y-2">
                        <Label>Schedule Days *</Label>
                        <div className="flex flex-wrap gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleScheduleDayToggle(day)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                createForm.scheduleDays.includes(day)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            name="startTime"
                            type="time"
                            value={createForm.startTime}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            name="endTime"
                            type="time"
                            value={createForm.endTime}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="Room 101"
                            value={createForm.location}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="building">Building</Label>
                          <Input
                            id="building"
                            name="building"
                            type="text"
                            placeholder="Science Building"
                            value={createForm.building}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="room">Room</Label>
                          <Input
                            id="room"
                            name="room"
                            type="text"
                            placeholder="101"
                            value={createForm.room}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Academic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="instructor">Instructor *</Label>
                          <select
                            id="instructor"
                            name="instructorId"
                            value={createForm.instructorId}
                            onChange={handleCreateFormChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          >
                            <option value="">Select Instructor</option>
                            {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.profile?.firstName} {teacher.profile?.lastName} ({teacher.email})
                              </option>
                            ))}
                          </select>
                          {loadingTeachers && (
                            <p className="text-xs text-gray-500">Loading teachers...</p>
                          )}
                          {!loadingTeachers && teachers.length === 0 && (
                            <p className="text-xs text-red-500">No teachers found in {supervisorDepartment} department</p>
                          )}
                          {!loadingTeachers && teachers.length > 0 && (
                            <p className="text-xs text-green-600">{teachers.length} teachers available</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            type="text"
                            placeholder="Core, Elective, etc."
                            value={createForm.category}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="semester">Semester *</Label>
                          <select
                            id="semester"
                            name="semester"
                            value={createForm.semester}
                            onChange={handleCreateFormChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          >
                            <option value="">Select Semester</option>
                            <option value="Fall">Fall</option>
                            <option value="Spring">Spring</option>
                            <option value="Summer">Summer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            name="year"
                            type="number"
                            min="2020"
                            max="2030"
                            value={createForm.year}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Important Dates</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            name="startDate"
                            type="date"
                            value={createForm.startDate}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            name="endDate"
                            type="date"
                            value={createForm.endDate}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="enrollment-deadline">Enrollment Deadline</Label>
                          <Input
                            id="enrollment-deadline"
                            name="enrollmentDeadline"
                            type="date"
                            value={createForm.enrollmentDeadline}
                            onChange={handleCreateFormChange}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <div className="flex justify-end space-x-2 p-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCourse}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
}