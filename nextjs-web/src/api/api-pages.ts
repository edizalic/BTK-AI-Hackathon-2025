import { apiClient, apiRequest } from './config'
import type { PageConfiguration, UserRole } from './types'

/**
 * Pages API Service
 * Handles dynamic page configurations for the frontend rendering system
 */
export class PagesAPI {
  private static readonly BASE_PATH = '/pages'

  /**
   * Get page configuration by ID (all authenticated users)
   */
  static async getPageConfig(pageId: string): Promise<PageConfiguration> {
    return apiRequest(() =>
      apiClient.get<PageConfiguration>(`${this.BASE_PATH}/${pageId}`)
    )
  }

  /**
   * Get available pages for current user (all authenticated users)
   */
  static async getAvailablePages(filters?: {
    userType?: UserRole
    requiresAuth?: boolean
    search?: string
  }): Promise<{
    pages: Array<{
      id: string
      title: string
      description?: string
      userType?: UserRole
      requiresAuth: boolean
      permissions: string[]
    }>
    total: number
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
        pages: Array<{
          id: string
          title: string
          description?: string
          userType?: UserRole
          requiresAuth: boolean
          permissions: string[]
        }>
        total: number
      }>(`${this.BASE_PATH}?${params.toString()}`)
    )
  }

  /**
   * Create page configuration (ADMIN, SUPERVISOR_TEACHER)
   */
  static async createPageConfig(pageData: {
    id: string
    title: string
    description?: string
    userType?: UserRole
    layoutType: string
    layoutClass?: string
    sections: any
    requiresAuth?: boolean
    permissions?: string[]
    requiresSupervisor?: boolean
  }): Promise<PageConfiguration> {
    return apiRequest(() =>
      apiClient.post<PageConfiguration>(this.BASE_PATH, pageData)
    )
  }

  /**
   * Update page configuration (ADMIN, SUPERVISOR_TEACHER)
   */
  static async updatePageConfig(pageId: string, pageData: Partial<{
    title: string
    description?: string
    userType?: UserRole
    layoutType: string
    layoutClass?: string
    sections: any
    requiresAuth?: boolean
    permissions?: string[]
    requiresSupervisor?: boolean
  }>): Promise<PageConfiguration> {
    return apiRequest(() =>
      apiClient.put<PageConfiguration>(`${this.BASE_PATH}/${pageId}`, pageData)
    )
  }

  /**
   * Delete page configuration (ADMIN only)
   */
  static async deletePageConfig(pageId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${pageId}`)
    )
  }

  /**
   * Clone page configuration
   */
  static async clonePageConfig(sourcePageId: string, newPageData: {
    id: string
    title: string
    description?: string
    userType?: UserRole
    modifications?: any
  }): Promise<PageConfiguration> {
    return apiRequest(() =>
      apiClient.post<PageConfiguration>(`${this.BASE_PATH}/${sourcePageId}/clone`, newPageData)
    )
  }

  /**
   * Get page templates (for creating new pages)
   */
  static async getPageTemplates(category?: string): Promise<{
    templates: Array<{
      id: string
      name: string
      description: string
      category: string
      userTypes: UserRole[]
      preview?: string
      sections: any
    }>
  }> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)

    return apiRequest(() =>
      apiClient.get<{
        templates: Array<{
          id: string
          name: string
          description: string
          category: string
          userTypes: UserRole[]
          preview?: string
          sections: any
        }>
      }>(`${this.BASE_PATH}/templates?${params.toString()}`)
    )
  }

  /**
   * Validate page configuration
   */
  static async validatePageConfig(pageData: any): Promise<{
    isValid: boolean
    errors: Array<{
      field: string
      message: string
      code: string
    }>
    warnings?: Array<{
      field: string
      message: string
      code: string
    }>
  }> {
    return apiRequest(() =>
      apiClient.post<{
        isValid: boolean
        errors: Array<{
          field: string
          message: string
          code: string
        }>
        warnings?: Array<{
          field: string
          message: string
          code: string
        }>
      }>(`${this.BASE_PATH}/validate`, pageData)
    )
  }

  /**
   * Preview page configuration (without saving)
   */
  static async previewPageConfig(pageData: any): Promise<{
    rendered: string
    metadata: {
      componentCount: number
      sectionCount: number
      estimatedLoadTime: number
    }
  }> {
    return apiRequest(() =>
      apiClient.post<{
        rendered: string
        metadata: {
          componentCount: number
          sectionCount: number
          estimatedLoadTime: number
        }
      }>(`${this.BASE_PATH}/preview`, pageData)
    )
  }

  /**
   * Get page usage statistics (ADMIN, SUPERVISOR_TEACHER)
   */
  static async getPageStats(pageId?: string): Promise<{
    pageStats: Array<{
      pageId: string
      title: string
      views: number
      uniqueVisitors: number
      avgLoadTime: number
      lastViewed: string
      topUsers: Array<{
        userId: string
        userName: string
        views: number
      }>
    }>
    totalViews: number
    totalPages: number
    mostPopular: string
    leastPopular: string
  }> {
    const endpoint = pageId ? `${this.BASE_PATH}/${pageId}/stats` : `${this.BASE_PATH}/stats`
    
    return apiRequest(() =>
      apiClient.get<{
        pageStats: Array<{
          pageId: string
          title: string
          views: number
          uniqueVisitors: number
          avgLoadTime: number
          lastViewed: string
          topUsers: Array<{
            userId: string
            userName: string
            views: number
          }>
        }>
        totalViews: number
        totalPages: number
        mostPopular: string
        leastPopular: string
      }>(endpoint)
    )
  }

  /**
   * Export page configuration as JSON
   */
  static async exportPageConfig(pageId: string): Promise<Blob> {
    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/${pageId}/export`, {
        responseType: 'blob'
      })
    )
  }

  /**
   * Import page configuration from JSON file
   */
  static async importPageConfig(file: File, options?: {
    overwrite?: boolean
    prefix?: string
  }): Promise<{
    imported: Array<{
      id: string
      title: string
      status: 'created' | 'updated' | 'skipped'
    }>
    errors: Array<{
      id: string
      error: string
    }>
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options?.overwrite !== undefined) {
      formData.append('overwrite', options.overwrite.toString())
    }
    if (options?.prefix) {
      formData.append('prefix', options.prefix)
    }

    return apiRequest(() =>
      apiClient.post<{
        imported: Array<{
          id: string
          title: string
          status: 'created' | 'updated' | 'skipped'
        }>
        errors: Array<{
          id: string
          error: string
        }>
      }>(`${this.BASE_PATH}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    )
  }

  /**
   * Get component registry (available components for page building)
   */
  static async getComponentRegistry(): Promise<{
    components: Array<{
      type: string
      name: string
      description: string
      category: string
      props: Record<string, {
        type: string
        required: boolean
        default?: any
        description: string
      }>
      examples: Array<{
        name: string
        props: any
      }>
    }>
    categories: string[]
  }> {
    return apiRequest(() =>
      apiClient.get<{
        components: Array<{
          type: string
          name: string
          description: string
          category: string
          props: Record<string, {
            type: string
            required: boolean
            default?: any
            description: string
          }>
          examples: Array<{
            name: string
            props: any
          }>
        }>
        categories: string[]
      }>(`${this.BASE_PATH}/components`)
    )
  }

  /**
   * Record page view (for analytics)
   */
  static async recordPageView(pageId: string, metadata?: {
    loadTime?: number
    userAgent?: string
    viewport?: { width: number; height: number }
    referrer?: string
  }): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.post<{ message: string }>(`${this.BASE_PATH}/${pageId}/view`, metadata)
    )
  }

  /**
   * Get personalized page configuration (based on user preferences/history)
   */
  static async getPersonalizedPageConfig(pageId: string): Promise<PageConfiguration> {
    return apiRequest(() =>
      apiClient.get<PageConfiguration>(`${this.BASE_PATH}/${pageId}/personalized`)
    )
  }

  /**
   * Update user page preferences
   */
  static async updatePagePreferences(pageId: string, preferences: {
    layout?: string
    theme?: string
    componentVisibility?: Record<string, boolean>
    customizations?: any
  }): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`${this.BASE_PATH}/${pageId}/preferences`, preferences)
    )
  }
}