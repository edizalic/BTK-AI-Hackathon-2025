//=====================================
// USER TYPES
//=====================================

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER', 
  SUPERVISOR_TEACHER = 'SUPERVISOR_TEACHER',
  ADMIN = 'ADMIN'
}

export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM'
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  LIMITED = 'LIMITED'
}

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  avatar?: string
  isSupervisor: boolean
  profile?: UserProfile
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  
  // Student fields
  studentId?: string
  grade?: string
  gpa?: number
  enrollmentDate?: string
  graduationDate?: string
  major?: string
  minor?: string
  
  // Teacher fields
  employeeId?: string
  department?: string
  position?: string
  hireDate?: string
  specialization?: string[]
  officeLocation?: string
  officeHours?: string
  
  // Advisory relationship
  advisoryTeacherId?: string
  advisoryTeacher?: User
  
  // Emergency contact
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  emergencyContactEmail?: string
  
  // Preferences
  theme: ThemeMode
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  profileVisibility: Visibility
  showEmail: boolean
  showPhone: boolean
  
  createdAt: string
  updatedAt: string
}

//=====================================
// AUTHENTICATION TYPES
//=====================================

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: UserRole
    isSupervisor: boolean
    profile?: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordDto {
  newPassword: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: string
  isActive: boolean
  ipAddress?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

//=====================================
// USER MANAGEMENT TYPES  
//=====================================

export interface CreateStudentDto {
  email: string
  password: string
  firstName: string
  lastName: string
  grade?: string
  major?: string
  minor?: string
  enrollmentDate?: string
  studentId: string
  advisoryTeacherId?: string
}

export interface CreateTeacherDto {
  email: string
  password: string
  firstName: string
  lastName: string
  department: string
  specialization: string[]
  employeeId: string
  position?: string
  hireDate?: string
}

export interface CreateSupervisorDto {
  email: string
  password: string
  firstName: string
  lastName: string
  department: string
  specialization: string[]
  employeeId: string
  position?: string
  hireDate?: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  phone?: string
  department?: string
  position?: string
  specialization?: string[]
  grade?: string
  major?: string
  minor?: string
}

export interface UserFiltersDto {
  role?: UserRole
  department?: string
  isActive?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface AssignAdvisoryDto {
  advisoryTeacherId: string
  notes?: string
}

//=====================================
// COURSE TYPES
//=====================================

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED', 
  CANCELLED = 'CANCELLED',
  UPCOMING = 'UPCOMING',
  DRAFT = 'DRAFT'
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  PENDING = 'PENDING',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Course {
  id: string
  code: string
  name: string
  description: string
  credits: number
  scheduleDays: string[]
  startTime: string
  endTime: string
  location: string
  building?: string
  room?: string
  createdById: string
  createdBy: User
  instructorId: string
  instructor: User
  semester: string
  year: number
  capacity: number
  enrolled: number
  status: CourseStatus
  category: string
  departmentId: string
  level: CourseLevel
  startDate: string
  endDate: string
  enrollmentDeadline?: string
  syllabusUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCourseDto {
  code: string
  name: string
  description: string
  credits: number
  scheduleDays: string[]
  startTime: string
  endTime: string
  location: string
  building?: string
  room?: string
  instructorId: string
  semester: string
  year: number
  capacity: number
  category: string
  departmentId: string
  level: CourseLevel
  startDate: string
  endDate: string
  enrollmentDeadline?: string
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface EnrollStudentDto {
  studentId: string
}

//=====================================
// STUDY PLAN TYPES
//=====================================

export interface StudyPlanWeek {
  week: string
  description: string
}

export interface StudyPlan {
  id: string
  courseId: string
  weeks: StudyPlanWeek[]
  createdById: string
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface CreateStudyPlanDto {
  weeks: StudyPlanWeek[]
}

export interface UpdateStudyPlanDto {
  weeks: StudyPlanWeek[]
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  student: User
  course: Course
  enrolledById: string
  enrolledBy: User
  enrollmentDate: string
  status: EnrollmentStatus
  finalGrade?: string
  finalPoints?: number
  completed: number
  total: number
  currentGrade?: number
  attendance?: number
  createdAt: string
  updatedAt: string
}

//=====================================
// ASSIGNMENT TYPES
//=====================================

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT', 
  ESSAY = 'ESSAY',
  LAB = 'LAB',
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  PRESENTATION = 'PRESENTATION',
  DISCUSSION = 'DISCUSSION',
  PARTICIPATION = 'PARTICIPATION'
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  SUBMITTED = 'SUBMITTED', 
  GRADED = 'GRADED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Assignment {
  id: string
  courseId: string
  course: Course
  createdById: string
  createdBy: User
  title: string
  description: string
  type: AssignmentType
  assignedDate: string
  dueDate: string
  maxPoints: number
  isGroupWork: boolean
  status: AssignmentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentDto {
  courseId: string
  title: string
  description: string
  type: AssignmentType
  dueDate: string
  maxPoints: number
  isGroupWork?: boolean
  attachmentIds?: string[]
}

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {}

export interface SubmitAssignmentDto {
  content?: string
  fileIds?: string[]
  notes?: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  assignment: Assignment
  student: User
  submittedAt: string
  textContent?: string
  createdAt: string
  updatedAt: string
}

//=====================================
// GRADE TYPES
//=====================================

export interface Grade {
  id: string
  studentId: string
  courseId?: string
  assignmentId?: string
  submissionId?: string
  student: User
  course?: Course
  assignment?: Assignment
  submission?: AssignmentSubmission
  letterGrade: string
  score: number
  maxPoints: number
  percentage?: number
  gradedById: string
  gradedBy: User
  gradedDate: string
  gradingPeriod?: string
  feedback?: string
  isExtraCredit: boolean
  weight?: number
  createdAt: string
  updatedAt: string
}

export interface CreateGradeDto {
  letterGrade: string
  score: number
  maxPoints: number
  feedback?: string
  isExtraCredit?: boolean
  weight?: number
}

export interface UpdateGradeDto extends Partial<CreateGradeDto> {}

export interface GradeFiltersDto {
  courseId?: string
  semester?: string
  year?: number
  limit?: number
  offset?: number
}

//=====================================
// COURSE MATERIALS TYPES
//=====================================

export enum MaterialType {
  SYLLABUS = 'SYLLABUS',
  SLIDES = 'SLIDES',
  HANDOUT = 'HANDOUT',
  READING = 'READING',
  REFERENCE = 'REFERENCE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  LINK = 'LINK',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER'
}

export interface CourseMaterial {
  id: string
  courseId: string
  course: Course
  uploadedById: string
  uploadedBy: User
  title: string
  description?: string
  type: MaterialType
  uploadDate: string
  isRequired: boolean
  fileId?: string
  url?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMaterialDto {
  title: string
  description?: string
  type: MaterialType
  isRequired?: boolean
  url?: string
}

export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {}

//=====================================
// QUIZ TYPES
//=====================================

export interface Quiz {
  id: string
  courseId: string
  course: Course
  createdById: string
  createdBy: User
  title: string
  description: string
  duration: string
  totalQuestions: number
  maxPoints: number
  dueDate: string
  isTimed: boolean
  attemptsAllowed: number
  createdAt: string
  updatedAt: string
}

export interface CreateQuizDto {
  courseId: string
  title: string
  description: string
  duration: string
  totalQuestions: number
  maxPoints: number
  dueDate: string
  isTimed?: boolean
  attemptsAllowed?: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  quiz: Quiz
  student: User
  startedAt: string
  submittedAt?: string
  score?: number
  maxPoints?: number
  answers: Record<string, any>
}

export interface SubmitQuizAnswersDto {
  answers: Record<string, any>
}

//=====================================
// NOTIFICATION TYPES
//=====================================

export enum NotificationType {
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  GRADE_POSTED = 'GRADE_POSTED',
  COURSE_ANNOUNCEMENT = 'COURSE_ANNOUNCEMENT',
  ENROLLMENT_CONFIRMED = 'ENROLLMENT_CONFIRMED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  REMINDER = 'REMINDER',
  MESSAGE = 'MESSAGE'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Notification {
  id: string
  userId: string
  user: User
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  readAt?: string
  courseId?: string
  assignmentId?: string
  gradeId?: string
  metadata?: any
  createdAt: string
}

export interface CreateNotificationDto {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  targetUserIds?: string[]
  targetRoles?: UserRole[]
  relatedEntityId?: string
  relatedEntityType?: string
  scheduledFor?: string
  metadata?: any
}

export interface NotificationFiltersDto {
  isRead?: boolean
  type?: NotificationType
  priority?: NotificationPriority
  limit?: number
  offset?: number
}

//=====================================
// FILE TYPES
//=====================================

export interface FileAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  path: string
  uploadedById: string
  uploadedBy: User
  createdAt: string
}

export interface UploadFileResponse {
  id: string
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  path: string
}

//=====================================
// PAGE CONFIGURATION TYPES
//=====================================

export interface PageConfiguration {
  id: string
  title: string
  description?: string
  userType?: UserRole
  layoutType: string
  layoutClass?: string
  sections: any
  requiresAuth: boolean
  permissions: string[]
  requiresSupervisor: boolean
  createdAt: string
  updatedAt: string
}

//=====================================
// ADMIN TYPES
//=====================================

export interface SystemStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalSupervisors: number
  totalCourses: number
  totalAssignments: number
  totalSubmissions: number
}

export interface AuditLog {
  id: string
  userId?: string
  user?: User
  action: string
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditFiltersDto {
  userId?: string
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}