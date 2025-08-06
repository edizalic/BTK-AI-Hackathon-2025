import { apiClient, apiRequest } from './config'
import type {
  User,
  CreateStudentDto,
  CreateTeacherDto,
  CreateSupervisorDto,
  UpdateUserDto,
  UserFiltersDto,
  AssignAdvisoryDto
} from './types'

/**
 * Users API Service
 * Handles user management operations (CRUD, registration, advisory assignments)
 */
export class UsersAPI {
  private static readonly BASE_PATH = '/users'

  /**
   * Register a new student (SUPERVISOR_TEACHER only)
   */
  static async createStudent(studentData: CreateStudentDto): Promise<User> {
    return apiRequest(() =>
      apiClient.post<User>(`${this.BASE_PATH}/students`, studentData)
    )
  }

  /**
   * Register a new teacher (SUPERVISOR_TEACHER only)
   */
  static async createTeacher(teacherData: CreateTeacherDto): Promise<User> {
    return apiRequest(() =>
      apiClient.post<User>(`${this.BASE_PATH}/teachers`, teacherData)
    )
  }

  /**
   * Register a new supervisor teacher (ADMIN only)
   */
  static async createSupervisor(supervisorData: CreateSupervisorDto): Promise<User> {
    return apiRequest(() =>
      apiClient.post<User>(`${this.BASE_PATH}/supervisors`, supervisorData)
    )
  }

  /**
   * Get all users with filtering (SUPERVISOR_TEACHER, ADMIN)
   */
  static async getUsers(filters?: UserFiltersDto): Promise<{
    users: User[]
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
        users: User[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Get user by ID (SUPERVISOR_TEACHER, ADMIN, or own profile)
   */
  static async getUserById(userId: string): Promise<User> {
    return apiRequest(() =>
      apiClient.get<User>(`${this.BASE_PATH}/${userId}`)
    )
  }

  /**
   * Update user information (SUPERVISOR_TEACHER, ADMIN, or own profile)
   */
  static async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    return apiRequest(() =>
      apiClient.put<User>(`${this.BASE_PATH}/${userId}`, userData)
    )
  }

  /**
   * Deactivate user account (SUPERVISOR_TEACHER, ADMIN)
   */
  static async deleteUser(userId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${userId}`)
    )
  }

  /**
   * Assign advisory teacher to student (SUPERVISOR_TEACHER only)
   */
  static async assignAdvisoryTeacher(
    studentId: string, 
    advisoryData: AssignAdvisoryDto
  ): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.post<{ message: string }>(
        `${this.BASE_PATH}/${studentId}/advisory`, 
        advisoryData
      )
    )
  }

  /**
   * Get students by advisory teacher
   */
  static async getStudentsByAdvisoryTeacher(teacherId: string): Promise<User[]> {
    return apiRequest(() =>
      apiClient.get<User[]>(`${this.BASE_PATH}/advisory-students/${teacherId}`)
    )
  }

  /**
   * Get teachers by department
   */
  static async getTeachersByDepartment(department: string): Promise<User[]> {
    return apiRequest(() =>
      apiClient.get<User[]>(`${this.BASE_PATH}/teachers/department/${department}`)
    )
  }

  /**
   * Get all students (for supervisors/admins)
   */
  static async getAllStudents(filters?: {
    grade?: string
    major?: string
    advisoryTeacherId?: string
    isActive?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    students: User[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    params.append('role', 'STUDENT')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        students: User[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Get all teachers (for supervisors/admins)
   */
  static async getAllTeachers(filters?: {
    department?: string
    position?: string
    specialization?: string
    isActive?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    teachers: User[]
    total: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    params.append('role', 'TEACHER')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        teachers: User[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Bulk operations for user management
   */
  static async bulkCreateStudents(studentsData: CreateStudentDto[]): Promise<{
    created: User[]
    failed: { data: CreateStudentDto; error: string }[]
  }> {
    return apiRequest(() =>
      apiClient.post<{
        created: User[]
        failed: { data: CreateStudentDto; error: string }[]
      }>(`${this.BASE_PATH}/students/bulk`, { students: studentsData })
    )
  }

  /**
   * Export users to CSV (for admins/supervisors)
   */
  static async exportUsers(filters?: UserFiltersDto): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/export?${params.toString()}`, {
        responseType: 'blob'
      })
    )
  }
}