"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/AuthGuard"

interface Grade {
  id: string
  assignmentTitle: string
  score: number
  maxPoints: number
  letterGrade: string
  gradedDate: string
  courseName?: string
  courseCode?: string
  assignmentType?: string
}

interface StudentGrades {
  studentId: string
  grades: Grade[]
  overallGPA?: number
  totalCredits?: number
}

export default function GradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<StudentGrades | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine user type and data based on authentication
  const userType = user?.role === 'STUDENT' ? 'student' : 'teacher'
  const userData = {
    name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Loading...",
    email: user?.email || ""
  }

  // Fetch grades from API
  useEffect(() => {
    const fetchGrades = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/grades/student/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch grades: ${response.status}`)
        }

        const data = await response.json()
        console.log('📥 Raw Grades API Response:', data)
        
        setGrades(data)
      } catch (err) {
        console.error('❌ Error fetching grades:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch grades')
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [user?.id])

  const drawerContent = (
    <AppDrawerContent 
      userType={userType}
      userData={userData}
    />
  )

  // Process grades data from API
  const gradesList = grades?.grades || []
  
  // Group grades by course for display
  const courseGroups = gradesList.reduce((groups, grade) => {
    const courseKey = grade.courseName || 'Unknown Course'
    if (!groups[courseKey]) {
      groups[courseKey] = {
        name: grade.courseName || 'Unknown Course',
        code: grade.courseCode || 'N/A',
        grades: []
      }
    }
    groups[courseKey].grades.push(grade)
    return groups
  }, {} as Record<string, { name: string; code: string; grades: Grade[] }>)

  const courses = Object.values(courseGroups).map((course, index) => ({
    id: index + 1,
    name: course.name,
    code: course.code,
    teacher: "Instructor", // Will be updated when API provides teacher info
    currentGrade: course.grades.length > 0 ? course.grades[course.grades.length - 1].letterGrade : "N/A",
    gpa: 3.5, // Will be calculated when API provides GPA data
    credits: 3, // Will be updated when API provides credits info
    grades: course.grades.map(grade => ({
      assignment: grade.assignmentTitle,
      score: grade.score,
      maxScore: grade.maxPoints,
      date: grade.gradedDate,
      type: grade.assignmentType || 'assignment'
    }))
  }))

  const overallGPA = grades?.overallGPA || 3.5
  const totalCredits = grades?.totalCredits || courses.length * 3

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A+":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
      case "A-":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      case "B+":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      case "B":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
      case "B-":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
      case "C+":
      case "C":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
      default:
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "homework": return "📝"
      case "quiz": return "❓"
      case "exam": return "📋"
      case "lab": return "🔬"
      case "essay": return "✍️"
      case "project": return "📊"
      case "presentation": return "🎤"
      case "participation": return "💬"
      default: return "📄"
    }
  }

  // Show loading state
  if (loading) {
    return (
      <AuthGuard requiredRoles={['STUDENT', 'TEACHER', 'SUPERVISOR_TEACHER']}>
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading grades...</p>
            </div>
          </div>
        </ResponsiveDrawer>
      </AuthGuard>
    )
  }

  // Show error state
  if (error) {
    return (
      <AuthGuard requiredRoles={['STUDENT', 'TEACHER', 'SUPERVISOR_TEACHER']}>
        <ResponsiveDrawer drawerContent={drawerContent}>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold mb-2">Error Loading Grades</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveDrawer>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRoles={['STUDENT', 'TEACHER', 'SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                📊 {userType === 'student' ? 'Grades & Performance' : 'Class Grades Overview'}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {userType === 'student' ? 'Track your academic progress and performance' : 'Monitor student grades and class performance'}
              </p>
            </div>

          {/* Overall Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <span>🎯</span>
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{overallGPA}</div>
                    <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Cumulative GPA</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {totalCredits} credit hours completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Top 15%</div>
                    <div className="text-xs text-blue-600/80 dark:text-blue-400/80">Class Ranking</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dean's List</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{courses.filter(c => c.currentGrade.startsWith('A')).length}</div>
                <div className="text-sm text-green-600/80 dark:text-green-400/80">A Grades</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Excellent work</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{courses.length}</div>
                <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Courses</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">This semester</div>
              </CardContent>
            </Card>
          </div>

          {/* Course Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="h-fit">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span>{course.code}</span>
                        <span>•</span>
                        <span>{course.teacher}</span>
                        <span>•</span>
                        <span>{course.credits} credits</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 text-sm font-semibold rounded-lg ${getGradeColor(course.currentGrade)}`}>
                        {course.currentGrade}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {course.gpa} GPA
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recent Assignments</div>
                    {course.grades.slice(-3).map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm">{getTypeIcon(grade.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {grade.assignment}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {grade.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {grade.score}/{grade.maxScore}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {Math.round((grade.score / grade.maxScore) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View All {course.grades.length} Assignments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grade Trends */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📈</span>
                <span>Grade Trends & Insights</span>
              </CardTitle>
              <CardDescription>
                Your academic performance analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-600 dark:text-green-400">📊</span>
                    <span className="font-medium text-green-700 dark:text-green-300">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    You're excelling in English Literature with consistent A grades. Keep up the excellent work!
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">Improvement Area</span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Consider spending more time on World History assignments to boost your grade from B to B+.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-600 dark:text-blue-400">🎯</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">Goal Progress</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You're on track to achieve a 3.8+ GPA this semester. Maintain current performance!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveDrawer>
    </AuthGuard>
  )
}