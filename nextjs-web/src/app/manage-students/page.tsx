"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveDrawer } from "@/components/ui/drawer"
import { AppDrawerContent } from "@/components/AppDrawer"
import { AuthGuard } from "@/components/AuthGuard"
import { useAuth } from "@/lib/auth-context"
import { API } from "@/api"
import type { User, ResetPasswordDto } from "@/api/types"
import { UserRole } from "@/api/types"

export default function ManageStudents() {
  const { user } = useAuth()
  
  // Get supervisor's department from profile
  const supervisorDepartment = user?.profile?.department || "Computer Science"
  const [students, setStudents] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [resetingStudent, setResetingStudent] = useState<User | null>(null)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  
  // Form state for password reset
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: ""
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

  // Fetch students when component mounts or department changes
  useEffect(() => {
    if (supervisorDepartment) {
      fetchStudents()
    }
  }, [supervisorDepartment])

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      console.log('=== FETCHING STUDENTS FOR MANAGEMENT ===')
      console.log('Supervisor department:', supervisorDepartment)
      
      // Fetch all students first, then filter by major on frontend
      const response = await API.users.getUsers({
        role: UserRole.STUDENT
      })
      
      console.log('Students API response:', response)
      
      // Handle different response structures
      const studentsArray = response.users || []
      console.log('Students array:', studentsArray)
      console.log('Number of students found:', studentsArray.length)
      
      // Filter students by major matching supervisor's department
      const filteredStudents = studentsArray.filter(student => {
        const studentMajor = student.profile?.major
        const matches = studentMajor === supervisorDepartment
        console.log(`Student ${student.email}: major="${studentMajor}", supervisor dept="${supervisorDepartment}", matches=${matches}`)
        return matches
      })
      
      console.log('Students after filtering by major:', filteredStudents.length)
      console.log('Filtered students:', filteredStudents)
      
      setStudents(filteredStudents)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      setMessage({type: 'error', text: 'Failed to load students list'})
    } finally {
      setLoadingStudents(false)
    }
  }

  // Group students by grade
  const groupedStudents = students.reduce((groups, student) => {
    const grade = student.profile?.grade || 'Unassigned'
    if (!groups[grade]) {
      groups[grade] = []
    }
    groups[grade].push(student)
    return groups
  }, {} as Record<string, User[]>)

  // Sort grades (1, 2, 3, 4, then others)
  const sortedGrades = Object.keys(groupedStudents).sort((a, b) => {
    const gradeOrder = ['1', '2', '3', '4']
    const aIndex = gradeOrder.indexOf(a)
    const bIndex = gradeOrder.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    } else if (aIndex !== -1) {
      return -1
    } else if (bIndex !== -1) {
      return 1
    } else {
      return a.localeCompare(b)
    }
  })

  const handleResetPassword = (student: User) => {
    setResetingStudent(student)
    setResetForm({
      newPassword: "",
      confirmPassword: ""
    })
  }

  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setResetForm(prev => ({ ...prev, [name]: value }))
  }

  const generateSecurePassword = () => {
    // Generate a secure password with uppercase, lowercase, number, and special character
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*'
    
    // Ensure at least one character from each category
    let password = ''
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]
    
    // Fill the rest with random characters from all categories
    const allChars = uppercase + lowercase + numbers + special
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setResetForm({
      newPassword,
      confirmPassword: newPassword
    })
  }

  const handleSubmitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetingStudent) return

    // Basic validation
    if (!resetForm.newPassword || resetForm.newPassword.length < 8) {
      setMessage({type: 'error', text: 'Password must be at least 8 characters long'})
      return
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setMessage({type: 'error', text: 'Passwords do not match'})
      return
    }

    try {
      setIsResetting(true)
      const resetData: ResetPasswordDto = {
        newPassword: resetForm.newPassword
      }

      await API.auth.resetPassword(resetingStudent.id, resetData)
      setResetingStudent(null)
      setResetForm({ newPassword: "", confirmPassword: "" })
      setMessage({
        type: 'success', 
        text: `Password reset successfully for ${resetingStudent.profile?.firstName} ${resetingStudent.profile?.lastName}. New password: ${resetForm.newPassword}`
      })
    } catch (error) {
      console.error('Failed to reset password:', error)
      setMessage({type: 'error', text: 'Failed to reset password'})
    } finally {
      setIsResetting(false)
    }
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return
    }

    try {
      await API.users.deleteUser(studentId)
      await fetchStudents() // Refresh the list
      setMessage({type: 'success', text: 'Student deleted successfully'})
    } catch (error) {
      console.error('Failed to delete student:', error)
      setMessage({type: 'error', text: 'Failed to delete student'})
    }
  }

  // Teacher data from authentication context
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
    <AuthGuard requiredRoles={['SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Students</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage students in your department ({supervisorDepartment})
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

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {loadingStudents ? '...' : students.length}
                  </div>
                  <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Students</div>
                </CardContent>
              </Card>
              
              {['1', '2', '3', '4'].map(grade => (
                <Card key={grade} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {loadingStudents ? '...' : (groupedStudents[grade]?.length || 0)}
                    </div>
                    <div className="text-sm text-green-600/80 dark:text-green-400/80">Grade {grade}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Students by Grade */}
            {loadingStudents ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600 dark:text-slate-400">Loading students...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortedGrades.map(grade => (
                  <Card key={grade}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {grade === '1' ? '🎓' : grade === '2' ? '📚' : grade === '3' ? '🎯' : grade === '4' ? '👨‍🎓' : '❓'}
                        </span>
                        <span>
                          {grade === 'Unassigned' ? 'Unassigned Grade' : `Grade ${grade}`}
                        </span>
                        <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                          {groupedStudents[grade].length} students
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Name</th>
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Student ID</th>
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Major</th>
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Minor</th>
                              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedStudents[grade].map((student) => (
                              <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {student.profile?.firstName} {student.profile?.lastName}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                    {student.email}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">
                                    {student.profile?.studentId || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {student.profile?.major || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {student.profile?.minor || 'None'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResetPassword(student)}
                                      className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                    >
                                      🔑 Reset Password
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteStudent(
                                        student.id, 
                                        `${student.profile?.firstName} ${student.profile?.lastName}`
                                      )}
                                      className="text-xs px-3 py-1"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {students.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-slate-500 dark:text-slate-400">
                        <div className="text-4xl mb-4">🎓</div>
                        <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                        <p className="text-sm">No students are registered in your department yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Reset Password Modal */}
          {resetingStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🔑</span>
                    <span>Reset Password</span>
                  </CardTitle>
                  <CardDescription>
                    Reset password for {resetingStudent.profile?.firstName} {resetingStudent.profile?.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="text"
                        placeholder="Enter new password (min 8 characters)"
                        value={resetForm.newPassword}
                        onChange={handleResetFormChange}
                        required
                        minLength={8}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="text"
                        placeholder="Confirm new password"
                        value={resetForm.confirmPassword}
                        onChange={handleResetFormChange}
                        required
                        minLength={8}
                        className="font-mono"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeneratePassword}
                        className="text-sm"
                      >
                        🎲 Generate Secure Password
                      </Button>
                    </div>

                    {resetForm.newPassword && resetForm.confirmPassword && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {resetForm.newPassword === resetForm.confirmPassword ? (
                            <span className="flex items-center">
                              <span className="text-green-600 mr-2">✅</span>
                              Passwords match
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <span className="text-red-600 mr-2">❌</span>
                              Passwords do not match
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setResetingStudent(null)}
                    disabled={isResetting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitPasswordReset}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isResetting || !resetForm.newPassword || resetForm.newPassword !== resetForm.confirmPassword}
                  >
                    {isResetting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
}