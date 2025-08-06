// Course data types

export interface Course {
  id: string
  code: string
  name: string
  description: string
  credits: number
  
  // Schedule Information
  schedule: {
    days: string[]
    startTime: string
    endTime: string
    location: string
    building?: string
    room?: string
  }
  
  // Instructor Information
  instructor: {
    id: string
    name: string
    email: string
    avatar?: string
    office?: string
    officeHours?: string
  }
  
  // Course Details
  semester: string
  year: number
  capacity: number
  enrolled: number
  status: string
  
  // Academic Information
  prerequisites?: string[]
  category: string
  department: string
  level: string
  
  // Dates
  startDate: string
  endDate: string
  enrollmentDeadline?: string
  
  // Course Content
  syllabus?: string
  materials?: CourseMaterial[]
  
  // Progress (for enrolled students)
  progress?: {
    completed: number
    total: number
    currentGrade?: number
    attendance?: number
  }
}

export interface CourseMaterial {
  id: string
  title: string
  type: string
  url?: string
  downloadUrl?: string
  description?: string
  uploadDate: string
  size?: string
  fileSize?: string
  isRequired?: boolean
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  type: string
  
  // Timing
  assignedDate: string
  dueDate: string
  submissionDate?: string
  
  // Grading
  maxPoints: number
  earnedPoints?: number
  grade?: string
  feedback?: string
  
  // Status
  status: string
  isGroupWork: boolean
  
  // Files
  attachments?: CourseMaterial[]
  submission?: {
    files: string[]
    text?: string
    submittedAt: string
  }
}

export interface Grade {
  id: string
  courseId?: string
  courseName?: string
  assignmentId?: string
  assignmentTitle: string
  
  // Grade Information
  letterGrade: string
  score: number
  maxPoints: number
  percentage?: number
  
  // Dates
  gradedDate: string
  gradingPeriod?: string
  
  // Additional Info
  feedback?: string
  isExtraCredit?: boolean
  weight?: number
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  enrollmentDate: string
  status: string
  finalGrade?: string
  finalPoints?: number
}

// API Response Types
export interface CoursesResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
}

export interface CourseFilters {
  department?: string
  instructor?: string
  semester?: string
  year?: number
  status?: string
  level?: string
  search?: string
}

// Detailed course view interfaces
export interface CourseModule {
  id: string
  title: string
  description: string
  order: number
  isCompleted: boolean
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  type: string
  duration?: string
  isCompleted: boolean
  url?: string
}

export interface CourseAnnouncement {
  id: string
  title: string
  content: string
  date: string
  author: string
  priority?: 'low' | 'medium' | 'high'
  isImportant?: boolean
}

export interface Quiz {
  id: string
  title: string
  description: string
  duration: string
  totalQuestions: number
  maxPoints: number
  dueDate: string
  isTimed: boolean
  attemptsAllowed: number
  attemptsUsed: number
}

export interface CourseDetailedView extends Course {
  modules: CourseModule[]
  announcements: CourseAnnouncement[]
  upcomingDeadlines: Assignment[]
  recentGrades: Grade[]
  openQuizzes: Quiz[]
}