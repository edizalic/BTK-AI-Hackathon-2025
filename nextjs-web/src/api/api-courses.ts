import { apiClient, apiRequest } from './config'
import type {
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  EnrollStudentDto,
  Enrollment,
  User,
  CourseStatus,
  CourseLevel,
  StudyPlan,
  CreateStudyPlanDto,
  UpdateStudyPlanDto
} from './types'

/**
 * Courses API Service
 * Handles course management, enrollment, and course-related operations
 */
export class CoursesAPI {
  private static readonly BASE_PATH = '/courses'

  /**
   * Create a new course (SUPERVISOR_TEACHER only)
   */
  static async createCourse(courseData: CreateCourseDto): Promise<Course> {
    return apiRequest(() =>
      apiClient.post<Course>(this.BASE_PATH, courseData)
    )
  }

  /**
   * Get all courses with filtering (all authenticated users)
   */
  static async getCourses(filters?: {
    department?: string
    instructor?: string
    semester?: string
    year?: number
    status?: CourseStatus
    level?: CourseLevel
    search?: string
    studentId?: string  // For getting student's enrolled courses
    instructorId?: string  // For getting instructor's courses
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
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Get course details by ID (all authenticated users)
   */
  static async getCourseById(courseId: string): Promise<Course> {
    return apiRequest(() =>
      apiClient.get<Course>(`${this.BASE_PATH}/${courseId}`)
    )
  }

  /**
   * Update course information (SUPERVISOR_TEACHER, course instructor)
   */
  static async updateCourse(courseId: string, courseData: UpdateCourseDto): Promise<Course> {
    return apiRequest(() =>
      apiClient.put<Course>(`${this.BASE_PATH}/${courseId}`, courseData)
    )
  }

  /**
   * Delete course (SUPERVISOR_TEACHER only)
   */
  static async deleteCourse(courseId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${courseId}`)
    )
  }

  /**
   * Enroll student in course (SUPERVISOR_TEACHER only)
   */
  static async enrollStudent(courseId: string, enrollmentData: EnrollStudentDto): Promise<Enrollment> {
    return apiRequest(() =>
      apiClient.post<Enrollment>(`${this.BASE_PATH}/${courseId}/enroll`, enrollmentData)
    )
  }

  /**
   * Remove student from course (SUPERVISOR_TEACHER only)
   */
  static async unenrollStudent(courseId: string, studentId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${courseId}/enroll/${studentId}`)
    )
  }

  /**
   * Get enrolled students for a course (SUPERVISOR_TEACHER, course instructor)
   */
  static async getCourseStudents(courseId: string): Promise<{
    enrollments: Enrollment[]
    total: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        enrollments: Enrollment[]
        total: number
      }>(`${this.BASE_PATH}/${courseId}/students`)
    )
  }

  /**
   * Get student's enrolled courses
   */
  static async getStudentCourses(studentId?: string): Promise<{
    enrollments: Enrollment[]
    total: number
  }> {
    const endpoint = studentId 
      ? `${this.BASE_PATH}/student/${studentId}/enrollments`
      : `${this.BASE_PATH}/my-enrollments`

    return apiRequest(() =>
      apiClient.get<{
        enrollments: Enrollment[]
        total: number
      }>(endpoint)
    )
  }

  /**
   * Get instructor's courses
   */
  static async getInstructorCourses(instructorId?: string): Promise<{
    courses: Course[]
    total: number
  }> {
    const endpoint = instructorId 
      ? `${this.BASE_PATH}/instructor/${instructorId}`
      : `${this.BASE_PATH}/my-courses`

    return apiRequest(() =>
      apiClient.get<{
        courses: Course[]
        total: number
      }>(endpoint)
    )
  }

  /**
   * Get course statistics (for instructors/supervisors)
   */
  static async getCourseStats(courseId: string): Promise<{
    totalStudents: number
    activeStudents: number
    completedAssignments: number
    pendingAssignments: number
    averageGrade: number
    attendanceRate: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        totalStudents: number
        activeStudents: number
        completedAssignments: number
        pendingAssignments: number
        averageGrade: number
        attendanceRate: number
      }>(`${this.BASE_PATH}/${courseId}/stats`)
    )
  }

  /**
   * Assign teacher to course (SUPERVISOR_TEACHER only)
   */
  static async assignTeacher(courseId: string, teacherId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.post<{ message: string }>(`${this.BASE_PATH}/${courseId}/assign-teacher`, {
        teacherId
      })
    )
  }

  /**
   * Update course schedule
   */
  static async updateCourseSchedule(courseId: string, scheduleData: {
    scheduleDays: string[]
    startTime: string
    endTime: string
    location: string
    building?: string
    room?: string
  }): Promise<Course> {
    return apiRequest(() =>
      apiClient.put<Course>(`${this.BASE_PATH}/${courseId}/schedule`, scheduleData)
    )
  }

  /**
   * Bulk enroll students
   */
  static async bulkEnrollStudents(courseId: string, studentIds: string[]): Promise<{
    successful: Enrollment[]
    failed: { studentId: string; error: string }[]
  }> {
    return apiRequest(() =>
      apiClient.post<{
        successful: Enrollment[]
        failed: { studentId: string; error: string }[]
      }>(`${this.BASE_PATH}/${courseId}/bulk-enroll`, { studentIds })
    )
  }

  /**
   * Get available courses for enrollment (students)
   */
  static async getAvailableCourses(filters?: {
    department?: string
    level?: CourseLevel
    semester?: string
    year?: number
    excludeEnrolled?: boolean
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
    params.append('status', 'ACTIVE')
    
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
      }>(`${this.BASE_PATH}/available?${params.toString()}`)
    )
  }

  /**
   * Get course enrollment history
   */
  static async getCourseEnrollmentHistory(courseId: string, filters?: {
    semester?: string
    year?: number
    status?: string
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
      }>(`${this.BASE_PATH}/${courseId}/enrollment-history?${params.toString()}`)
    )
  }

  //=====================================
  // STUDY PLAN METHODS
  //=====================================

  /**
   * Create study plan for a course (TEACHER, SUPERVISOR_TEACHER - only course instructor or creator)
   */
  static async createStudyPlan(courseId: string, studyPlanData: CreateStudyPlanDto): Promise<StudyPlan> {
    return apiRequest(() =>
      apiClient.post<StudyPlan>(`${this.BASE_PATH}/${courseId}/study-plan`, studyPlanData)
    )
  }

  /**
   * Get study plan for a course (all authenticated users)
   */
  static async getStudyPlan(courseId: string): Promise<StudyPlan> {
    return apiRequest(() =>
      apiClient.get<StudyPlan>(`${this.BASE_PATH}/${courseId}/study-plan`)
    )
  }

  /**
   * Update study plan for a course (TEACHER, SUPERVISOR_TEACHER - only course instructor or creator)
   */
  static async updateStudyPlan(courseId: string, studyPlanData: UpdateStudyPlanDto): Promise<StudyPlan> {
    return apiRequest(() =>
      apiClient.put<StudyPlan>(`${this.BASE_PATH}/${courseId}/study-plan`, studyPlanData)
    )
  }

  /**
   * Delete study plan for a course (TEACHER, SUPERVISOR_TEACHER - only course instructor or creator)
   */
  static async deleteStudyPlan(courseId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${courseId}/study-plan`)
    )
  }
}