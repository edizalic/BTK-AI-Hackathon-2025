"use client"

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Course, CourseModule, CourseAnnouncement, Assignment, Grade, CourseMaterial, Quiz } from "@/types/courses"
import { Course as APICourse, StudyPlan, StudyPlanWeek } from "@/api/types"
import { API } from "@/api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { ChevronDown, ChevronRight } from "lucide-react"
import { WeeklyStudyPlan } from "@/components/WeeklyStudyPlan"

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string
  }>
}



interface ClassSession {
  id: string
  date: string
  topic: string
  location: string
  notes?: string
  cancelled?: boolean
}

interface CourseDetailedView extends Course {
  materials: CourseMaterial[]
  announcements: CourseAnnouncement[]
  upcomingDeadlines: Assignment[]
  recentGrades: Grade[]
  upcomingSessions: ClassSession[]
  openQuizzes: Quiz[]
}

// Hook to load course details from API
const useCourseDetails = (courseId: string) => {
  const [course, setCourse] = useState<CourseDetailedView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [studyPlanLoading, setStudyPlanLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load course data from API
        const apiResponse = await API.courses.getCourseById(courseId)
        
        if (!apiResponse) {
          throw new Error(`Course not found: ${courseId}`)
        }

        // Extract course data from the response (it's nested under 'data')
        const apiCourse = (apiResponse as any).data || apiResponse

        if (!apiCourse || !apiCourse.id) {
          throw new Error(`Course data not found: ${courseId}`)
        }

        console.log('📥 Course Response:', apiResponse)
        
        // Fetch current enrollment count
        let enrollmentCount = 0
        try {
          const enrollmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/enrollment/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json()
            const enrollments = enrollmentData.data?.data || enrollmentData.data || []
            enrollmentCount = Array.isArray(enrollments) ? enrollments.length : 0
          }
        } catch (enrollmentError) {
          console.warn('Could not fetch enrollment count:', enrollmentError)
        }

        // Load quiz data with attempt information for students
        let quizzes = apiCourse.quizzes || []
        console.log('📥 Quiz Response:', quizzes)
        
        // Try to get quizzes from the proper endpoint if the course quizzes seem wrong
        if (quizzes.length > 0 && quizzes.some((q: any) => q.id === 'cmdzqy2h30001qph5gs7d2kzt')) {
          try {
            const quizzesResponse = await API.quizzes.getCourseQuizzes(courseId, {
              availableOnly: true
            })
            if (quizzesResponse.quizzes && quizzesResponse.quizzes.length > 0) {
              console.log('📥 Alternative Quiz Response:', quizzesResponse.quizzes)
              quizzes = quizzesResponse.quizzes
            }
          } catch (alternativeError) {
            console.warn('Alternative quiz API failed:', alternativeError)
          }
        }
        
        if (user?.role === 'STUDENT' && quizzes.length > 0) {
          try {
            // Fetch attempt information for each quiz
            const quizzesWithAttempts = await Promise.all(
              quizzes.map(async (quiz: any) => {
                try {
                  const attemptResponse = await API.quizzes.getMyQuizAttempts(quiz.id)
                  const attempts = attemptResponse.attempts || []
                  const attemptsUsed = attempts.length
                  
                  const processedQuiz = {
                    ...quiz,
                    attemptsUsed,
                    attemptsRemaining: quiz.attemptsAllowed - attemptsUsed
                  }
                  return processedQuiz
                } catch (attemptError) {
                  console.warn(`Could not fetch attempts for quiz ${quiz.id}:`, attemptError)
                  // Fallback to default values
                  const processedQuiz = {
                    ...quiz,
                    attemptsUsed: 0,
                    attemptsRemaining: quiz.attemptsAllowed || 1
                  }
                  return processedQuiz
                }
              })
            )
            quizzes = quizzesWithAttempts
          } catch (quizError) {
            console.warn('Could not fetch quiz attempts:', quizError)
            // Keep original quiz data if attempt fetching fails
          }
        }
        
        // Transform API course data to match the expected interface
        const transformedCourse: CourseDetailedView = {
          id: apiCourse.id || '',
          code: apiCourse.code || '',
          name: apiCourse.name || '',
          description: apiCourse.description || '',
          credits: apiCourse.credits || 0,
          schedule: {
            days: apiCourse.scheduleDays || [],
            startTime: apiCourse.startTime || '',
            endTime: apiCourse.endTime || '',
            location: apiCourse.location || '',
            building: apiCourse.building || '',
            room: apiCourse.room || ''
          },
          instructor: {
            id: apiCourse.instructor?.id || '',
            name: apiCourse.instructor?.profile 
              ? `${apiCourse.instructor.profile.firstName || ''} ${apiCourse.instructor.profile.lastName || ''}`.trim() 
              : apiCourse.instructor?.email || 'Unknown Instructor',
            email: apiCourse.instructor?.email || '',
            office: apiCourse.instructor?.profile?.officeLocation || undefined,
            officeHours: apiCourse.instructor?.profile?.officeHours || undefined
          },
          semester: apiCourse.semester || '',
          year: apiCourse.year || new Date().getFullYear(),
          capacity: apiCourse.capacity || 30,
          enrolled: enrollmentCount,
          status: (apiCourse.status?.toLowerCase() || 'active') as Course['status'],
          category: apiCourse.category || '',
          department: apiCourse.department?.name || 'General',
          level: (apiCourse.level?.toLowerCase() || 'beginner') as Course['level'],
          startDate: apiCourse.startDate || '',
          endDate: apiCourse.endDate || '',
          enrollmentDeadline: apiCourse.enrollmentDeadline || undefined,
          // Use API data for assignments and other features
          materials: apiCourse.courseMaterials || [],
          announcements: apiCourse.announcements || [],
          upcomingDeadlines: apiCourse.assignments || [],
          recentGrades: [],
          upcomingSessions: [],
          openQuizzes: quizzes,
          progress: {
            completed: 0,
            total: 0,
            currentGrade: 0,
            attendance: 0
          }
        }
        
        setCourse(transformedCourse)
        
        // Extract study plan from the course data
        if (apiCourse.studyPlan && Array.isArray(apiCourse.studyPlan)) {
          const studyPlanData = {
            id: apiCourse.id,
            courseId: apiCourse.id,
            weeks: apiCourse.studyPlan.map((week: any, index: number) => ({
              week: (index + 1).toString(),
              description: week.description || week.content || ''
            })),
            createdById: apiCourse.createdById,
            createdBy: apiCourse.instructor,
            createdAt: apiCourse.createdAt,
            updatedAt: apiCourse.updatedAt
          }
          setStudyPlan(studyPlanData)
        } else {
          setStudyPlan(null)
        }
      } catch (err) {
        console.error('Error loading course details:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load course details'
        setError(`${errorMessage} (Course ID: ${courseId})`)
      } finally {
        setLoading(false)
      }
    }
    
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId, user?.role])
  
  return { course, loading, error, studyPlan, studyPlanLoading: loading }
}

interface ModuleCardProps {
  module: CourseModule
  courseId: string
}

interface MaterialCardProps {
  material: CourseMaterial
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const getTypeIcon = (type: string) => {
    const icons = {
      syllabus: '📋',
      slides: '📊', 
      reading: '📚',
      handout: '📄',
      reference: '🔗'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      syllabus: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      slides: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      reading: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      handout: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      reference: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{getTypeIcon(material.type)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground truncate">{material.title}</h3>
                {material.description && (
                  <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span>Uploaded: {new Date(material.uploadDate).toLocaleDateString()}</span>
                  <span>{material.fileSize || material.size}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <span className={cn("px-2 py-1 rounded text-xs font-medium capitalize", getTypeColor(material.type))}>
                  {material.type}
                </span>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AssignmentItemProps {
  assignment: Assignment
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => {
  const isOverdue = new Date(assignment.dueDate) < new Date()
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      isOverdue ? "border-red-200 dark:border-red-800" : "border-border"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{assignment.title}</h4>
            <p className="text-sm text-muted-foreground">
              Due: {new Date(assignment.dueDate).toLocaleDateString()} 
              {isOverdue ? (
                <span className="text-red-600 ml-2">• Overdue</span>
              ) : daysUntilDue <= 3 ? (
                <span className="text-orange-600 ml-2">• Due Soon</span>
              ) : null}
            </p>
          </div>
          <Button variant={assignment.status === 'assigned' ? 'default' : 'outline'} size="sm">
            {assignment.status === 'assigned' ? 'Submit' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuizCardProps {
  quiz: Quiz
  courseId: string
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, courseId }) => {
  const { user } = useAuth()
  const isOverdue = new Date(quiz.dueDate) < new Date()
  const daysUntilDue = Math.ceil((new Date(quiz.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const attemptsRemaining = quiz.attemptsAllowed - quiz.attemptsUsed
  
  const isInstructorOrSupervisor = user?.role === 'TEACHER' || user?.role === 'SUPERVISOR_TEACHER' || user?.role === 'ADMIN'
  
  const handleDeleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/quizzes/${quiz.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete quiz: ${response.status}`)
      }
      
      // Refresh the page to update the quiz list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz. Please try again.')
    }
  }
  
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      isOverdue ? "border-red-200 dark:border-red-800" : "border-border"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📝</span>
              <h3 className="font-semibold text-foreground">{quiz.title}</h3>
              {isOverdue && (
                <span className="text-red-600 text-sm font-medium">• Overdue</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 text-xs text-muted-foreground gap-1">
              <span>⏱️ {quiz.duration}</span>
              <span>📊 {quiz.totalQuestions} questions</span>
              <span>🎯 {quiz.maxPoints} points</span>
              <span>🔄 {attemptsRemaining} attempts left</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Due: {new Date(quiz.dueDate).toLocaleDateString()}
              </span>
              {!isOverdue && daysUntilDue <= 3 && (
                <span className="text-orange-600 text-xs font-medium">• Due Soon</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end space-y-2 sm:ml-4">
            <div className="flex items-center space-x-2">
              {isInstructorOrSupervisor && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteQuiz}
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
              )}
              {!isOverdue && attemptsRemaining > 0 ? (
                <Link href={`/courses/${courseId}/solve-quiz/${quiz.id}`}>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Start Quiz
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  className="w-full sm:w-auto"
                >
                  {isOverdue ? 'Expired' : attemptsRemaining === 0 ? 'No Attempts Left' : 'Start Quiz'}
                </Button>
              )}
            </div>
            {quiz.isTimed && (
              <span className="text-xs text-muted-foreground">⏰ Timed</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GradeItemProps {
  grade: Grade
}

const GradeItem: React.FC<GradeItemProps> = ({ grade }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{grade.assignmentTitle}</h4>
            <p className="text-sm text-muted-foreground">
              Graded: {new Date(grade.gradedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{grade.score}/{grade.maxPoints}</p>
            <p className="text-sm text-muted-foreground">{grade.letterGrade}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnnouncementCardProps {
  announcement: CourseAnnouncement
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const isHighPriority = announcement.priority === 'high' || announcement.isImportant

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      isHighPriority ? "border-red-200 dark:border-red-800" : "border-border"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            {isHighPriority && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
            <h3 className="font-semibold text-foreground">{announcement.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {announcement.priority && (
              <span className={cn("px-2 py-1 rounded text-xs font-medium capitalize", getPriorityColor(announcement.priority))}>
                {announcement.priority}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(announcement.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
        <p className="text-xs text-muted-foreground">— {announcement.author}</p>
      </CardContent>
    </Card>
  )
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { courseId } = resolvedParams
  const { user } = useAuth()
  
  // Check if user is a teacher (TEACHER or SUPERVISOR_TEACHER)
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SUPERVISOR_TEACHER'
  // Check if user is a supervisor
  const isSupervisor = user?.role === 'SUPERVISOR_TEACHER'
  
  const userData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Loading...",
    email: user?.email || ""
  }

  const { course, loading, error, studyPlan, studyPlanLoading } = useCourseDetails(courseId)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [studyPlanExpanded, setStudyPlanExpanded] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [editingWeeks, setEditingWeeks] = useState<StudyPlanWeek[]>([])
  const [saving, setSaving] = useState(false)

  const toggleWeek = (week: string) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(week)) {
      newExpanded.delete(week)
    } else {
      newExpanded.add(week)
    }
    setExpandedWeeks(newExpanded)
  }

  const openManageModal = () => {
    // Initialize editing weeks with existing study plan or empty array
    setEditingWeeks(studyPlan?.weeks || [])
    setShowManageModal(true)
  }

  const addWeek = () => {
    const nextWeekNumber = editingWeeks.length + 1
    const newWeek: StudyPlanWeek = {
      week: nextWeekNumber.toString(),
      description: ''
    }
    setEditingWeeks([...editingWeeks, newWeek])
  }

  const updateWeekDescription = (weekIndex: number, description: string) => {
    const updatedWeeks = [...editingWeeks]
    updatedWeeks[weekIndex].description = description
    setEditingWeeks(updatedWeeks)
  }

  const removeWeek = (weekIndex: number) => {
    const updatedWeeks = editingWeeks.filter((_, index) => index !== weekIndex)
    // Renumber weeks
    const renumberedWeeks = updatedWeeks.map((week, index) => ({
      ...week,
      week: (index + 1).toString()
    }))
    setEditingWeeks(renumberedWeeks)
  }

  const saveStudyPlan = async () => {
    try {
      setSaving(true)
      
      // Direct API call to PUT /courses/:courseId/study-plan
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/courses/${courseId}/study-plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weeks: editingWeeks
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save study plan: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Study plan saved successfully:', result)
      
      // Reload study plan data
      window.location.reload()
    } catch (err) {
      console.error('Error saving study plan:', err)
      alert('Failed to save study plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const drawerContent = (
    <AppDrawerContent 
      userType={isTeacher ? "teacher" : "student"}
      userData={userData}
    />
  )

  if (loading) {
    return (
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading course details...</p>
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
            <h1 className="text-2xl font-bold text-red-600 mb-2">Course Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </ResponsiveDrawer>
    )
  }

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
    <ResponsiveDrawer drawerContent={drawerContent}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          
          {/* Back Button */}
          <div>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                ← Back to Courses
              </Button>
            </Link>
          </div>

          {/* Course Header */}
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold capitalize", getStatusColor(course.status))}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-blue-100 text-lg mb-2">{course.code} • {course.credits} Credits</p>
                  <p className="text-blue-100">{course.description}</p>
                </div>
                <div className="text-center lg:text-right">
                  {course.progress && course.progress.total > 0 ? (
                    <div>
                      <p className="text-blue-100 text-sm">Current Grade</p>
                      <p className="text-white font-bold text-2xl">{course.progress.currentGrade}%</p>
                      <p className="text-blue-100 text-sm">Attendance: {course.progress.attendance}%</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-100 text-sm">Course Status</p>
                      <p className="text-white font-bold text-2xl capitalize">{course.status}</p>
                      <p className="text-blue-100 text-sm">{course.enrolled}/{course.capacity} enrolled</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {course.instructor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{course.instructor.name}</p>
                    <p className="text-sm text-muted-foreground">{course.instructor.email}</p>
                  </div>
                </div>
                {course.instructor.office && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Office: {course.instructor.office}</p>
                    {course.instructor.officeHours && (
                      <p className="text-muted-foreground">Hours: {course.instructor.officeHours}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Days</p>
                    <p className="font-semibold text-foreground">
                      {course.schedule.days.map(day => 
                        day.charAt(0).toUpperCase() + day.slice(1)
                      ).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-semibold text-foreground">
                      {course.schedule.startTime} - {course.schedule.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{course.schedule.location}</p>
                    <p className="text-muted-foreground">{course.schedule.building}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Weekly Study Plan */}
          <WeeklyStudyPlan 
            courseId={courseId}
            courseName={course.name}
            existingStudyPlan={studyPlan}
          />

          {/* Study Plan - Large Accordion Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  className="flex items-center space-x-2 text-left hover:text-foreground transition-colors"
                  onClick={() => setStudyPlanExpanded(!studyPlanExpanded)}
                >
                  <CardTitle>Study Plan</CardTitle>
                  {studyPlanExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {studyPlan && studyPlan.weeks && studyPlan.weeks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {studyPlan.weeks.length} weeks
                  </Badge>
                )}
              </div>
              {isTeacher && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openManageModal}
                >
                  Manage Study Plan
                </Button>
              )}
            </CardHeader>
            {studyPlanExpanded && (
              <CardContent>
                <div className="space-y-4">
                  {studyPlanLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="text-muted-foreground text-sm mt-3">Loading study plan...</p>
                    </div>
                  ) : studyPlan && studyPlan.weeks && studyPlan.weeks.length > 0 ? (
                    <div className="space-y-3">
                      {studyPlan.weeks.map((week) => (
                        <div key={week.week} className="border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <button
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                            onClick={() => toggleWeek(week.week)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {week.week}
                              </div>
                              <span className="font-medium">Week {week.week}</span>
                            </div>
                            {expandedWeeks.has(week.week) ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                          {expandedWeeks.has(week.week) && (
                            <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-gray-200 dark:border-gray-700 pt-3">
                              <div className="prose prose-sm max-w-none">
                                {week.description || "No description available for this week."}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📚</span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {isTeacher 
                          ? "No study plan created yet. Click 'Manage Study Plan' to create one." 
                          : "Study plan will be available soon"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
                         {/* Course Materials & Assignments */}
             <div className="lg:col-span-2 space-y-8">
               
               {/* Open Quizzes */}
                 <div>
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-foreground">Open Quizzes</h2>
                                       {isTeacher && (
                      <Link href={`/courses/${courseId}/create-quiz`}>
                        <Button variant="default" size="sm">
                          + Create Quiz
                        </Button>
                      </Link>
                    )}
                 </div>
                   <div className="space-y-4">
                   {course.openQuizzes.length > 0 ? (
                     course.openQuizzes.map((quiz, index) => {
                       return (
                         <QuizCard key={quiz.id} quiz={quiz} courseId={courseId} />
                       )
                     })
                   ) : (
                     <Card className="p-6 text-center">
                       <p className="text-muted-foreground">
                         {isTeacher ? "No quizzes created yet. Create your first quiz!" : "No open quizzes at this time"}
                       </p>
                     </Card>
                   )}
                   </div>
                 </div>
               
               {/* Course Materials */}
               <div>
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-foreground">Course Materials</h2>
                   {isTeacher && (
                     <Button variant="default" size="sm">
                       + Add Material
                     </Button>
                   )}
                 </div>
                <div className="space-y-4">
                  {course.materials.length > 0 ? (
                    <>
                  {course.materials.slice(0, 5).map((material) => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                  {course.materials.length > 5 && (
                    <Button variant="outline" className="w-full">
                      View All Materials ({course.materials.length})
                    </Button>
                      )}
                    </>
                  ) : (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {isTeacher ? "No materials uploaded yet. Add your first course material!" : "Course materials will be available soon"}
                      </p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Assignments & Deadlines */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Assignments & Deadlines</h2>
                  {isTeacher && (
                    <Link href={`/courses/${courseId}/create-assignment`}>
                      <Button variant="default" size="sm">
                        + Create Assignment
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="space-y-3">
                  {course.upcomingDeadlines.slice(0, 4).map((assignment) => (
                    <AssignmentItem key={assignment.id} assignment={assignment} />
                  ))}
                  {course.upcomingDeadlines.length === 0 && (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {isTeacher ? "No assignments created yet. Create your first assignment!" : "No upcoming assignments"}
                      </p>
                    </Card>
                  )}
                  <Link href="/assignments">
                    <Button variant="outline" className="w-full">
                      View All Assignments
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Recent Grades */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Grades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.recentGrades.length > 0 ? (
                      <>
                        {course.recentGrades.slice(0, 3).map((grade) => (
                          <GradeItem key={grade.id} grade={grade} />
                        ))}
                        <Link href="/grades">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Grades
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No grades available yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.announcements.length > 0 ? (
                      <>
                    {course.announcements.slice(0, 3).map((announcement) => (
                      <AnnouncementCard key={announcement.id} announcement={announcement} />
                    ))}
                    {course.announcements.length > 3 && (
                      <Button variant="outline" size="sm" className="w-full">
                        View All Announcements
                      </Button>
                        )}
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No announcements yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                                 <CardContent className="space-y-3">
                   {isSupervisor && (
                     <div>
                       <Link href={`/courses/${courseId}/enroll`}>
                         <Button variant="default" className="w-full">
                           👥 Enroll Students
                         </Button>
                       </Link>
                     </div>
                   )}
                   <div>
                   <Button variant="default" className="w-full">
                     📧 Email Instructor
                   </Button>
                   </div>
                   <div>
                     <Link href="/assignments">
                       <Button variant="outline" className="w-full">
                         📝 Submit Assignment
                       </Button>
                     </Link>
                   </div>
                   <div>
                   <Button variant="outline" className="w-full">
                     📊 View Syllabus
                   </Button>
                   </div>
                   <div>
                   <Button variant="outline" className="w-full">
                     💬 Class Discussion
                   </Button>
                   </div>
                 </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Study Plan Management Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto border shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Study Plan</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowManageModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Create and manage weekly study plan for this course.
              </p>
              
              {/* Existing Weeks */}
              <div className="space-y-3">
                {editingWeeks.map((week, index) => (
                  <Card key={index} className="bg-white/50 dark:bg-gray-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">Week {week.week}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWeek(index)}
                              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          <textarea
                            className="w-full p-2 border rounded-md bg-white/70 dark:bg-gray-800/70 resize-none"
                            rows={3}
                            placeholder="Enter week description..."
                            value={week.description}
                            onChange={(e) => updateWeekDescription(index, e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Weekly Card */}
                <Card 
                  className="bg-white/30 dark:bg-gray-900/30 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-white/40 dark:hover:bg-gray-900/40 transition-colors cursor-pointer"
                  onClick={addWeek}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-blue-600 dark:text-blue-400">+</span>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Add Weekly</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Click to add a new week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowManageModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveStudyPlan}
                  disabled={saving || editingWeeks.length === 0}
                >
                  {saving ? 'Saving...' : 'Save Study Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveDrawer>
  )
}