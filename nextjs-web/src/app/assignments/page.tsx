"use client"

import React, { useState, useEffect } from 'react'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/AuthGuard"
import { AssignmentsAPI } from "@/api/api-assignments"
import { CoursesAPI } from "@/api/api-courses"
import type { Assignment, Course } from "@/api/types"
import { AssignmentStatus } from "@/api/types"

// Hook to load assignments data based on user role
const useAssignmentsData = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssignmentsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!user) {
          setError('User not authenticated')
          return
        }

        // Load assignments based on user role
        let assignmentsData
        if (user.role === 'STUDENT') {
          // For students, get their assignments
          const response = await AssignmentsAPI.getStudentAssignments()
          assignmentsData = response.assignments
        } else {
          // For teachers, get assignments they created
          const response = await AssignmentsAPI.getAssignments({
            instructorId: user.id
          })
          assignmentsData = response.assignments
        }

        setAssignments(assignmentsData)

        // Load courses for context
        const coursesResponse = await CoursesAPI.getCourses()
        setCourses(coursesResponse.courses)
      } catch (err) {
        console.error('Error loading assignments:', err)
        setError(err instanceof Error ? err.message : 'Failed to load assignments data')
      } finally {
        setLoading(false)
      }
    }
    
    loadAssignmentsData()
  }, [user])
  
  return { assignments, courses, loading, error }
}

interface AssignmentCardProps {
  assignment: Assignment
  courseName?: string
  userType: 'student' | 'teacher'
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, courseName, userType }) => {
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'ASSIGNED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const isOverdue = assignment.status === 'OVERDUE' || (new Date(assignment.dueDate) < new Date() && assignment.status === 'ASSIGNED')

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      isOverdue ? "border-red-200 dark:border-red-800" : "border-border"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{assignment.title}</h3>
              <div className="flex items-center space-x-4 mt-1">
                {courseName && <p className="text-sm text-muted-foreground">{courseName}</p>}
                <p className="text-xs text-muted-foreground capitalize">{assignment.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {assignment.maxPoints} pts
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(assignment.status === 'ASSIGNED' && isOverdue ? AssignmentStatus.OVERDUE : assignment.status))}>
              {assignment.status === 'ASSIGNED' && isOverdue ? 'overdue' : assignment.status.toLowerCase()}
            </span>
            
            {userType === 'student' ? (
              <>
                {assignment.status === 'ASSIGNED' && !isOverdue && (
                  <Button variant="default" size="sm">
                    Submit
                  </Button>
                )}
                {((assignment.status === 'ASSIGNED' && isOverdue) || assignment.status === 'OVERDUE') && (
                  <Button variant="destructive" size="sm">
                    Submit Late
                  </Button>
                )}
                {assignment.status !== 'ASSIGNED' && assignment.status !== 'OVERDUE' && (
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                )}
              </>
            ) : (
              <>
                {assignment.status === 'SUBMITTED' && (
                  <Button variant="default" size="sm">
                    Grade
                  </Button>
                )}
                {assignment.status === 'GRADED' && (
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                )}
                {(assignment.status === 'ASSIGNED' || assignment.status === 'OVERDUE') && (
                  <Button variant="outline" size="sm">
                    Monitor
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const { assignments, courses, loading, error } = useAssignmentsData()

  // Determine user type and data based on authentication
  const userType = user?.role === 'STUDENT' ? 'student' : 'teacher'
  const userData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Loading...",
    email: user?.email || ""
  }

  const drawerContent = (
    <AppDrawerContent 
      userType={userType}
      userData={userData}
    />
  )

  if (loading) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  if (error) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

  // Filter to only show assignments (not quizzes, exams, etc.)
  const onlyAssignments = assignments.filter(a => 
    a.type === 'HOMEWORK' || a.type === 'PROJECT' || a.type === 'ESSAY' || a.type === 'LAB'
  )
  
  // Group assignments by status
  const overdueAssignments = onlyAssignments.filter(a => {
    return a.status === 'OVERDUE' || (new Date(a.dueDate) < new Date() && a.status === 'ASSIGNED')
  })
  
  const assignedAssignments = onlyAssignments.filter(a => {
    return a.status === 'ASSIGNED' && new Date(a.dueDate) >= new Date()
  })
  
  const gradedAssignments = onlyAssignments.filter(a => {
    return a.status === 'GRADED'
  })
  
  const submittedAssignments = onlyAssignments.filter(a => {
    return a.status === 'SUBMITTED'
  })

  // Sort each group by due date
  const sortByDueDate = (assignments: Assignment[]) => {
    return [...assignments].sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }

  return (
    <AuthGuard requiredRoles={['STUDENT', 'TEACHER', 'SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {userType === 'student' ? 'My Assignments' : 'My Created Assignments'}
            </h1>
            <p className="text-muted-foreground">
              {userType === 'student' 
                ? 'Track and manage your course assignments' 
                : 'Monitor and grade student assignments you created'}
            </p>
          </div>

          {/* Overdue Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Overdue</h2>
              <span className="text-sm text-muted-foreground">
                {overdueAssignments.length} assignment{overdueAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {overdueAssignments.length === 0 ? (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No overdue assignments</p>
                  </CardContent>
                </Card>
              ) : (
                sortByDueDate(overdueAssignments).map((assignment) => {
                  const course = courses.find(c => c.id === assignment.courseId)
                  return (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      courseName={course?.name}
                      userType={userType}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Assigned Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Assigned</h2>
              <span className="text-sm text-muted-foreground">
                {assignedAssignments.length} assignment{assignedAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {assignedAssignments.length === 0 ? (
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No pending assignments</p>
                  </CardContent>
                </Card>
              ) : (
                sortByDueDate(assignedAssignments).map((assignment) => {
                  const course = courses.find(c => c.id === assignment.courseId)
                  return (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      courseName={course?.name}
                      userType={userType}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Graded Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Graded</h2>
              <span className="text-sm text-muted-foreground">
                {gradedAssignments.length} assignment{gradedAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {gradedAssignments.length === 0 ? (
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No graded assignments</p>
                  </CardContent>
                </Card>
              ) : (
                sortByDueDate(gradedAssignments).map((assignment) => {
                  const course = courses.find(c => c.id === assignment.courseId)
                  return (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      courseName={course?.name}
                      userType={userType}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Submitted Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Submitted</h2>
              <span className="text-sm text-muted-foreground">
                {submittedAssignments.length} assignment{submittedAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {submittedAssignments.length === 0 ? (
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No submitted assignments</p>
                  </CardContent>
                </Card>
              ) : (
                sortByDueDate(submittedAssignments).map((assignment) => {
                  const course = courses.find(c => c.id === assignment.courseId)
                  return (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      courseName={course?.name}
                      userType={userType}
                    />
                  )
                })
              )}
            </div>
          </div>

          </div>
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
}