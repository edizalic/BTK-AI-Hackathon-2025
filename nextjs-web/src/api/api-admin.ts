import { apiClient, apiRequest } from './config'
import type {
  SystemStats,
  AuditLog,
  AuditFiltersDto,
  CreateSupervisorDto,
  User
} from './types'

/**
 * Admin API Service
 * Handles administrative operations, system management, and audit functionality
 */
export class AdminAPI {
  private static readonly BASE_PATH = '/admin'
  private static readonly AUDIT_PATH = '/audit'

  // ============= ADMIN DASHBOARD =============

  /**
   * Get admin dashboard data (ADMIN only)
   */
  static async getDashboardData(): Promise<{
    stats: SystemStats
    recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: string
      user?: string
    }>
    systemHealth: {
      status: 'healthy' | 'warning' | 'critical'
      uptime: number
      memoryUsage: number
      diskUsage: number
      activeUsers: number
    }
    alerts: Array<{
      id: string
      type: 'info' | 'warning' | 'error'
      message: string
      timestamp: string
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        stats: SystemStats
        recentActivity: Array<{
          id: string
          type: string
          description: string
          timestamp: string
          user?: string
        }>
        systemHealth: {
          status: 'healthy' | 'warning' | 'critical'
          uptime: number
          memoryUsage: number
          diskUsage: number
          activeUsers: number
        }
        alerts: Array<{
          id: string
          type: 'info' | 'warning' | 'error'
          message: string
          timestamp: string
        }>
      }>(`${this.BASE_PATH}/dashboard`)
    )
  }

  /**
   * Get user statistics (ADMIN only)
   */
  static async getUserStats(filters?: {
    role?: string
    department?: string
    isActive?: boolean
    registeredAfter?: string
    registeredBefore?: string
  }): Promise<{
    totalUsers: number
    activeUsers: number
    usersByRole: Record<string, number>
    usersByDepartment: Record<string, number>
    registrationTrend: Array<{
      date: string
      count: number
    }>
    recentRegistrations: User[]
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
        totalUsers: number
        activeUsers: number
        usersByRole: Record<string, number>
        usersByDepartment: Record<string, number>
        registrationTrend: Array<{
          date: string
          count: number
        }>
        recentRegistrations: User[]
      }>(`${this.BASE_PATH}/users/stats?${params.toString()}`)
    )
  }

  /**
   * Create system backup (ADMIN only)
   */
  static async createBackup(options?: {
    includeFiles?: boolean
    compression?: 'none' | 'gzip' | 'bzip2'
    description?: string
  }): Promise<{
    backupId: string
    status: 'initiated' | 'in_progress' | 'completed' | 'failed'
    message: string
    estimatedSize?: number
  }> {
    return apiRequest(() =>
      apiClient.post<{
        backupId: string
        status: 'initiated' | 'in_progress' | 'completed' | 'failed'
        message: string
        estimatedSize?: number
      }>(`${this.BASE_PATH}/system/backup`, options)
    )
  }

  /**
   * Get system health status (ADMIN only)
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    version: string
    environment: string
    database: {
      status: 'connected' | 'disconnected'
      responseTime: number
      connections: number
    }
    memory: {
      used: number
      free: number
      total: number
      percentage: number
    }
    disk: {
      used: number
      free: number
      total: number
      percentage: number
    }
    services: Array<{
      name: string
      status: 'running' | 'stopped' | 'error'
      lastCheck: string
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        status: 'healthy' | 'warning' | 'critical'
        uptime: number
        version: string
        environment: string
        database: {
          status: 'connected' | 'disconnected'
          responseTime: number
          connections: number
        }
        memory: {
          used: number
          free: number
          total: number
          percentage: number
        }
        disk: {
          used: number
          free: number
          total: number
          percentage: number
        }
        services: Array<{
          name: string
          status: 'running' | 'stopped' | 'error'
          lastCheck: string
        }>
      }>(`${this.BASE_PATH}/system/health`)
    )
  }

  /**
   * Register supervisor teacher (ADMIN only)
   */
  static async registerSupervisor(supervisorData: CreateSupervisorDto): Promise<User> {
    return apiRequest(() =>
      apiClient.post<User>(`${this.BASE_PATH}/supervisors`, supervisorData)
    )
  }

  /**
   * Get system settings (ADMIN only)
   */
  static async getSystemSettings(): Promise<{
    settings: Record<string, {
      key: string
      value: any
      type: string
      description?: string
      category: string
    }>
    categories: string[]
  }> {
    return apiRequest(() =>
      apiClient.get<{
        settings: Record<string, {
          key: string
          value: any
          type: string
          description?: string
          category: string
        }>
        categories: string[]
      }>(`${this.BASE_PATH}/settings`)
    )
  }

  /**
   * Update system settings (ADMIN only)
   */
  static async updateSystemSettings(settings: Record<string, any>): Promise<{
    updated: string[]
    failed: Array<{ key: string; error: string }>
  }> {
    return apiRequest(() =>
      apiClient.put<{
        updated: string[]
        failed: Array<{ key: string; error: string }>
      }>(`${this.BASE_PATH}/settings`, { settings })
    )
  }

  /**
   * Get application logs (ADMIN only)
   */
  static async getApplicationLogs(filters?: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    startDate?: string
    endDate?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: Array<{
      timestamp: string
      level: string
      message: string
      meta?: any
      userId?: string
      ipAddress?: string
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
          timestamp: string
          level: string
          message: string
          meta?: any
          userId?: string
          ipAddress?: string
        }>
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/logs?${params.toString()}`)
    )
  }

  // ============= AUDIT FUNCTIONALITY =============

  /**
   * Get audit log activities (SUPERVISOR_TEACHER, ADMIN)
   */
  static async getAuditActivities(filters?: AuditFiltersDto): Promise<{
    activities: AuditLog[]
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
        activities: AuditLog[]
        total: number
        page: number
        limit: number
      }>(`${this.AUDIT_PATH}/activities?${params.toString()}`)
    )
  }

  /**
   * Get audit activity details (SUPERVISOR_TEACHER, ADMIN)
   */
  static async getAuditActivityById(activityId: string): Promise<AuditLog & {
    relatedActivities?: AuditLog[]
    context?: any
  }> {
    return apiRequest(() =>
      apiClient.get<AuditLog & {
        relatedActivities?: AuditLog[]
        context?: any
      }>(`${this.AUDIT_PATH}/activities/${activityId}`)
    )
  }

  /**
   * Export audit logs (ADMIN only)
   */
  static async exportAuditLogs(filters?: AuditFiltersDto & {
    format?: 'csv' | 'json' | 'excel'
  }): Promise<Blob> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<Blob>(`${this.AUDIT_PATH}/export?${params.toString()}`, {
        responseType: 'blob'
      })
    )
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(filters?: {
    startDate?: string
    endDate?: string
    userId?: string
  }): Promise<{
    totalActivities: number
    activitiesByAction: Record<string, number>
    activitiesByResource: Record<string, number>
    activitiesByUser: Array<{
      userId: string
      userName: string
      count: number
    }>
    dailyActivity: Array<{
      date: string
      count: number
    }>
    riskScore: number
    suspiciousActivities: AuditLog[]
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
        totalActivities: number
        activitiesByAction: Record<string, number>
        activitiesByResource: Record<string, number>
        activitiesByUser: Array<{
          userId: string
          userName: string
          count: number
        }>
        dailyActivity: Array<{
          date: string
          count: number
        }>
        riskScore: number
        suspiciousActivities: AuditLog[]
      }>(`${this.AUDIT_PATH}/stats?${params.toString()}`)
    )
  }

  /**
   * Generate system report (ADMIN only)
   */
  static async generateSystemReport(reportType: 'usage' | 'performance' | 'security' | 'full', filters?: {
    startDate?: string
    endDate?: string
    format?: 'pdf' | 'html' | 'json'
  }): Promise<Blob | {
    report: any
    metadata: {
      generatedAt: string
      reportType: string
      filters: any
    }
  }> {
    const params = new URLSearchParams()
    params.append('type', reportType)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const format = filters?.format || 'json'
    
    if (format === 'json') {
      return apiRequest(() =>
        apiClient.get<{
          report: any
          metadata: {
            generatedAt: string
            reportType: string
            filters: any
          }
        }>(`${this.BASE_PATH}/reports?${params.toString()}`)
      )
    } else {
      return apiRequest(() =>
        apiClient.get<Blob>(`${this.BASE_PATH}/reports?${params.toString()}`, {
          responseType: 'blob'
        })
      )
    }
  }

  /**
   * Manage user sessions (ADMIN only)
   */
  static async getUserSessions(userId?: string): Promise<{
    sessions: Array<{
      id: string
      userId: string
      userName: string
      ipAddress?: string
      userAgent?: string
      isActive: boolean
      createdAt: string
      lastActivity: string
    }>
    total: number
  }> {
    const endpoint = userId 
      ? `${this.BASE_PATH}/sessions/user/${userId}`
      : `${this.BASE_PATH}/sessions`

    return apiRequest(() =>
      apiClient.get<{
        sessions: Array<{
          id: string
          userId: string
          userName: string
          ipAddress?: string
          userAgent?: string
          isActive: boolean
          createdAt: string
          lastActivity: string
        }>
        total: number
      }>(endpoint)
    )
  }

  /**
   * Terminate user session (ADMIN only)
   */
  static async terminateSession(sessionId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/sessions/${sessionId}`)
    )
  }

  /**
   * Terminate all sessions for user (ADMIN only)
   */
  static async terminateAllUserSessions(userId: string): Promise<{
    message: string
    terminatedSessions: number
  }> {
    return apiRequest(() =>
      apiClient.delete<{
        message: string
        terminatedSessions: number
      }>(`${this.BASE_PATH}/sessions/user/${userId}/all`)
    )
  }

  /**
   * Send system announcement (ADMIN only)
   */
  static async sendSystemAnnouncement(announcement: {
    title: string
    message: string
    type: 'info' | 'warning' | 'maintenance' | 'emergency'
    targetRoles?: string[]
    targetUsers?: string[]
    expiresAt?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  }): Promise<{
    sent: number
    failed: number
    announcementId: string
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: number
        failed: number
        announcementId: string
      }>(`${this.BASE_PATH}/announcements`, announcement)
    )
  }

  /**
   * Get system maintenance status
   */
  static async getMaintenanceStatus(): Promise<{
    isInMaintenance: boolean
    maintenanceWindow?: {
      startTime: string
      endTime: string
      reason: string
      affectedServices: string[]
    }
    upcomingMaintenance?: Array<{
      scheduledTime: string
      duration: number
      reason: string
      affectedServices: string[]
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        isInMaintenance: boolean
        maintenanceWindow?: {
          startTime: string
          endTime: string
          reason: string
          affectedServices: string[]
        }
        upcomingMaintenance?: Array<{
          scheduledTime: string
          duration: number
          reason: string
          affectedServices: string[]
        }>
      }>(`${this.BASE_PATH}/maintenance`)
    )
  }
}