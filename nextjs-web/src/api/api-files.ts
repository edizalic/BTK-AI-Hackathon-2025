import { apiClient, apiRequest } from './config'
import type { FileAttachment, UploadFileResponse } from './types'

/**
 * Files API Service
 * Handles file uploads, downloads, and file management
 */
export class FilesAPI {
  private static readonly BASE_PATH = '/files'

  /**
   * Upload file (all authenticated users)
   */
  static async uploadFile(
    file: File, 
    options?: {
      description?: string
      isPublic?: boolean
      folder?: string
      onProgress?: (progress: number) => void
    }
  ): Promise<UploadFileResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options?.description) {
      formData.append('description', options.description)
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString())
    }
    if (options?.folder) {
      formData.append('folder', options.folder)
    }

    return apiRequest(() =>
      apiClient.post<UploadFileResponse>(`${this.BASE_PATH}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: options?.onProgress ? (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          options.onProgress!(progress)
        } : undefined
      })
    )
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[],
    options?: {
      folder?: string
      onProgress?: (fileIndex: number, progress: number) => void
      onComplete?: (fileIndex: number, result: UploadFileResponse) => void
      onError?: (fileIndex: number, error: any) => void
    }
  ): Promise<{
    successful: UploadFileResponse[]
    failed: Array<{ file: File; error: any }>
  }> {
    const successful: UploadFileResponse[] = []
    const failed: Array<{ file: File; error: any }> = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], {
          folder: options?.folder,
          onProgress: options?.onProgress ? (progress) => options.onProgress!(i, progress) : undefined
        })
        successful.push(result)
        options?.onComplete?.(i, result)
      } catch (error) {
        failed.push({ file: files[i], error })
        options?.onError?.(i, error)
      }
    }

    return { successful, failed }
  }

  /**
   * Get file metadata (all authenticated users)
   */
  static async getFileMetadata(fileId: string): Promise<FileAttachment> {
    return apiRequest(() =>
      apiClient.get<FileAttachment>(`${this.BASE_PATH}/${fileId}`)
    )
  }

  /**
   * Download file (all authenticated users with access check)
   */
  static async downloadFile(fileId: string, filename?: string): Promise<Blob> {
    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/${fileId}/download`, {
        responseType: 'blob'
      })
    )
  }

  /**
   * Get download URL for file (for direct downloads)
   */
  static getDownloadUrl(fileId: string, token?: string): string {
    const baseUrl = `${apiClient.defaults.baseURL}${this.BASE_PATH}/${fileId}/download`
    const accessToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null)
    
    if (accessToken) {
      return `${baseUrl}?token=${accessToken}`
    }
    
    return baseUrl
  }

  /**
   * Delete file (file uploader, SUPERVISOR_TEACHER)
   */
  static async deleteFile(fileId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${fileId}`)
    )
  }

  /**
   * Get user's uploaded files
   */
  static async getMyFiles(filters?: {
    mimeType?: string
    folder?: string
    uploadedAfter?: string
    uploadedBefore?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    files: FileAttachment[]
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
        files: FileAttachment[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/my-files?${params.toString()}`)
    )
  }

  /**
   * Get all files (administrators only)
   */
  static async getAllFiles(filters?: {
    uploadedBy?: string
    mimeType?: string
    folder?: string
    uploadedAfter?: string
    uploadedBefore?: string
    minSize?: number
    maxSize?: number
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    files: FileAttachment[]
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
        files: FileAttachment[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/admin/all?${params.toString()}`)
    )
  }

  /**
   * Get file statistics
   */
  static async getFileStats(): Promise<{
    totalFiles: number
    totalSize: number
    fileTypes: Record<string, number>
    monthlyUploads: Array<{
      month: string
      count: number
      size: number
    }>
    storageUsage: {
      used: number
      total: number
      percentage: number
    }
  }> {
    return apiRequest(() =>
      apiClient.get<{
        totalFiles: number
        totalSize: number
        fileTypes: Record<string, number>
        monthlyUploads: Array<{
          month: string
          count: number
          size: number
        }>
        storageUsage: {
          used: number
          total: number
          percentage: number
        }
      }>(`${this.BASE_PATH}/stats`)
    )
  }

  /**
   * Cleanup orphaned files (administrators only)
   */
  static async cleanupOrphanedFiles(): Promise<{
    deleted: number
    freed: number
    files: string[]
  }> {
    return apiRequest(() =>
      apiClient.post<{
        deleted: number
        freed: number
        files: string[]
      }>(`${this.BASE_PATH}/admin/cleanup`)
    )
  }

  /**
   * Scan file for viruses/malware (if enabled)
   */
  static async scanFile(fileId: string): Promise<{
    isClean: boolean
    scanDate: string
    threats?: string[]
    quarantined?: boolean
  }> {
    return apiRequest(() =>
      apiClient.post<{
        isClean: boolean
        scanDate: string
        threats?: string[]
        quarantined?: boolean
      }>(`${this.BASE_PATH}/${fileId}/scan`)
    )
  }

  /**
   * Generate file thumbnail (for images/documents)
   */
  static async generateThumbnail(fileId: string, size?: 'small' | 'medium' | 'large'): Promise<{
    thumbnailUrl: string
    size: { width: number; height: number }
  }> {
    return apiRequest(() =>
      apiClient.post<{
        thumbnailUrl: string
        size: { width: number; height: number }
      }>(`${this.BASE_PATH}/${fileId}/thumbnail`, { size: size || 'medium' })
    )
  }

  /**
   * Share file with other users
   */
  static async shareFile(fileId: string, shareWith: {
    userIds?: string[]
    roles?: string[]
    expiresAt?: string
    permissions?: ('read' | 'download')[]
  }): Promise<{
    shareUrl: string
    expiresAt?: string
    permissions: string[]
  }> {
    return apiRequest(() =>
      apiClient.post<{
        shareUrl: string
        expiresAt?: string
        permissions: string[]
      }>(`${this.BASE_PATH}/${fileId}/share`, shareWith)
    )
  }

  /**
   * Revoke file sharing
   */
  static async revokeFileSharing(fileId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${fileId}/share`)
    )
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, options?: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    maxFiles?: number
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const maxSize = options?.maxSize || 10 * 1024 * 1024 // 10MB default
    const allowedTypes = options?.allowedTypes || []

    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }

    if (file.name.length > 255) {
      errors.push('Filename is too long (maximum 255 characters)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get file icon based on mime type
   */
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗜️'
    return '📎'
  }
}