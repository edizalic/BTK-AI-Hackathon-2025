import { apiClient, apiRequest } from './config'
import type {
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  GradeFiltersDto
} from './types'

/**
 * Grades API Service
 * Handles grading system, grade calculations, and academic performance tracking
 */
export class GradesAPI {
  private static readonly BASE_PATH = '/grades'

  /**
   * Create/assign grade (TEACHER, SUPERVISOR_TEACHER)
   */
  static async createGrade(gradeData: CreateGradeDto & {
    studentId: string
    courseId?: string
    assignmentId?: string
    submissionId?: string
  }): Promise<Grade> {
    return apiRequest(() =>
      apiClient.post<Grade>(this.BASE_PATH, gradeData)
    )
  }

  /**
   * Get student's grades (TEACHER, SUPERVISOR_TEACHER, grade owner)
   */
  static async getStudentGrades(studentId: string, filters?: GradeFiltersDto): Promise<{
    grades: Grade[]
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
        grades: Grade[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/student/${studentId}?${params.toString()}`)
    )
  }

  /**
   * Get current user's grades (students)
   */
  static async getMyGrades(filters?: GradeFiltersDto): Promise<{
    grades: Grade[]
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
        grades: Grade[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/my-grades?${params.toString()}`)
    )
  }

  /**
   * Get all grades for course (TEACHER, SUPERVISOR_TEACHER)
   */
  static async getCourseGrades(courseId: string, filters?: {
    studentId?: string
    assignmentId?: string
    gradingPeriod?: string
    minScore?: number
    maxScore?: number
    letterGrade?: string
    limit?: number
    offset?: number
  }): Promise<{
    grades: Grade[]
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
        grades: Grade[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/course/${courseId}?${params.toString()}`)
    )
  }

  /**
   * Get assignment grades (for specific assignment)
   */
  static async getAssignmentGrades(assignmentId: string): Promise<{
    grades: Grade[]
    total: number
    statistics: {
      averageScore: number
      highestScore: number
      lowestScore: number
      totalGraded: number
      totalSubmissions: number
      gradeDistribution: Record<string, number>
    }
  }> {
    return apiRequest(() =>
      apiClient.get<{
        grades: Grade[]
        total: number
        statistics: {
          averageScore: number
          highestScore: number
          lowestScore: number
          totalGraded: number
          totalSubmissions: number
          gradeDistribution: Record<string, number>
        }
      }>(`${this.BASE_PATH}/assignment/${assignmentId}`)
    )
  }

  /**
   * Update grade (TEACHER, SUPERVISOR_TEACHER - grader)
   */
  static async updateGrade(gradeId: string, gradeData: UpdateGradeDto): Promise<Grade> {
    return apiRequest(() =>
      apiClient.put<Grade>(`${this.BASE_PATH}/${gradeId}`, gradeData)
    )
  }

  /**
   * Delete grade (SUPERVISOR_TEACHER only)
   */
  static async deleteGrade(gradeId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${gradeId}`)
    )
  }

  /**
   * Generate grade report for student (TEACHER, SUPERVISOR_TEACHER, report owner)
   */
  static async generateGradeReport(studentId: string, filters?: {
    semester?: string
    year?: number
    courseId?: string
    includeTranscript?: boolean
  }): Promise<{
    student: {
      id: string
      name: string
      email: string
      studentId: string
    }
    gpa: {
      overall: number
      semester: number
      creditHours: number
    }
    courses: Array<{
      course: {
        id: string
        name: string
        code: string
        credits: number
      }
      finalGrade: string
      finalScore: number
      assignments: Grade[]
    }>
    summary: {
      totalCourses: number
      totalCredits: number
      passedCourses: number
      failedCourses: number
      gradeDistribution: Record<string, number>
    }
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
        student: {
          id: string
          name: string
          email: string
          studentId: string
        }
        gpa: {
          overall: number
          semester: number
          creditHours: number
        }
        courses: Array<{
          course: {
            id: string
            name: string
            code: string
            credits: number
          }
          finalGrade: string
          finalScore: number
          assignments: Grade[]
        }>
        summary: {
          totalCourses: number
          totalCredits: number
          passedCourses: number
          failedCourses: number
          gradeDistribution: Record<string, number>
        }
      }>(`${this.BASE_PATH}/student/${studentId}/report?${params.toString()}`)
    )
  }

  /**
   * Get my grade report (students)
   */
  static async getMyGradeReport(filters?: {
    semester?: string
    year?: number
    courseId?: string
    includeTranscript?: boolean
  }): Promise<{
    student: {
      id: string
      name: string
      email: string
      studentId: string
    }
    gpa: {
      overall: number
      semester: number
      creditHours: number
    }
    courses: Array<{
      course: {
        id: string
        name: string
        code: string
        credits: number
      }
      finalGrade: string
      finalScore: number
      assignments: Grade[]
    }>
    summary: {
      totalCourses: number
      totalCredits: number
      passedCourses: number
      failedCourses: number
      gradeDistribution: Record<string, number>
    }
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
        student: {
          id: string
          name: string
          email: string
          studentId: string
        }
        gpa: {
          overall: number
          semester: number
          creditHours: number
        }
        courses: Array<{
          course: {
            id: string
            name: string
            code: string
            credits: number
          }
          finalGrade: string
          finalScore: number
          assignments: Grade[]
        }>
        summary: {
          totalCourses: number
          totalCredits: number
          passedCourses: number
          failedCourses: number
          gradeDistribution: Record<string, number>
        }
      }>(`${this.BASE_PATH}/my-report?${params.toString()}`)
    )
  }

  /**
   * Calculate GPA for student
   */
  static async calculateGPA(studentId: string, filters?: {
    semester?: string
    year?: number
    courseIds?: string[]
  }): Promise<{
    gpa: number
    creditHours: number
    qualityPoints: number
    courses: Array<{
      courseId: string
      courseName: string
      credits: number
      grade: string
      points: number
    }>
  }> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.year) params.append('year', filters.year.toString())
      if (filters.courseIds) {
        filters.courseIds.forEach(id => params.append('courseIds', id))
      }
    }

    return apiRequest(() =>
      apiClient.get<{
        gpa: number
        creditHours: number
        qualityPoints: number
        courses: Array<{
          courseId: string
          courseName: string
          credits: number
          grade: string
          points: number
        }>
      }>(`${this.BASE_PATH}/student/${studentId}/gpa?${params.toString()}`)
    )
  }

  /**
   * Get grade statistics for course (teachers)
   */
  static async getCourseGradeStats(courseId: string): Promise<{
    totalStudents: number
    gradedStudents: number
    averageGrade: number
    gradeDistribution: Record<string, number>
    passRate: number
    topPerformers: Array<{
      studentId: string
      studentName: string
      grade: string
      score: number
    }>
    needsAttention: Array<{
      studentId: string
      studentName: string
      grade: string
      score: number
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        totalStudents: number
        gradedStudents: number
        averageGrade: number
        gradeDistribution: Record<string, number>
        passRate: number
        topPerformers: Array<{
          studentId: string
          studentName: string
          grade: string
          score: number
        }>
        needsAttention: Array<{
          studentId: string
          studentName: string
          grade: string
          score: number
        }>
      }>(`${this.BASE_PATH}/course/${courseId}/stats`)
    )
  }

  /**
   * Bulk grade assignments
   */
  static async bulkGradeAssignments(grades: Array<CreateGradeDto & {
    studentId: string
    assignmentId: string
    submissionId?: string
  }>): Promise<{
    created: Grade[]
    failed: Array<{ data: any; error: string }>
  }> {
    return apiRequest(() =>
      apiClient.post<{
        created: Grade[]
        failed: Array<{ data: any; error: string }>
      }>(`${this.BASE_PATH}/bulk`, { grades })
    )
  }

  /**
   * Export grades to CSV
   */
  static async exportGrades(filters: {
    courseId?: string
    studentId?: string
    semester?: string
    year?: number
    format?: 'csv' | 'excel'
  }): Promise<Blob> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/export?${params.toString()}`, {
        responseType: 'blob'
      })
    )
  }
}