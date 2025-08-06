import { apiClient, apiRequest } from './config'
import type {
  Notification,
  CreateNotificationDto,
  NotificationFiltersDto,
  NotificationPriority,
  UserRole
} from './types'
import { NotificationType } from './types'

/**
 * Notifications API Service
 * Handles notification management, real-time updates, and communication
 */
export class NotificationsAPI {
  private static readonly BASE_PATH = '/notifications'

  /**
   * Create notification (TEACHER, SUPERVISOR_TEACHER, ADMIN)
   */
  static async createNotification(notificationData: CreateNotificationDto): Promise<Notification> {
    return apiRequest(() =>
      apiClient.post<Notification>(this.BASE_PATH, notificationData)
    )
  }

  /**
   * Get user's notifications (all authenticated users)
   */
  static async getMyNotifications(filters?: NotificationFiltersDto): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
    page: number
    limit: number
  }> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{
        notifications: Notification[]
        total: number
        unreadCount: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/my?${params.toString()}`)
    )
  }

  /**
   * Get notification by ID
   */
  static async getNotificationById(notificationId: string): Promise<Notification> {
    return apiRequest(() =>
      apiClient.get<Notification>(`${this.BASE_PATH}/${notificationId}`)
    )
  }

  /**
   * Mark notification as read (all authenticated users - notification recipient)
   */
  static async markAsRead(notificationId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`${this.BASE_PATH}/${notificationId}/read`)
    )
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: string[]): Promise<{ 
    updated: number
    failed: string[]
  }> {
    return apiRequest(() =>
      apiClient.put<{ 
        updated: number
        failed: string[]
      }>(`${this.BASE_PATH}/bulk-read`, { notificationIds })
    )
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ message: string; updated: number }> {
    return apiRequest(() =>
      apiClient.put<{ message: string; updated: number }>(`${this.BASE_PATH}/read-all`)
    )
  }

  /**
   * Delete notification (SUPERVISOR_TEACHER, ADMIN - notification creator)
   */
  static async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${notificationId}`)
    )
  }

  /**
   * Delete multiple notifications
   */
  static async deleteMultipleNotifications(notificationIds: string[]): Promise<{ 
    deleted: number
    failed: string[]
  }> {
    return apiRequest(() =>
      apiClient.delete<{ 
        deleted: number
        failed: string[]
      }>(`${this.BASE_PATH}/bulk-delete`, { data: { notificationIds } })
    )
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(filters?: {
    type?: NotificationType
    priority?: NotificationPriority
  }): Promise<{ count: number }> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    return apiRequest(() =>
      apiClient.get<{ count: number }>(`${this.BASE_PATH}/unread-count?${params.toString()}`)
    )
  }

  /**
   * Send notification to specific users
   */
  static async sendToUsers(userIds: string[], notificationData: Omit<CreateNotificationDto, 'targetUserIds'>): Promise<{
    sent: number
    failed: Array<{ userId: string; error: string }>
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: number
        failed: Array<{ userId: string; error: string }>
      }>(`${this.BASE_PATH}/send-to-users`, {
        ...notificationData,
        targetUserIds: userIds
      })
    )
  }

  /**
   * Send notification to users by role
   */
  static async sendToRole(roles: UserRole[], notificationData: Omit<CreateNotificationDto, 'targetRoles'>): Promise<{
    sent: number
    totalTargeted: number
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: number
        totalTargeted: number
      }>(`${this.BASE_PATH}/send-to-role`, {
        ...notificationData,
        targetRoles: roles
      })
    )
  }

  /**
   * Send course announcement
   */
  static async sendCourseAnnouncement(courseId: string, notificationData: {
    title: string
    message: string
    priority?: NotificationPriority
    metadata?: any
  }): Promise<{
    sent: number
    totalStudents: number
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: number
        totalStudents: number
      }>(`${this.BASE_PATH}/course-announcement`, {
        ...notificationData,
        courseId,
        type: NotificationType.COURSE_ANNOUNCEMENT
      })
    )
  }

  /**
   * Send assignment due reminder
   */
  static async sendAssignmentReminder(assignmentId: string, customMessage?: string): Promise<{
    sent: number
    totalStudents: number
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: number
        totalStudents: number
      }>(`${this.BASE_PATH}/assignment-reminder`, {
        assignmentId,
        customMessage
      })
    )
  }

  /**
   * Send grade notification
   */
  static async sendGradeNotification(gradeId: string, customMessage?: string): Promise<{
    sent: boolean
    studentId: string
  }> {
    return apiRequest(() =>
      apiClient.post<{
        sent: boolean
        studentId: string
      }>(`${this.BASE_PATH}/grade-notification`, {
        gradeId,
        customMessage
      })
    )
  }

  /**
   * Get notification templates (for creating consistent notifications)
   */
  static async getNotificationTemplates(type?: NotificationType): Promise<{
    templates: Array<{
      id: string
      type: NotificationType
      title: string
      messageTemplate: string
      priority: NotificationPriority
      variables: string[]
    }>
  }> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)

    return apiRequest(() =>
      apiClient.get<{
        templates: Array<{
          id: string
          type: NotificationType
          title: string
          messageTemplate: string
          priority: NotificationPriority
          variables: string[]
        }>
      }>(`${this.BASE_PATH}/templates?${params.toString()}`)
    )
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(preferences: {
    emailNotifications?: boolean
    pushNotifications?: boolean
    smsNotifications?: boolean
    notificationTypes?: {
      [key in NotificationType]?: boolean
    }
    priorities?: {
      [key in NotificationPriority]?: boolean
    }
  }): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.put<{ message: string }>(`${this.BASE_PATH}/preferences`, preferences)
    )
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(): Promise<{
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    notificationTypes: {
      [key in NotificationType]: boolean
    }
    priorities: {
      [key in NotificationPriority]: boolean
    }
  }> {
    return apiRequest(() =>
      apiClient.get<{
        emailNotifications: boolean
        pushNotifications: boolean
        smsNotifications: boolean
        notificationTypes: {
          [key in NotificationType]: boolean
        }
        priorities: {
          [key in NotificationPriority]: boolean
        }
      }>(`${this.BASE_PATH}/preferences`)
    )
  }

  /**
   * Get notification statistics (for administrators)
   */
  static async getNotificationStats(filters?: {
    startDate?: string
    endDate?: string
    type?: NotificationType
    priority?: NotificationPriority
  }): Promise<{
    totalSent: number
    totalRead: number
    readRate: number
    typeDistribution: { [key in NotificationType]: number }
    priorityDistribution: { [key in NotificationPriority]: number }
    dailyStats: Array<{
      date: string
      sent: number
      read: number
    }>
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
        totalSent: number
        totalRead: number
        readRate: number
        typeDistribution: { [key in NotificationType]: number }
        priorityDistribution: { [key in NotificationPriority]: number }
        dailyStats: Array<{
          date: string
          sent: number
          read: number
        }>
      }>(`${this.BASE_PATH}/stats?${params.toString()}`)
    )
  }
}