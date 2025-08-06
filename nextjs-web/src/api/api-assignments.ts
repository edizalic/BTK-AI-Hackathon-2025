import { apiClient, apiRequest } from './config'
import type {
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  AssignmentSubmission,
  AssignmentType,
  AssignmentStatus
} from './types'

/**
 * Assignments API Service
 * Handles assignment creation, submissions, and assignment-related operations
 */
export class AssignmentsAPI {
  private static readonly BASE_PATH = '/assignments'

  /**
   * Create assignment for course (TEACHER, SUPERVISOR_TEACHER)
   */
  static async createAssignment(assignmentData: CreateAssignmentDto): Promise<Assignment> {
    return apiRequest(() =>
      apiClient.post<Assignment>(`${this.BASE_PATH}/course/${assignmentData.courseId}`, assignmentData)
    )
  }

  /**
   * Get course assignments (all authenticated users)
   */
  static async getCourseAssignments(courseId: string, filters?: {
    type?: AssignmentType
    status?: AssignmentStatus
    studentId?: string  // For getting assignments specific to a student
    limit?: number
    offset?: number
  }): Promise<{
    assignments: Assignment[]
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
        assignments: Assignment[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/course/${courseId}?${params.toString()}`)
    )
  }

  /**
   * Get all assignments with filtering (for students/teachers)
   */
  static async getAssignments(filters?: {
    courseId?: string
    type?: AssignmentType
    status?: AssignmentStatus
    studentId?: string
    instructorId?: string
    dueAfter?: string
    dueBefore?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    assignments: Assignment[]
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
        assignments: Assignment[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Get assignment details (all authenticated users)
   */
  static async getAssignmentById(assignmentId: string): Promise<Assignment & {
    submissions?: AssignmentSubmission[]
    userSubmission?: AssignmentSubmission
  }> {
    return apiRequest(() =>
      apiClient.get<Assignment & {
        submissions?: AssignmentSubmission[]
        userSubmission?: AssignmentSubmission
      }>(`${this.BASE_PATH}/${assignmentId}`)
    )
  }

  /**
   * Update assignment (TEACHER, SUPERVISOR_TEACHER - assignment creator)
   */
  static async updateAssignment(assignmentId: string, assignmentData: UpdateAssignmentDto): Promise<Assignment> {
    return apiRequest(() =>
      apiClient.put<Assignment>(`${this.BASE_PATH}/${assignmentId}`, assignmentData)
    )
  }

  /**
   * Delete assignment (TEACHER, SUPERVISOR_TEACHER - assignment creator)
   */
  static async deleteAssignment(assignmentId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${assignmentId}`)
    )
  }

  /**
   * Submit assignment solution (STUDENT only)
   */
  static async submitAssignment(assignmentId: string, submissionData: SubmitAssignmentDto): Promise<AssignmentSubmission> {
    return apiRequest(() =>
      apiClient.post<AssignmentSubmission>(`${this.BASE_PATH}/${assignmentId}/submit`, submissionData)
    )
  }

  /**
   * Get assignment submissions (TEACHER, SUPERVISOR_TEACHER)
   */
  static async getAssignmentSubmissions(assignmentId: string, filters?: {
    studentId?: string
    submittedAfter?: string
    submittedBefore?: string
    hasGrade?: boolean
    limit?: number
    offset?: number
  }): Promise<{
    submissions: AssignmentSubmission[]
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
        submissions: AssignmentSubmission[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/${assignmentId}/submissions?${params.toString()}`)
    )
  }

  /**
   * Get submission details (TEACHER, SUPERVISOR_TEACHER, submission owner)
   */
  static async getSubmissionById(submissionId: string): Promise<AssignmentSubmission> {
    return apiRequest(() =>
      apiClient.get<AssignmentSubmission>(`${this.BASE_PATH}/submissions/${submissionId}`)
    )
  }

  /**
   * Update assignment submission (STUDENT - before deadline)
   */
  static async updateSubmission(submissionId: string, submissionData: SubmitAssignmentDto): Promise<AssignmentSubmission> {
    return apiRequest(() =>
      apiClient.put<AssignmentSubmission>(`${this.BASE_PATH}/submissions/${submissionId}`, submissionData)
    )
  }

  /**
   * Get student's assignments (current user or specific student)
   */
  static async getStudentAssignments(studentId?: string, filters?: {
    courseId?: string
    status?: AssignmentStatus
    type?: AssignmentType
    dueAfter?: string
    dueBefore?: string
    limit?: number
    offset?: number
  }): Promise<{
    assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
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

    const endpoint = studentId 
      ? `${this.BASE_PATH}/student/${studentId}`
      : `${this.BASE_PATH}/my-assignments`

    return apiRequest(() =>
      apiClient.get<{
        assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
        total: number
        page: number
        limit: number
      }>(`${endpoint}?${params.toString()}`)
    )
  }

  /**
   * Get upcoming assignments (due soon)
   */
  static async getUpcomingAssignments(days: number = 7): Promise<{
    assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
    total: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
        total: number
      }>(`${this.BASE_PATH}/upcoming?days=${days}`)
    )
  }

  /**
   * Get overdue assignments
   */
  static async getOverdueAssignments(studentId?: string): Promise<{
    assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
    total: number
  }> {
    const endpoint = studentId 
      ? `${this.BASE_PATH}/overdue/student/${studentId}`
      : `${this.BASE_PATH}/overdue`

    return apiRequest(() =>
      apiClient.get<{
        assignments: (Assignment & { userSubmission?: AssignmentSubmission })[]
        total: number
      }>(endpoint)
    )
  }

  /**
   * Get assignment statistics (for teachers)
   */
  static async getAssignmentStats(assignmentId: string): Promise<{
    totalStudents: number
    submittedCount: number
    pendingCount: number
    gradedCount: number
    averageScore: number
    submissionRate: number
    onTimeSubmissions: number
    lateSubmissions: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        totalStudents: number
        submittedCount: number
        pendingCount: number
        gradedCount: number
        averageScore: number
        submissionRate: number
        onTimeSubmissions: number
        lateSubmissions: number
      }>(`${this.BASE_PATH}/${assignmentId}/stats`)
    )
  }

  /**
   * Bulk create assignments (for teachers)
   */
  static async bulkCreateAssignments(assignmentsData: CreateAssignmentDto[]): Promise<{
    created: Assignment[]
    failed: { data: CreateAssignmentDto; error: string }[]
  }> {
    return apiRequest(() =>
      apiClient.post<{
        created: Assignment[]
        failed: { data: CreateAssignmentDto; error: string }[]
      }>(`${this.BASE_PATH}/bulk`, { assignments: assignmentsData })
    )
  }

  /**
   * Clone assignment to another course
   */
  static async cloneAssignment(assignmentId: string, targetCourseId: string, modifications?: Partial<CreateAssignmentDto>): Promise<Assignment> {
    return apiRequest(() =>
      apiClient.post<Assignment>(`${this.BASE_PATH}/${assignmentId}/clone`, {
        targetCourseId,
        modifications
      })
    )
  }
}