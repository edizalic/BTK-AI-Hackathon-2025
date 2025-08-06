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
import type { CreateStudentDto, CreateTeacherDto } from "@/api/types"
import { UserRole } from "@/api/types"

export default function TeacherDashboard() {
  const { user } = useAuth()
  
  // Get supervisor's department from profile
  const supervisorDepartment = user?.profile?.department || "Computer Science" // Default department
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    grade: "",
    major: supervisorDepartment,
    minor: "",
    enrollmentDate: "",
    advisoryTeacherId: ""
  })
  const [newTeacher, setNewTeacher] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: supervisorDepartment,
    position: "",
    employeeId: "",
    hireDate: "",
    specialization: [] as string[],
    officeLocation: "",
    officeHours: "",
    isSupervisor: false
  })
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState<'student' | 'teacher'>('student')
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Auto-clear messages after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Update teacher department and student major when supervisor's department changes
  useEffect(() => {
    if (supervisorDepartment) {
      setNewTeacher(prev => ({ ...prev, department: supervisorDepartment }))
      setNewStudent(prev => ({ ...prev, major: supervisorDepartment }))
    }
  }, [supervisorDepartment])

  // Fetch students and teachers when component mounts or department changes
  useEffect(() => {
    if (supervisorDepartment) {
      fetchStudents()
      fetchTeachers()
    }
  }, [supervisorDepartment])

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true)
      console.log('=== FETCHING STUDENTS ===')
      console.log('Supervisor department:', supervisorDepartment)
      
      // Try fetching all students first, then filter by major on frontend
      const response = await API.users.getUsers({
        role: UserRole.STUDENT
        // Removing department filter temporarily to see all students
      })
      
      console.log('Students API response:', response)
      console.log('Response structure keys:', Object.keys(response))
      
      // Handle different response structures
      const studentsArray = response.users || response.data || []
      console.log('Students array:', studentsArray)
      console.log('Number of students found:', studentsArray.length)
      
      // Log each student's profile to debug filtering
      studentsArray.forEach((student, index) => {
        console.log(`Student ${index}:`, {
          id: student.id,
          email: student.email,
          profile: student.profile,
          major: student.profile?.major
        })
      })
      
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

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      console.log('=== FETCHING TEACHERS ===')
      console.log('Supervisor department:', supervisorDepartment)
      
      // Try fetching all teachers first, then filter by department on frontend
      const response = await API.users.getUsers({
        role: UserRole.TEACHER
        // Removing department filter temporarily to see all teachers
      })
      
      console.log('Teachers API response:', response)
      console.log('Response structure keys:', Object.keys(response))
      
      // Handle different response structures
      const teachersArray = response.users || response.data || []
      console.log('Teachers array:', teachersArray)
      console.log('Number of teachers found:', teachersArray.length)
      
      // Log each teacher's profile to debug filtering
      teachersArray.forEach((teacher, index) => {
        console.log(`Teacher ${index}:`, {
          id: teacher.id,
          email: teacher.email,
          profile: teacher.profile,
          department: teacher.profile?.department
        })
      })
      
      // Filter teachers by department matching supervisor's department
      const filteredTeachers = teachersArray.filter(teacher => {
        const teacherDepartment = teacher.profile?.department
        const matches = teacherDepartment === supervisorDepartment
        console.log(`Teacher ${teacher.email}: dept="${teacherDepartment}", supervisor dept="${supervisorDepartment}", matches=${matches}`)
        return matches
      })
      
      console.log('Teachers after filtering by department:', filteredTeachers.length)
      console.log('Filtered teachers:', filteredTeachers)
      
      setTeachers(filteredTeachers)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
      setMessage({type: 'error', text: 'Failed to load teachers list'})
    } finally {
      setLoadingTeachers(false)
    }
  }

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewStudent(prev => ({ ...prev, [name]: value }))
  }

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = 'checked' in e.target ? e.target.checked : false
    
    if (name === 'specialization') {
      // Handle comma-separated specializations
      const specializationArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      setNewTeacher(prev => ({ 
        ...prev, 
        [name]: specializationArray
      }))
    } else if (name === 'hireDate' && value) {
      // Convert date to ISO string
      setNewTeacher(prev => ({ 
        ...prev, 
        [name]: new Date(value).toISOString()
      }))
    } else {
      setNewTeacher(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }))
    }
  }

  const generatePassword = () => {
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingStudent(true)
    
    try {
      // Basic validation
      if (!newStudent.firstName || !newStudent.lastName || !newStudent.email || !newStudent.studentId) {
        setMessage({type: 'error', text: 'Please fill in all required fields (First Name, Last Name, Email, Student ID)'})
        setIsLoadingStudent(false)
        return
      }

      const password = newStudent.password || generatePassword()
      
      // Debug logging for enrollment date
      console.log('=== ENROLLMENT DATE DEBUG ===')
      console.log('newStudent.enrollmentDate (raw):', newStudent.enrollmentDate)
      console.log('newStudent.enrollmentDate type:', typeof newStudent.enrollmentDate)
      console.log('newStudent.enrollmentDate length:', newStudent.enrollmentDate?.length)
      console.log('newStudent.enrollmentDate trimmed:', newStudent.enrollmentDate?.trim())
      console.log('Current date ISO:', new Date().toISOString())
      
      // Create enrollment date - ensure it's a proper ISO string
      let finalEnrollmentDate: string
      if (newStudent.enrollmentDate && newStudent.enrollmentDate.trim() !== '') {
        // If user provided a date, ensure it's properly formatted
        try {
          finalEnrollmentDate = new Date(newStudent.enrollmentDate).toISOString()
        } catch (error) {
          console.warn('Invalid date provided, using current date:', error)
          finalEnrollmentDate = new Date().toISOString()
        }
      } else {
        // Use current date, but set time to start of day to match backend expectation
        const now = new Date()
        finalEnrollmentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      }
      
      console.log('Final enrollment date to send:', finalEnrollmentDate)
      console.log('Final enrollment date type:', typeof finalEnrollmentDate)
    
            const studentData: CreateStudentDto = {
        email: newStudent.email,
        password: password,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
        studentId: newStudent.studentId,
        // Temporarily removing enrollmentDate to test if it's the issue
        // enrollmentDate: finalEnrollmentDate,
        ...(newStudent.grade && newStudent.grade.trim() !== '' && { grade: newStudent.grade }),
        ...(newStudent.major && newStudent.major.trim() !== '' && { major: newStudent.major }),
        ...(newStudent.minor && newStudent.minor.trim() !== '' && { minor: newStudent.minor }),
        ...(newStudent.advisoryTeacherId && newStudent.advisoryTeacherId.trim() !== '' && { advisoryTeacherId: newStudent.advisoryTeacherId })
      }
      
      console.log('=== COMPLETE REQUEST PAYLOAD ===')
      console.log('Creating student with data:', JSON.stringify(studentData, null, 2))
      const createdStudent = await API.users.createStudent(studentData)
      
      // Refresh the students list
      await fetchStudents()
      setNewStudent({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        studentId: "",
        grade: "",
        major: supervisorDepartment,
        minor: "",
        enrollmentDate: "",
        advisoryTeacherId: ""
      })
      
      setMessage({type: 'success', text: `Student ${newStudent.firstName} ${newStudent.lastName} created successfully! Password: ${password}`})
    } catch (error) {
      console.error('Failed to create student:', error)
      
      // Enhanced error handling for API errors
      let errorMessage = 'Unknown error'
      if (error && typeof error === 'object' && 'message' in error) {
        // Handle ApiError from our API wrapper
        const apiError = error as any
        if (Array.isArray(apiError.message)) {
          errorMessage = apiError.message.join(', ')
        } else if (typeof apiError.message === 'string') {
          errorMessage = apiError.message
        } else {
          errorMessage = apiError.error || 'API Error'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle other error formats
        if ('response' in error && error.response) {
          const response = error.response as any
          if (response.data && response.data.message) {
            errorMessage = Array.isArray(response.data.message) 
              ? response.data.message.join(', ')
              : response.data.message
          } else if (response.statusText) {
            errorMessage = `${response.status}: ${response.statusText}`
          }
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      setMessage({type: 'error', text: `Failed to create student: ${errorMessage}`})
    } finally {
      setIsLoadingStudent(false)
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingTeacher(true)
    
    try {
      // Basic validation
      if (!newTeacher.firstName || !newTeacher.lastName || !newTeacher.email || !newTeacher.employeeId || !newTeacher.department || newTeacher.specialization.length === 0) {
        setMessage({type: 'error', text: 'Please fill in all required fields (First Name, Last Name, Email, Employee ID, Department, Specializations)'})
        setIsLoadingTeacher(false)
        return
      }

      const password = newTeacher.password || generatePassword()
      
      const teacherData: CreateTeacherDto = {
        email: newTeacher.email,
        password: password,
        firstName: newTeacher.firstName,
        lastName: newTeacher.lastName,
        department: newTeacher.department,
        specialization: newTeacher.specialization,
        employeeId: newTeacher.employeeId,
        ...(newTeacher.position && newTeacher.position.trim() !== '' && { position: newTeacher.position })
        // Removed hireDate to match working student registration logic
      }
      
      console.log('Creating teacher with data:', teacherData)
      const createdTeacher = newTeacher.isSupervisor 
        ? await API.users.createSupervisor(teacherData)
        : await API.users.createTeacher(teacherData)
      
      // Refresh the teachers list
      await fetchTeachers()
      setNewTeacher({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: supervisorDepartment,
        position: "",
        employeeId: "",
        hireDate: "",
        specialization: [],
        officeLocation: "",
        officeHours: "",
        isSupervisor: false
      })
      
      setMessage({type: 'success', text: `${newTeacher.isSupervisor ? 'Supervisor' : 'Teacher'} ${newTeacher.firstName} ${newTeacher.lastName} created successfully! Password: ${password}`})
    } catch (error) {
      console.error('Failed to create teacher:', error)
      
      // Enhanced error handling for API errors
      let errorMessage = 'Unknown error'
      if (error && typeof error === 'object' && 'message' in error) {
        // Handle ApiError from our API wrapper
        const apiError = error as any
        if (Array.isArray(apiError.message)) {
          errorMessage = apiError.message.join(', ')
        } else if (typeof apiError.message === 'string') {
          errorMessage = apiError.message
        } else {
          errorMessage = apiError.error || 'API Error'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle other error formats
        if ('response' in error && error.response) {
          const response = error.response as any
          if (response.data && response.data.message) {
            errorMessage = Array.isArray(response.data.message) 
              ? response.data.message.join(', ')
              : response.data.message
          } else if (response.statusText) {
            errorMessage = `${response.status}: ${response.statusText}`
          }
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      setMessage({type: 'error', text: `Failed to create teacher: ${errorMessage}`})
    } finally {
      setIsLoadingTeacher(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await API.users.deleteUser(studentId)
      await fetchStudents() // Refresh the list
      setMessage({type: 'success', text: 'Student deleted successfully'})
    } catch (error) {
      console.error('Failed to delete student:', error)
      setMessage({type: 'error', text: `Failed to delete student: ${error instanceof Error ? error.message : 'Unknown error'}`})
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      await API.users.deleteUser(teacherId)
      await fetchTeachers() // Refresh the list
      setMessage({type: 'success', text: 'Teacher deleted successfully'})
    } catch (error) {
      console.error('Failed to delete teacher:', error)
      setMessage({type: 'error', text: `Failed to delete teacher: ${error instanceof Error ? error.message : 'Unknown error'}`})
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Registration Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-300">Register and manage student and teacher accounts (Supervisor Teachers only)</p>
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

        {/* Accordion for Registration Types */}
        <div className="space-y-4">
          {/* Student Registration Accordion */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setActiveAccordion(activeAccordion === 'student' ? 'teacher' : 'student')}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>🎓</span>
                  <span>Register Student</span>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {loadingStudents ? '...' : students.length} registered
                  </span>
                </div>
                <div className="transform transition-transform">
                  {activeAccordion === 'student' ? '▼' : '▶'}
                </div>
              </CardTitle>
                          <CardDescription>
                Add new students to the system with auto-generated secure passwords
            </CardDescription>
            </CardHeader>
            
            {activeAccordion === 'student' && (
              <CardContent className="border-t">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                  {/* Create New Student Form */}
                                    <div>
                    <form onSubmit={handleCreateStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                          <Label htmlFor="student-firstName">First Name</Label>
                    <Input
                            id="student-firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={newStudent.firstName}
                            onChange={handleStudentChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                          <Label htmlFor="student-lastName">Last Name</Label>
                    <Input
                            id="student-lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={newStudent.lastName}
                            onChange={handleStudentChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                        <Label htmlFor="student-email">Student Email</Label>
                  <Input
                          id="student-email"
                    name="email"
                    type="email"
                          placeholder="jane.doe@student.edu"
                    value={newStudent.email}
                          onChange={handleStudentChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-studentId">Student ID</Label>
                          <Input
                            id="student-studentId"
                            name="studentId"
                            type="text"
                            placeholder="STU20240001"
                            value={newStudent.studentId}
                            onChange={handleStudentChange}
                    required
                  />
                </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-grade">Grade</Label>
                          <select
                            id="student-grade"
                            name="grade"
                            value={newStudent.grade}
                            onChange={handleStudentChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select Grade</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-major">Major</Label>
                          <Input
                            id="student-major"
                            name="major"
                            type="text"
                            placeholder="Computer Science"
                            value={newStudent.major || supervisorDepartment}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                            title="Major is automatically set from supervisor's department"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            📍 Automatically set from your department
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-minor">Minor</Label>
                          <Input
                            id="student-minor"
                            name="minor"
                            type="text"
                            placeholder="Mathematics"
                            value={newStudent.minor}
                            onChange={handleStudentChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-password">Password (optional - auto-generated if empty)</Label>
                        <Input
                          id="student-password"
                          name="password"
                          type="password"
                          placeholder="Leave empty for auto-generated password"
                          value={newStudent.password}
                          onChange={handleStudentChange}
                        />
                      </div>
              
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isLoadingStudent}
                >
                        {isLoadingStudent ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Student...</span>
                    </div>
                  ) : (
                    "Create Student Account"
                  )}
                </Button>
            </form>
                  </div>

          {/* Students Overview */}
                  <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Students Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {loadingStudents ? '...' : students.length}
                        </div>
                        <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Students</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {loadingStudents ? '...' : students.length}
                        </div>
                        <div className="text-sm text-green-600/80 dark:text-green-400/80">In Department</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Teacher Registration Accordion */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setActiveAccordion(activeAccordion === 'teacher' ? 'student' : 'teacher')}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>👩‍🏫</span>
                  <span>Register Teacher</span>
                  <span className="text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    {loadingTeachers ? '...' : teachers.length} registered
                  </span>
                </div>
                <div className="transform transition-transform">
                  {activeAccordion === 'teacher' ? '▼' : '▶'}
                </div>
              </CardTitle>
              <CardDescription>
                Add new teachers to the system with supervisor privileges option
              </CardDescription>
            </CardHeader>
            
            {activeAccordion === 'teacher' && (
              <CardContent className="border-t">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                  {/* Create New Teacher Form */}
                  <div>
                    <form onSubmit={handleCreateTeacher} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher-firstName">First Name</Label>
                          <Input
                            id="teacher-firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            value={newTeacher.firstName}
                            onChange={handleTeacherChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher-lastName">Last Name</Label>
                          <Input
                            id="teacher-lastName"
                            name="lastName"
                            type="text"
                            placeholder="Smith"
                            value={newTeacher.lastName}
                            onChange={handleTeacherChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="teacher-email">Teacher Email</Label>
                        <Input
                          id="teacher-email"
                          name="email"
                          type="email"
                          placeholder="john.smith@teacher.edu"
                          value={newTeacher.email}
                          onChange={handleTeacherChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher-employeeId">Employee ID</Label>
                          <Input
                            id="teacher-employeeId"
                            name="employeeId"
                            type="text"
                            placeholder="EMP20240001"
                            value={newTeacher.employeeId}
                            onChange={handleTeacherChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher-department">Department</Label>
                          <Input
                            id="teacher-department"
                            name="department"
                            type="text"
                            placeholder="Computer Science"
                            value={newTeacher.department || supervisorDepartment}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                            title="Department is automatically set from supervisor's profile"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            📍 Automatically set from your department
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher-position">Position</Label>
                          <Input
                            id="teacher-position"
                            name="position"
                            type="text"
                            placeholder="Assistant Professor"
                            value={newTeacher.position}
                            onChange={handleTeacherChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher-hireDate">Hire Date</Label>
                          <Input
                            id="teacher-hireDate"
                            name="hireDate"
                            type="date"
                            value={newTeacher.hireDate ? newTeacher.hireDate.split('T')[0] : ''}
                            onChange={handleTeacherChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-specialization">Specializations (comma-separated)</Label>
                        <Input
                          id="teacher-specialization"
                          name="specialization"
                          type="text"
                          placeholder="Data Structures, Algorithms, Web Development"
                          value={newTeacher.specialization.join(', ')}
                          onChange={handleTeacherChange}
                          required
                        />
                      </div>

              <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacher-officeLocation">Office Location</Label>
                          <Input
                            id="teacher-officeLocation"
                            name="officeLocation"
                            type="text"
                            placeholder="Building A, Room 205"
                            value={newTeacher.officeLocation}
                            onChange={handleTeacherChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teacher-officeHours">Office Hours</Label>
                          <Input
                            id="teacher-officeHours"
                            name="officeHours"
                            type="text"
                            placeholder="Mon-Wed-Fri 2:00-4:00 PM"
                            value={newTeacher.officeHours}
                            onChange={handleTeacherChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-password">Password (optional - auto-generated if empty)</Label>
                        <Input
                          id="teacher-password"
                          name="password"
                          type="password"
                          placeholder="Leave empty for auto-generated password"
                          value={newTeacher.password}
                          onChange={handleTeacherChange}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          id="teacher-supervisor"
                          name="isSupervisor"
                          type="checkbox"
                          checked={newTeacher.isSupervisor}
                          onChange={handleTeacherChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <Label htmlFor="teacher-supervisor" className="text-sm font-medium">
                          Grant Supervisor Privileges
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoadingTeacher}
                      >
                        {isLoadingTeacher ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating Teacher...</span>
                          </div>
                        ) : (
                          "Create Teacher Account"
                        )}
                      </Button>
                    </form>
                </div>

                  {/* Teachers Overview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Teachers Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {loadingTeachers ? '...' : teachers.length}
                        </div>
                        <div className="text-sm text-green-600/80 dark:text-green-400/80">Total Teachers</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {loadingTeachers ? '...' : teachers.filter(t => t.role === 'SUPERVISOR_TEACHER').length}
                        </div>
                        <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Supervisors</div>
                      </div>
                    </div>
                </div>
              </div>
            </CardContent>
            )}
          </Card>
        </div>

        {/* User Accounts Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        {/* Students List */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
                <span>🎓</span>
              <span>Student Accounts</span>
            </CardTitle>
            <CardDescription>
                Manage existing student accounts. Share credentials with students for login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Name</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Email</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Student ID</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading students...</span>
                          </div>
                        </td>
                      </tr>
                    ) : students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-2 text-sm">
                            {student.profile?.firstName} {student.profile?.lastName}
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                          {student.email}
                        </span>
                      </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">
                              {student.profile?.studentId || 'N/A'}
                        </span>
                      </td>
                          <td className="py-2 px-2">
                        <Button
                          variant="destructive"
                          size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-xs px-2 py-1"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                      ))
                    ) : (
                    <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No students in your department yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

          {/* Teachers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>👩‍🏫</span>
                <span>Teacher Accounts</span>
              </CardTitle>
              <CardDescription>
                Manage existing teacher accounts and their supervisor privileges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Name</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Email</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Role</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Employee ID</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-900 dark:text-slate-100 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTeachers ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading teachers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-2 text-sm">
                            {teacher.profile?.firstName} {teacher.profile?.lastName}
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                              {teacher.email}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              teacher.role === 'SUPERVISOR_TEACHER'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                            }`}>
                              {teacher.role === 'SUPERVISOR_TEACHER' ? 'Supervisor' : 'Teacher'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">
                              {teacher.profile?.employeeId || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="text-xs px-2 py-1"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                          No teachers in your department yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <span>ℹ️</span>
              <span>Instructions for Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the login page and select "Student Login" (default tab)</li>
              <li>Enter the student email address provided by your teacher</li>
              <li>Enter the password provided by your teacher</li>
              <li>Click "Access Student Portal" to login</li>
            </ol>
            <p className="mt-4 text-sm">
              <strong>Note:</strong> Students cannot register themselves. Only supervisor teachers can create student accounts.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </ResponsiveDrawer>
    </AuthGuard>
  )
}