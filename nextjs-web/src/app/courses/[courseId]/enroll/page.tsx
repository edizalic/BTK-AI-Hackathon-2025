"use client"

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/AuthGuard"
import { useAuth } from "@/lib/auth-context"
import { API } from "@/api"
import type { User, Enrollment } from "@/api/types"
import { cn } from "@/lib/utils"
import Link from 'next/link'

interface EnrollPageProps {
  params: Promise<{
    courseId: string
  }>
}

interface StudentWithEnrollment extends User {
  isEnrolled: boolean
  enrollmentId?: string
}

interface DepartmentGroup {
  departmentName: string
  students: StudentWithEnrollment[]
}

export default function EnrollStudentsPage({ params }: EnrollPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { courseId } = resolvedParams
  const { user } = useAuth()

  const [course, setCourse] = useState<any>(null)
  const [departmentGroups, setDepartmentGroups] = useState<DepartmentGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string[]>([]) // Track which students are being enrolled/unenrolled
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

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

  // Load course and student data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load course data
        const courseResponse = await API.courses.getCourseById(courseId)
        const courseData = (courseResponse as any).data || courseResponse
        setCourse(courseData)

        // First get the course data to know the department
        if (!courseData.department?.name) {
          throw new Error('Course department information not available')
        }

        // Load all students (we'll filter by department after)
        const studentsResponse = await API.users.getAllStudents({
          limit: 1000 // Get all students
        })
        console.log('RAW STUDENTS RESPONSE:', JSON.stringify(studentsResponse, null, 2)) // Only log we need
        const studentsData = (studentsResponse as any).data || studentsResponse
        // The students data is directly the array, not nested under 'students'
        const allStudents = Array.isArray(studentsData) ? studentsData : studentsData.students || studentsData

        // Load enrolled students for this course using the correct endpoint
        // Using a direct API call since the endpoint should be GET /enrollment/courses/:courseId
        const enrolledResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/enrollment/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!enrolledResponse.ok) {
          throw new Error(`Failed to fetch enrollments: ${enrolledResponse.status}`)
        }
        
        const enrolledData = await enrolledResponse.json()
        // Handle the nested structure: {data: {data: []}}
        const enrolledStudents = enrolledData.data?.data || enrolledData.data?.enrollments || enrolledData.enrollments || enrolledData.data || enrolledData

        // Ensure we have valid data arrays
        if (!Array.isArray(allStudents)) {
          throw new Error('Invalid students data received from API')
        }
        if (!Array.isArray(enrolledStudents)) {
          throw new Error('Invalid enrolled students data received from API')
        }

        // Create a set of enrolled student IDs for quick lookup
        const enrolledStudentIds = new Set(enrolledStudents.map(enrollment => enrollment.studentId))

        // Group students by department and mark enrollment status
        const departmentMap = new Map<string, StudentWithEnrollment[]>()

        // Temporarily show all students (remove department filtering for now)
        const courseDepartment = courseData.department.name
        
        // Filter students by major (which represents department)
        const departmentStudents = allStudents.filter(student => 
          student.profile?.major === courseDepartment
        )

        departmentStudents.forEach(student => {
          const department = student.profile?.major || 'No Department'
          const studentWithEnrollment: StudentWithEnrollment = {
            ...student,
            isEnrolled: enrolledStudentIds.has(student.id),
            enrollmentId: enrolledStudents.find(e => e.studentId === student.id)?.id
          }

          if (!departmentMap.has(department)) {
            departmentMap.set(department, [])
          }
          departmentMap.get(department)!.push(studentWithEnrollment)
        })

        // Convert map to array and sort
        const groups: DepartmentGroup[] = Array.from(departmentMap.entries())
          .map(([departmentName, students]) => ({
            departmentName,
            students: students.sort((a, b) => `${a.profile?.firstName} ${a.profile?.lastName}`.localeCompare(`${b.profile?.firstName} ${b.profile?.lastName}`))
          }))
          .sort((a, b) => a.departmentName.localeCompare(b.departmentName))

        setDepartmentGroups(groups)
      } catch (err) {
        console.error('Error loading enrollment data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load enrollment data')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      loadData()
    }
  }, [courseId])

  // Handle individual student enrollment toggle
  const handleStudentToggle = async (student: StudentWithEnrollment) => {
    if (enrolling.includes(student.id)) return

    try {
      setEnrolling(prev => [...prev, student.id])

      if (student.isEnrolled) {
        // Unenroll student
        await API.courses.unenrollStudent(courseId, student.id)
      } else {
        // Enroll student
        await API.courses.enrollStudent(courseId, { studentId: student.id })
      }

      // Update local state
      setDepartmentGroups(prev => 
        prev.map(group => ({
          ...group,
          students: group.students.map(s => 
            s.id === student.id 
              ? { ...s, isEnrolled: !s.isEnrolled }
              : s
          )
        }))
      )
    } catch (err) {
      console.error('Error toggling enrollment:', err)
      setError(err instanceof Error ? err.message : 'Failed to update enrollment')
    } finally {
      setEnrolling(prev => prev.filter(id => id !== student.id))
    }
  }

  // Handle bulk enrollment
  const handleBulkEnroll = async () => {
    if (selectedStudents.size === 0) return

    try {
      setEnrolling(prev => [...prev, ...Array.from(selectedStudents)])

      const studentIds = Array.from(selectedStudents)
      console.log('Bulk enrolling students:', studentIds)
      
      // Use the correct enrollment endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/enrollment/courses/${courseId}/bulk-enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentIds: studentIds
        })
      })

      if (!response.ok) {
        throw new Error(`Bulk enrollment failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Bulk enrollment result:', result)

      // Update local state
      setDepartmentGroups(prev => 
        prev.map(group => ({
          ...group,
          students: group.students.map(s => 
            selectedStudents.has(s.id) 
              ? { ...s, isEnrolled: true }
              : s
          )
        }))
      )

      setSelectedStudents(new Set())
    } catch (err) {
      console.error('Bulk enrollment error details:', err)
      setError(err instanceof Error ? err.message : 'Failed to bulk enroll students')
    } finally {
      setEnrolling(prev => prev.filter(id => !selectedStudents.has(id)))
    }
  }

  // Filter students based on search term
  const filteredGroups = departmentGroups.map(group => ({
    ...group,
    students: group.students.filter(student => {
      const fullName = `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.toLowerCase()
      const email = student.email.toLowerCase()
      const studentId = student.profile?.studentId?.toLowerCase() || ''
      const search = searchTerm.toLowerCase()
      
      return fullName.includes(search) || email.includes(search) || studentId.includes(search)
    })
  })).filter(group => group.students.length > 0)



  if (loading) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading enrollment data...</p>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  if (error || !course) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Failed to load enrollment data'}</p>
            <Button onClick={() => router.push(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  const totalStudents = departmentGroups.reduce((sum, group) => sum + group.students.length, 0)
  const enrolledStudents = departmentGroups.reduce((sum, group) => 
    sum + group.students.filter(s => s.isEnrolled).length, 0
  )
  const unenrolledStudents = departmentGroups.reduce((sum, group) => 
    sum + group.students.filter(s => !s.isEnrolled).length, 0
  )

  return (
    <AuthGuard requiredRoles={['SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" size="sm">
                    ← Back to Course
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-foreground mt-4">Enroll Students</h1>
                <p className="text-muted-foreground">{course.name} ({course.code})</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Course Capacity</div>
                <div className="text-2xl font-bold">{enrolledStudents}/{course.capacity}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
                  <p className="text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">{enrolledStudents}</div>
                  <p className="text-muted-foreground">Enrolled</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{unenrolledStudents}</div>
                  <p className="text-muted-foreground">Available to Enroll</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Bulk Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <Label htmlFor="search">Search Students</Label>
                    <Input
                      id="search"
                      placeholder="Search by name, email, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedStudents(new Set())}
                      disabled={selectedStudents.size === 0}
                    >
                      Clear Selection ({selectedStudents.size})
                    </Button>
                    <Button 
                      onClick={handleBulkEnroll}
                      disabled={selectedStudents.size === 0 || enrolling.length > 0}
                    >
                      Enroll Selected ({selectedStudents.size})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students by Department */}
            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <Card key={group.departmentName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.departmentName}</span>
                      <Badge variant="outline">
                        {group.students.filter(s => s.isEnrolled).length}/{group.students.length} enrolled
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.students.map((student) => (
                        <div
                          key={student.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            student.isEnrolled 
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                              : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            {!student.isEnrolled && (
                              <Checkbox
                                checked={selectedStudents.has(student.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedStudents)
                                  if (checked) {
                                    newSelected.add(student.id)
                                  } else {
                                    newSelected.delete(student.id)
                                  }
                                  setSelectedStudents(newSelected)
                                }}
                              />
                            )}
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {`${student.profile?.firstName?.[0] || ''}${student.profile?.lastName?.[0] || ''}` || student.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {student.profile?.firstName} {student.profile?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                              {student.profile?.studentId && (
                                <p className="text-xs text-muted-foreground">ID: {student.profile.studentId}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {student.isEnrolled ? (
                              <Badge variant="default" className="bg-green-600">
                                Enrolled
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Not Enrolled
                              </Badge>
                            )}
                            <Button
                              variant={student.isEnrolled ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleStudentToggle(student)}
                              disabled={enrolling.includes(student.id)}
                            >
                              {enrolling.includes(student.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : student.isEnrolled ? (
                                "Unenroll"
                              ) : (
                                "Enroll"
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No students found matching your search.</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
}