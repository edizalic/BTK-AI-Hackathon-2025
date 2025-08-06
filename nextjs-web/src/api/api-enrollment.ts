import { apiClient, apiRequest } from './config'
import type { Enrollment, Course, User } from './types'

/**
 * Enrollment API Service
 * Handles student enrollment operations and course enrollment queries
 */
export class EnrollmentAPI {
  private static readonly BASE_PATH = '/enrollment'

  /**
   * Get courses that a specific student is enrolled in
   * Endpoint: GET /enrollment/students/:studentId
   */
  static async getStudentEnrollments(studentId: string): Promise<{
    enrollments: Enrollment[]
    courses: Course[]
    total: number
  }> {
    try {
      // Try the real API endpoint first
      const response = await apiRequest(() =>
        apiClient.get<{
          enrollments: Enrollment[]
          courses: Course[]
          total: number
        }>(`${this.BASE_PATH}/students/${studentId}`)
      )
      return response
    } catch (error) {
      console.warn('Real enrollment API not available, using mock data')
      console.log('Using mock data for student ID:', studentId)
      
      // Mock data for demonstration
      const mockEnrollments: Enrollment[] = [
        {
          id: 'enrollment_1',
          studentId: studentId,
          courseId: 'CS101',
          student: {} as User,
          course: {
            id: 'CS101',
            code: 'CS 101',
            name: 'Introduction to Programming',
            description: 'Learn the fundamentals of programming using Python.',
            credits: 3,
            scheduleDays: ['monday', 'wednesday', 'friday'],
            startTime: '09:00',
            endTime: '10:30',
            location: 'Computer Lab A',
            building: 'Science Building',
            room: 'Room 101',
            createdById: 'teacher_001',
            createdBy: {} as User,
            instructorId: 'teacher_001',
            instructor: {} as User,
            semester: 'Spring',
            year: 2025,
            capacity: 30,
            enrolled: 28,
            status: 'ACTIVE' as any,
            category: 'Core',
            departmentId: 'CS',
            level: 'BEGINNER' as any,
            startDate: '2025-01-20',
            endDate: '2025-05-15',
            enrollmentDeadline: '2025-01-25',
            syllabusUrl: undefined,
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01'
          },
          enrolledById: 'supervisor_001',
          enrolledBy: {} as User,
          enrollmentDate: '2025-01-15',
          status: 'ACTIVE' as any,
          finalGrade: undefined,
          finalPoints: undefined,
          completed: 8,
          total: 16,
          currentGrade: 92,
          attendance: 96,
          createdAt: '2025-01-15',
          updatedAt: '2025-01-15'
        },
        {
          id: 'enrollment_2',
          studentId: studentId,
          courseId: 'MATH201',
          student: {} as User,
          course: {
            id: 'MATH201',
            code: 'MATH 201',
            name: 'Calculus II',
            description: 'Advanced calculus topics including integration techniques.',
            credits: 4,
            scheduleDays: ['tuesday', 'thursday'],
            startTime: '11:00',
            endTime: '12:30',
            location: 'Mathematics Hall',
            building: 'Math Building',
            room: 'Room 215',
            createdById: 'teacher_002',
            createdBy: {} as User,
            instructorId: 'teacher_002',
            instructor: {} as User,
            semester: 'Spring',
            year: 2025,
            capacity: 25,
            enrolled: 23,
            status: 'ACTIVE' as any,
            category: 'Core',
            departmentId: 'MATH',
            level: 'INTERMEDIATE' as any,
            startDate: '2025-01-20',
            endDate: '2025-05-15',
            enrollmentDeadline: '2025-01-25',
            syllabusUrl: undefined,
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01'
          },
          enrolledById: 'supervisor_001',
          enrolledBy: {} as User,
          enrollmentDate: '2025-01-15',
          status: 'ACTIVE' as any,
          finalGrade: undefined,
          finalPoints: undefined,
          completed: 6,
          total: 14,
          currentGrade: 85,
          attendance: 92,
          createdAt: '2025-01-15',
          updatedAt: '2025-01-15'
        }
      ]
      
      return {
        enrollments: mockEnrollments,
        courses: mockEnrollments.map(e => e.course),
        total: mockEnrollments.length
      }
    }
  }

  /**
   * Get current user's enrollments (for students)
   * Endpoint: GET /enrollment/my-courses
   */
  static async getMyEnrollments(): Promise<{
    enrollments: Enrollment[]
    courses: Course[]
    total: number
  }> {
    try {
      // Try the real API endpoint first
      const response = await apiRequest(() =>
        apiClient.get<{
          enrollments: Enrollment[]
          courses: Course[]
          total: number
        }>(`${this.BASE_PATH}/my-courses`)
      )
      return response
    } catch (error) {
      console.warn('Real my-enrollments API not available, using mock data')
      
      // Get the current user ID from localStorage or use a default
      const userData = localStorage.getItem('user')
      let currentUserId = 'current-user'
      
      if (userData) {
        try {
          const user = JSON.parse(userData)
          currentUserId = user.id || 'current-user'
        } catch (e) {
          console.warn('Failed to parse user data from localStorage')
        }
      }
      
      // Return the same mock data as getStudentEnrollments with actual user ID
      return this.getStudentEnrollments(currentUserId)
    }
  }

  /**
   * Get enrollment status for a specific course
   * Endpoint: GET /enrollment/course/:courseId/status
   */
  static async getCourseEnrollmentStatus(courseId: string): Promise<{
    isEnrolled: boolean
    enrollment?: Enrollment
    canEnroll: boolean
    reason?: string
  }> {
    return apiRequest(() =>
      apiClient.get<{
        isEnrolled: boolean
        enrollment?: Enrollment
        canEnroll: boolean
        reason?: string
      }>(`${this.BASE_PATH}/course/${courseId}/status`)
    )
  }

  /**
   * Enroll current user in a course (for students)
   * Endpoint: POST /enrollment/course/:courseId
   */
  static async enrollInCourse(courseId: string): Promise<Enrollment> {
    return apiRequest(() =>
      apiClient.post<Enrollment>(`${this.BASE_PATH}/course/${courseId}`)
    )
  }

  /**
   * Unenroll current user from a course (for students)
   * Endpoint: DELETE /enrollment/course/:courseId
   */
  static async unenrollFromCourse(courseId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/course/${courseId}`)
    )
  }

  /**
   * Get enrollment history for current user
   * Endpoint: GET /enrollment/history
   */
  static async getEnrollmentHistory(filters?: {
    semester?: string
    year?: number
    status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN'
    limit?: number
    offset?: number
  }): Promise<{
    enrollments: Enrollment[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        enrollments: Enrollment[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/history?${params.toString()}`)
    )
  }

  /**
   * Get available courses for enrollment
   * Endpoint: GET /enrollment/available-courses
   */
  static async getAvailableCoursesForEnrollment(filters?: {
    department?: string
    semester?: string
    year?: number
    level?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    courses: Course[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        courses: Course[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/available-courses?${params.toString()}`)
    )
  }
}