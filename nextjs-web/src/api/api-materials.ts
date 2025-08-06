import { apiClient, apiRequest } from './config'
import type {
  CourseMaterial,
  CreateMaterialDto,
  UpdateMaterialDto,
  MaterialType
} from './types'

/**
 * Course Materials API Service
 * Handles course materials, file uploads, and content distribution
 */
export class MaterialsAPI {
  private static readonly BASE_PATH = '/materials'

  /**
   * Upload course material (TEACHER, SUPERVISOR_TEACHER)
   */
  static async uploadMaterial(
    courseId: string, 
    materialData: CreateMaterialDto,
    file?: File
  ): Promise<CourseMaterial> {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add material data as JSON string
      Object.entries(materialData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString())
        }
      })

      return apiRequest(() =>
        apiClient.post<CourseMaterial>(`${this.BASE_PATH}/course/${courseId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      )
    } else {
      return apiRequest(() =>
        apiClient.post<CourseMaterial>(`${this.BASE_PATH}/course/${courseId}`, materialData)
      )
    }
  }

  /**
   * Get course materials (Public - all users can access)
   */
  static async getCourseMaterials(courseId: string, filters?: {
    type?: MaterialType
    isRequired?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    materials: CourseMaterial[]
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
        materials: CourseMaterial[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/course/${courseId}?${params.toString()}`)
    )
  }

  /**
   * Get material details (Public)
   */
  static async getMaterialById(materialId: string): Promise<CourseMaterial> {
    return apiRequest(() =>
      apiClient.get<CourseMaterial>(`${this.BASE_PATH}/${materialId}`)
    )
  }

  /**
   * Update material (TEACHER, SUPERVISOR_TEACHER - uploader)
   */
  static async updateMaterial(materialId: string, materialData: UpdateMaterialDto): Promise<CourseMaterial> {
    return apiRequest(() =>
      apiClient.put<CourseMaterial>(`${this.BASE_PATH}/${materialId}`, materialData)
    )
  }

  /**
   * Delete material (TEACHER, SUPERVISOR_TEACHER - uploader)
   */
  static async deleteMaterial(materialId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${materialId}`)
    )
  }

  /**
   * Download material file (all authenticated users)
   */
  static async downloadMaterial(materialId: string): Promise<Blob> {
    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/${materialId}/download`, {
        responseType: 'blob'
      })
    )
  }

  /**
   * Get download URL for material (for direct downloads)
   */
  static getDownloadUrl(materialId: string, token?: string): string {
    const baseUrl = `${apiClient.defaults.baseURL}${this.BASE_PATH}/${materialId}/download`
    const accessToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null)
    
    if (accessToken) {
      return `${baseUrl}?token=${accessToken}`
    }
    
    return baseUrl
  }

  /**
   * Get materials by type (Public)
   */
  static async getMaterialsByType(courseId: string, type: MaterialType): Promise<{
    materials: CourseMaterial[]
    total: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        materials: CourseMaterial[]
        total: number
      }>(`${this.BASE_PATH}/course/${courseId}/type/${type}`)
    )
  }

  /**
   * Get required materials (Public)
   */
  static async getRequiredMaterials(courseId: string): Promise<{
    materials: CourseMaterial[]
    total: number
  }> {
    return apiRequest(() =>
      apiClient.get<{
        materials: CourseMaterial[]
        total: number
      }>(`${this.BASE_PATH}/course/${courseId}/required`)
    )
  }

  /**
   * Get all materials uploaded by user (TEACHER, SUPERVISOR_TEACHER)
   */
  static async getMyMaterials(filters?: {
    courseId?: string
    type?: MaterialType
    uploadedAfter?: string
    uploadedBefore?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    materials: CourseMaterial[]
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
        materials: CourseMaterial[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/my-materials?${params.toString()}`)
    )
  }

  /**
   * Bulk upload materials
   */
  static async bulkUploadMaterials(
    courseId: string,
    materials: Array<{
      file: File
      materialData: CreateMaterialDto
    }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{
    successful: CourseMaterial[]
    failed: Array<{ file: File; materialData: CreateMaterialDto; error: any }>
  }> {
    const successful: CourseMaterial[] = []
    const failed: Array<{ file: File; materialData: CreateMaterialDto; error: any }> = []

    for (let i = 0; i < materials.length; i++) {
      try {
        const result = await this.uploadMaterial(courseId, materials[i].materialData, materials[i].file)
        successful.push(result)
        onProgress?.(i + 1, materials.length)
      } catch (error) {
        failed.push({ ...materials[i], error })
      }
    }

    return { successful, failed }
  }

  /**
   * Copy material to another course
   */
  static async copyMaterialToCourse(
    materialId: string, 
    targetCourseId: string,
    modifications?: UpdateMaterialDto
  ): Promise<CourseMaterial> {
    return apiRequest(() =>
      apiClient.post<CourseMaterial>(`${this.BASE_PATH}/${materialId}/copy`, {
        targetCourseId,
        modifications
      })
    )
  }

  /**
   * Get material access logs (for tracking who accessed what)
   */
  static async getMaterialAccessLogs(materialId: string, filters?: {
    userId?: string
    accessedAfter?: string
    accessedBefore?: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: Array<{
      id: string
      userId: string
      userName: string
      accessedAt: string
      action: 'view' | 'download'
      ipAddress?: string
      userAgent?: string
    }>
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
        logs: Array<{
          id: string
          userId: string
          userName: string
          accessedAt: string
          action: 'view' | 'download'
          ipAddress?: string
          userAgent?: string
        }>
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/${materialId}/access-logs?${params.toString()}`)
    )
  }

  /**
   * Get material statistics (for teachers)
   */
  static async getMaterialStats(materialId: string): Promise<{
    views: number
    downloads: number
    uniqueUsers: number
    lastAccessed?: string
    popularityScore: number
    accessTrend: Array<{
      date: string
      views: number
      downloads: number
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        views: number
        downloads: number
        uniqueUsers: number
        lastAccessed?: string
        popularityScore: number
        accessTrend: Array<{
          date: string
          views: number
          downloads: number
        }>
      }>(`${this.BASE_PATH}/${materialId}/stats`)
    )
  }

  /**
   * Search materials across courses
   */
  static async searchMaterials(query: string, filters?: {
    courseId?: string
    type?: MaterialType
    isRequired?: boolean
    uploadedBy?: string
    uploadedAfter?: string
    uploadedBefore?: string
    limit?: number
    offset?: number
  }): Promise<{
    materials: CourseMaterial[]
    total: number
    page: number
    limit: number
    highlights?: Record<string, string[]>
  }> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        materials: CourseMaterial[]
        total: number
        page: number
        limit: number
        highlights?: Record<string, string[]>
      }>(`${this.BASE_PATH}/search?${params.toString()}`)
    )
  }

  /**
   * Organize materials (reorder, categorize)
   */
  static async organizeMaterials(courseId: string, organization: {
    order?: string[]  // Array of material IDs in desired order
    categories?: Record<string, string[]>  // Category name -> material IDs
  }): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`${this.BASE_PATH}/course/${courseId}/organize`, organization)
    )
  }

  /**
   * Preview material content (for supported file types)
   */
  static async previewMaterial(materialId: string): Promise<{
    preview: string
    type: 'text' | 'html' | 'image' | 'video' | 'pdf'
    metadata?: {
      pages?: number
      duration?: number
      size?: { width: number; height: number }
    }
  }> {
    return apiRequest(() =>
      apiClient.get<{
        preview: string
        type: 'text' | 'html' | 'image' | 'video' | 'pdf'
        metadata?: {
          pages?: number
          duration?: number
          size?: { width: number; height: number }
        }
      }>(`${this.BASE_PATH}/${materialId}/preview`)
    )
  }
}