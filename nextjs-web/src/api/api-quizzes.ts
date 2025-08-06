import { apiClient, apiRequest } from './config'
import type {
  Quiz,
  CreateQuizDto,
  QuizAttempt,
  SubmitQuizAnswersDto
} from './types'

/**
 * Quizzes API Service
 * Handles quiz creation, attempts, and quiz-related functionality
 */
export class QuizzesAPI {
  private static readonly BASE_PATH = '/quizzes'
  private static readonly ATTEMPTS_PATH = '/quiz-attempts'

  /**
   * Create quiz (TEACHER, SUPERVISOR_TEACHER)
   */
  static async createQuiz(quizData: CreateQuizDto): Promise<Quiz> {
    return apiRequest(() =>
      apiClient.post<Quiz>(this.BASE_PATH, quizData)
    )
  }

  /**
   * Get course quizzes (all authenticated users)
   */
  static async getCourseQuizzes(courseId: string, filters?: {
    isActive?: boolean
    availableOnly?: boolean  // Only quizzes that can be taken now
    completedOnly?: boolean  // Only quizzes user has completed
    limit?: number
    offset?: number
  }): Promise<{
    quizzes: Quiz[]
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
        quizzes: Quiz[]
        total: number
        page: number
        limit: number
      }>(`${this.BASE_PATH}/course/${courseId}?${params.toString()}`)
    )
  }

  /**
   * Get quiz details (all authenticated users)
   */
  static async getQuizById(quizId: string): Promise<Quiz & {
    userAttempts?: QuizAttempt[]
    canAttempt?: boolean
    attemptsRemaining?: number
    questions?: Array<{
      id: string
      type: string
      question: string
      options?: string[]
      points: number
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<Quiz & {
        userAttempts?: QuizAttempt[]
        canAttempt?: boolean
        attemptsRemaining?: number
        questions?: Array<{
          id: string
          type: string
          question: string
          options?: string[]
          points: number
        }>
      }>(`${this.BASE_PATH}/${quizId}`)
    )
  }

  /**
   * Update quiz (TEACHER, SUPERVISOR_TEACHER - creator)
   */
  static async updateQuiz(quizId: string, quizData: Partial<CreateQuizDto>): Promise<Quiz> {
    return apiRequest(() =>
      apiClient.put<Quiz>(`${this.BASE_PATH}/${quizId}`, quizData)
    )
  }

  /**
   * Delete quiz (TEACHER, SUPERVISOR_TEACHER - creator)
   */
  static async deleteQuiz(quizId: string): Promise<{ message: string }> {
    return apiRequest(() =>
      apiClient.delete<{ message: string }>(`${this.BASE_PATH}/${quizId}`)
    )
  }

  /**
   * Get quiz attempts (TEACHER, SUPERVISOR_TEACHER)
   */
  static async getQuizAttempts(quizId: string, filters?: {
    studentId?: string
    completedOnly?: boolean
    minScore?: number
    maxScore?: number
    attemptedAfter?: string
    attemptedBefore?: string
    limit?: number
    offset?: number
  }): Promise<{
    attempts: QuizAttempt[]
    total: number
    statistics: {
      totalAttempts: number
      completedAttempts: number
      averageScore: number
      highestScore: number
      lowestScore: number
      passRate: number
    }
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
        attempts: QuizAttempt[]
        total: number
        statistics: {
          totalAttempts: number
          completedAttempts: number
          averageScore: number
          highestScore: number
          lowestScore: number
          passRate: number
        }
        page: number
        limit: number
      }>(`${this.BASE_PATH}/${quizId}/attempts?${params.toString()}`)
    )
  }

  // ============= QUIZ ATTEMPTS =============

  /**
   * Start quiz attempt (STUDENT only)
   */
  static async startQuizAttempt(quizId: string): Promise<QuizAttempt & {
    questions: Array<{
      id: string
      type: string
      question: string
      options?: string[]
      points: number
      order: number
    }>
    timeRemaining?: number
  }> {
    return apiRequest(() =>
      apiClient.post<QuizAttempt & {
        questions: Array<{
          id: string
          type: string
          question: string
          options?: string[]
          points: number
          order: number
        }>
        timeRemaining?: number
      }>(`${this.ATTEMPTS_PATH}/start/${quizId}`)
    )
  }

  /**
   * Submit quiz answers (STUDENT only - attempt owner)
   */
  static async submitQuizAttempt(attemptId: string, answers: SubmitQuizAnswersDto): Promise<QuizAttempt & {
    score: number
    maxPoints: number
    percentage: number
    passed: boolean
    feedback?: string
    correctAnswers?: Record<string, any>
  }> {
    return apiRequest(() =>
      apiClient.post<QuizAttempt & {
        score: number
        maxPoints: number
        percentage: number
        passed: boolean
        feedback?: string
        correctAnswers?: Record<string, any>
      }>(`${this.ATTEMPTS_PATH}/${attemptId}/submit`, answers)
    )
  }

  /**
   * Get student's quiz attempts (STUDENT only)
   */
  static async getMyQuizAttempts(quizId: string): Promise<{
    attempts: QuizAttempt[]
    bestScore?: number
    attemptsRemaining: number
    canRetake: boolean
  }> {
    return apiRequest(() =>
      apiClient.get<{
        attempts: QuizAttempt[]
        bestScore?: number
        attemptsRemaining: number
        canRetake: boolean
      }>(`${this.ATTEMPTS_PATH}/quiz/${quizId}/my-attempts`)
    )
  }

  /**
   * Get quiz attempt details (STUDENT - owner, TEACHER, SUPERVISOR_TEACHER)
   */
  static async getQuizAttemptById(attemptId: string): Promise<QuizAttempt & {
    score?: number
    maxPoints?: number
    percentage?: number
    passed?: boolean
    feedback?: string
    answers: Record<string, any>
    correctAnswers?: Record<string, any>
    questionDetails?: Array<{
      id: string
      question: string
      userAnswer: any
      correctAnswer?: any
      isCorrect?: boolean
      points: number
      earnedPoints: number
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<QuizAttempt & {
        score?: number
        maxPoints?: number
        percentage?: number
        passed?: boolean
        feedback?: string
        answers: Record<string, any>
        correctAnswers?: Record<string, any>
        questionDetails?: Array<{
          id: string
          question: string
          userAnswer: any
          correctAnswer?: any
          isCorrect?: boolean
          points: number
          earnedPoints: number
        }>
      }>(`${this.ATTEMPTS_PATH}/${attemptId}`)
    )
  }

  /**
   * Save quiz progress (auto-save during quiz)
   */
  static async saveQuizProgress(attemptId: string, answers: Partial<Record<string, any>>): Promise<{
    saved: boolean
    timeRemaining?: number
  }> {
    return apiRequest(() =>
      apiClient.put<{
        saved: boolean
        timeRemaining?: number
      }>(`${this.ATTEMPTS_PATH}/${attemptId}/progress`, { answers })
    )
  }

  /**
   * Get quiz time remaining
   */
  static async getTimeRemaining(attemptId: string): Promise<{
    timeRemaining: number
    isExpired: boolean
  }> {
    return apiRequest(() =>
      apiClient.get<{
        timeRemaining: number
        isExpired: boolean
      }>(`${this.ATTEMPTS_PATH}/${attemptId}/time-remaining`)
    )
  }

  /**
   * Extend quiz time (for special circumstances - TEACHER, SUPERVISOR_TEACHER)
   */
  static async extendQuizTime(attemptId: string, extensionMinutes: number, reason: string): Promise<{
    newTimeRemaining: number
    message: string
  }> {
    return apiRequest(() =>
      apiClient.post<{
        newTimeRemaining: number
        message: string
      }>(`${this.ATTEMPTS_PATH}/${attemptId}/extend-time`, {
        extensionMinutes,
        reason
      })
    )
  }

  /**
   * Get quiz statistics for teachers
   */
  static async getQuizStats(quizId: string): Promise<{
    totalAttempts: number
    uniqueStudents: number
    completionRate: number
    averageScore: number
    averageTime: number
    scoreDistribution: Record<string, number>
    questionAnalysis: Array<{
      questionId: string
      question: string
      correctRate: number
      averageTime: number
      commonWrongAnswers: Array<{
        answer: string
        count: number
      }>
    }>
    difficultQuestions: Array<{
      questionId: string
      question: string
      correctRate: number
    }>
  }> {
    return apiRequest(() =>
      apiClient.get<{
        totalAttempts: number
        uniqueStudents: number
        completionRate: number
        averageScore: number
        averageTime: number
        scoreDistribution: Record<string, number>
        questionAnalysis: Array<{
          questionId: string
          question: string
          correctRate: number
          averageTime: number
          commonWrongAnswers: Array<{
            answer: string
            count: number
          }>
        }>
        difficultQuestions: Array<{
          questionId: string
          question: string
          correctRate: number
        }>
      }>(`${this.BASE_PATH}/${quizId}/stats`)
    )
  }

  /**
   * Clone quiz to another course
   */
  static async cloneQuiz(quizId: string, targetCourseId: string, modifications?: Partial<CreateQuizDto>): Promise<Quiz> {
    return apiRequest(() =>
      apiClient.post<Quiz>(`${this.BASE_PATH}/${quizId}/clone`, {
        targetCourseId,
        modifications
      })
    )
  }

  /**
   * Export quiz results to CSV
   */
  static async exportQuizResults(quizId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    return apiRequest(() =>
      apiClient.get<Blob>(`${this.BASE_PATH}/${quizId}/export?format=${format}`, {
        responseType: 'blob'
      })
    )
  }

  /**
   * Grade quiz manually (for essay questions, etc.)
   */
  static async gradeQuizManually(attemptId: string, grading: {
    questionGrades: Record<string, {
      points: number
      feedback?: string
    }>
    overallFeedback?: string
  }): Promise<QuizAttempt & {
    score: number
    maxPoints: number
    percentage: number
    passed: boolean
  }> {
    return apiRequest(() =>
      apiClient.post<QuizAttempt & {
        score: number
        maxPoints: number
        percentage: number
        passed: boolean
      }>(`${this.ATTEMPTS_PATH}/${attemptId}/grade`, grading)
    )
  }

  /**
   * Get pending grading (quizzes with essay questions)
   */
  static async getPendingGrading(courseId?: string): Promise<{
    attempts: Array<QuizAttempt & {
      quiz: Quiz
      student: {
        id: string
        name: string
        email: string
      }
      pendingQuestions: Array<{
        id: string
        question: string
        answer: string
        maxPoints: number
      }>
    }>
    total: number
  }> {
    const params = new URLSearchParams()
    if (courseId) params.append('courseId', courseId)

    return apiRequest(() =>
      apiClient.get<{
        attempts: Array<QuizAttempt & {
          quiz: Quiz
          student: {
            id: string
            name: string
            email: string
          }
          pendingQuestions: Array<{
            id: string
            question: string
            answer: string
            maxPoints: number
          }>
        }>
        total: number
      }>(`${this.ATTEMPTS_PATH}/pending-grading?${params.toString()}`)
    )
  }
}