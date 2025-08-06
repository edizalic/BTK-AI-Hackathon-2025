/**
 * API Usage Examples
 * This file contains examples of how to use the various API services
 * DO NOT import this file in production code - it's for reference only
 */

import { API, TokenManager, APIDev, APIStatus } from './index'
import type { LoginDto, CreateStudentDto, CreateCourseDto } from './types'
import { UserRole, CourseLevel, AssignmentType, AssignmentStatus, NotificationPriority } from './types'

/**
 * Authentication Examples
 */
export class AuthExamples {
  // Login and token management
  static async loginExample() {
    try {
      const credentials: LoginDto = {
        email: 'student@school.edu',
        password: 'password123'
      }

      // Login user
      const loginResponse = await API.auth.login(credentials)
      
      // Store tokens automatically handled by interceptor
      TokenManager.storeTokens(loginResponse)
      
      console.log('✅ Login successful:', loginResponse.user)
      
      // Get current user profile
      const profile = await API.auth.getProfile()
      console.log('👤 User profile:', profile)
      
      // Check authentication status
      console.log('🔐 Is authenticated:', TokenManager.isAuthenticated())
      console.log('👑 User role:', TokenManager.getUser()?.role)
      console.log('🏫 Is supervisor:', TokenManager.isSupervisor())
      
    } catch (error) {
      console.error('❌ Login failed:', error)
    }
  }

  // Logout
  static async logoutExample() {
    try {
      await API.auth.logout()
      TokenManager.clearTokens()
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout failed:', error)
    }
  }

  // Change password
  static async changePasswordExample() {
    try {
      await API.auth.changePassword({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      })
      console.log('✅ Password changed successfully')
    } catch (error) {
      console.error('❌ Password change failed:', error)
    }
  }
}

/**
 * Users Management Examples
 */
export class UsersExamples {
  // Create a new student (supervisor only)
  static async createStudentExample() {
    try {
      const studentData: CreateStudentDto = {
        email: 'newstudent@school.edu',
        password: 'initialPassword123',
        firstName: 'John',
        lastName: 'Doe',
        studentId: 'STD2024001',
        grade: '10',
        major: 'Computer Science'
      }

      const newStudent = await API.users.createStudent(studentData)
      console.log('✅ Student created:', newStudent)
    } catch (error) {
      console.error('❌ Student creation failed:', error)
    }
  }

  // Get all users with filtering
  static async getUsersExample() {
    try {
      const response = await API.users.getUsers({
        role: UserRole.STUDENT,
        isActive: true,
        search: 'john',
        limit: 10,
        offset: 0
      })
      
      console.log('📋 Users:', response.users)
      console.log('📊 Total:', response.total)
    } catch (error) {
      console.error('❌ Failed to fetch users:', error)
    }
  }

  // Assign advisory teacher
  static async assignAdvisoryExample() {
    try {
      await API.users.assignAdvisoryTeacher('student-id', {
        advisoryTeacherId: 'teacher-id',
        notes: 'Assigned based on academic performance'
      })
      console.log('✅ Advisory teacher assigned')
    } catch (error) {
      console.error('❌ Advisory assignment failed:', error)
    }
  }
}

/**
 * Courses Management Examples
 */
export class CoursesExamples {
  // Create a new course (supervisor only)
  static async createCourseExample() {
    try {
      const courseData: CreateCourseDto = {
        code: 'CS101',
        name: 'Introduction to Programming',
        description: 'Learn basic programming concepts',
        credits: 3,
        scheduleDays: ['monday', 'wednesday', 'friday'],
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room 101',
        instructorId: 'teacher-id',
        semester: 'Fall',
        year: 2024,
        capacity: 30,
        category: 'Computer Science',
        departmentId: 'dept-cs',
        level: CourseLevel.BEGINNER,
        startDate: '2024-09-01',
        endDate: '2024-12-15'
      }

      const newCourse = await API.courses.createCourse(courseData)
      console.log('✅ Course created:', newCourse)
    } catch (error) {
      console.error('❌ Course creation failed:', error)
    }
  }

  // Get student's enrolled courses
  static async getStudentCoursesExample() {
    try {
      const response = await API.courses.getStudentCourses()
      console.log('📚 My courses:', response.enrollments)
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error)
    }
  }

  // Enroll student in course
  static async enrollStudentExample() {
    try {
      const enrollment = await API.courses.enrollStudent('course-id', {
        studentId: 'student-id'
      })
      console.log('✅ Student enrolled:', enrollment)
    } catch (error) {
      console.error('❌ Enrollment failed:', error)
    }
  }
}

/**
 * Assignments Examples
 */
export class AssignmentsExamples {
  // Create assignment
  static async createAssignmentExample() {
    try {
      const assignment = await API.assignments.createAssignment({
        courseId: 'course-id',
        title: 'Programming Assignment 1',
        description: 'Create a simple calculator program',
        type: AssignmentType.HOMEWORK,
        dueDate: '2024-02-15T23:59:59Z',
        maxPoints: 100,
        isGroupWork: false
      })
      console.log('✅ Assignment created:', assignment)
    } catch (error) {
      console.error('❌ Assignment creation failed:', error)
    }
  }

  // Submit assignment
  static async submitAssignmentExample() {
    try {
      const submission = await API.assignments.submitAssignment('assignment-id', {
        content: 'Here is my solution...',
        fileIds: ['file-id-1', 'file-id-2'],
        notes: 'I had some trouble with the last part'
      })
      console.log('✅ Assignment submitted:', submission)
    } catch (error) {
      console.error('❌ Assignment submission failed:', error)
    }
  }

  // Get student assignments
  static async getStudentAssignmentsExample() {
    try {
      const response = await API.assignments.getStudentAssignments(undefined, {
        status: AssignmentStatus.ASSIGNED,
        courseId: 'course-id',
        limit: 20
      })
      console.log('📝 My assignments:', response.assignments)
    } catch (error) {
      console.error('❌ Failed to fetch assignments:', error)
    }
  }
}

/**
 * Grades Examples
 */
export class GradesExamples {
  // Create grade
  static async createGradeExample() {
    try {
      const grade = await API.grades.createGrade({
        studentId: 'student-id',
        assignmentId: 'assignment-id',
        submissionId: 'submission-id',
        letterGrade: 'A',
        score: 95,
        maxPoints: 100,
        feedback: 'Excellent work! Well structured and clean code.',
        isExtraCredit: false
      })
      console.log('✅ Grade created:', grade)
    } catch (error) {
      console.error('❌ Grade creation failed:', error)
    }
  }

  // Get student grades
  static async getMyGradesExample() {
    try {
      const response = await API.grades.getMyGrades({
        courseId: 'course-id',
        semester: 'Fall',
        year: 2024
      })
      console.log('📊 My grades:', response.grades)
    } catch (error) {
      console.error('❌ Failed to fetch grades:', error)
    }
  }

  // Generate grade report
  static async generateGradeReportExample() {
    try {
      const report = await API.grades.getMyGradeReport({
        semester: 'Fall',
        year: 2024,
        includeTranscript: true
      })
      console.log('📋 Grade report:', report)
      console.log('🎯 Overall GPA:', report.gpa.overall)
    } catch (error) {
      console.error('❌ Failed to generate report:', error)
    }
  }
}

/**
 * File Upload Examples
 */
export class FilesExamples {
  // Upload file with progress
  static async uploadFileExample(file: File) {
    try {
      const uploadResult = await API.files.uploadFile(file, {
        description: 'Assignment submission',
        folder: 'assignments',
        onProgress: (progress) => {
          console.log(`📤 Upload progress: ${progress}%`)
        }
      })
      console.log('✅ File uploaded:', uploadResult)
      return uploadResult.id
    } catch (error) {
      console.error('❌ File upload failed:', error)
    }
  }

  // Download file
  static async downloadFileExample(fileId: string) {
    try {
      const blob = await API.files.downloadFile(fileId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'downloaded-file'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('✅ File downloaded')
    } catch (error) {
      console.error('❌ File download failed:', error)
    }
  }

  // Get file metadata
  static async getFileMetadataExample(fileId: string) {
    try {
      const fileInfo = await API.files.getFileMetadata(fileId)
      console.log('📄 File info:', fileInfo)
      console.log('📏 File size:', API.files.formatFileSize(Number(fileInfo.fileSize)))
      console.log('🗂️ File icon:', API.files.getFileIcon(fileInfo.mimeType))
    } catch (error) {
      console.error('❌ Failed to get file info:', error)
    }
  }
}

/**
 * Notifications Examples
 */
export class NotificationsExamples {
  // Get notifications
  static async getNotificationsExample() {
    try {
      const response = await API.notifications.getMyNotifications({
        isRead: false,
        limit: 10,
        priority: NotificationPriority.HIGH
      })
      
      console.log('🔔 Notifications:', response.notifications)
      console.log('📊 Unread count:', response.unreadCount)
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error)
    }
  }

  // Mark notifications as read
  static async markNotificationsReadExample() {
    try {
      await API.notifications.markAllAsRead()
      console.log('✅ All notifications marked as read')
    } catch (error) {
      console.error('❌ Failed to mark as read:', error)
    }
  }

  // Send course announcement
  static async sendAnnouncementExample() {
    try {
      const result = await API.notifications.sendCourseAnnouncement('course-id', {
        title: 'Important: Exam Schedule Change',
        message: 'The midterm exam has been moved to next Friday at 2 PM.',
        priority: NotificationPriority.HIGH
      })
      console.log('✅ Announcement sent to', result.sent, 'students')
    } catch (error) {
      console.error('❌ Failed to send announcement:', error)
    }
  }
}

/**
 * Comprehensive Example: Student Dashboard Data
 */
export class DashboardExamples {
  static async loadStudentDashboard() {
    try {
      console.log('🔄 Loading student dashboard...')
      
      // Load data in parallel for better performance
      const [
        profile,
        courses,
        assignments,
        grades,
        notifications
      ] = await Promise.all([
        API.auth.getProfile(),
        API.courses.getStudentCourses(),
        API.assignments.getStudentAssignments(undefined, { limit: 5 }),
        API.grades.getMyGrades({ limit: 5 }),
        API.notifications.getMyNotifications({ limit: 5 })
      ])

      const dashboardData = {
        profile,
        courses: courses.enrollments,
        recentAssignments: assignments.assignments,
        recentGrades: grades.grades,
        notifications: notifications.notifications,
        stats: {
          totalCourses: courses.total,
          pendingAssignments: assignments.assignments.filter(a => a.status === AssignmentStatus.ASSIGNED || a.status === AssignmentStatus.DRAFT).length,
          unreadNotifications: notifications.unreadCount
        }
      }

      console.log('✅ Dashboard loaded:', dashboardData)
      return dashboardData
      
    } catch (error) {
      console.error('❌ Dashboard loading failed:', error)
      throw error
    }
  }
}

/**
 * Error Handling Examples
 */
export class ErrorHandlingExamples {
  static async handleApiErrorsExample() {
    try {
      await API.auth.login({
        email: 'invalid@email.com',
        password: 'wrongpassword'
      })
    } catch (error: any) {
      // API errors are automatically typed
      if (error.statusCode === 401) {
        console.log('🔐 Invalid credentials')
      } else if (error.statusCode === 429) {
        console.log('⏰ Rate limited, please try again later')
      } else if (error.statusCode >= 500) {
        console.log('🚨 Server error, please try again')
      } else {
        console.log('❌ Error:', error.message)
      }
    }
  }

  static async retryExample() {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const result = await API.courses.getCourses()
        console.log('✅ Success on attempt', attempt + 1)
        return result
      } catch (error: any) {
        attempt++
        
        if (attempt >= maxRetries) {
          console.error('❌ Max retries exceeded')
          throw error
        }

        if (error.statusCode >= 500) {
          console.log(`🔄 Retrying... (${attempt}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        } else {
          throw error // Don't retry client errors
        }
      }
    }
  }
}

/**
 * Development Utilities Examples
 */
export class DevExamples {
  static async quickSetupExample() {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Development utilities not available in production')
      return
    }

    try {
            // Quick login for testing
      await APIDev.quickLogin('student')

      // Log current status
      APIDev.logStatus()
      
      // Test API connection
      const connectionTest = await APIStatus.testConnection()
      console.log('🌐 Connection test:', connectionTest)
      
    } catch (error) {
      console.error('❌ Development setup failed:', error)
    }
  }
}