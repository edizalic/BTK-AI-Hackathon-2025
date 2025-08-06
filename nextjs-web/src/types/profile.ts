// Profile data types

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  
  // Personal Information
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth?: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  
  // Academic Information (for students)
  academicInfo?: {
    studentId: string
    advisoryTeacher?: string
    grade: string
    gpa: number
    enrollmentDate: string
    graduationDate?: string
    major?: string
    minor?: string
  }
  
  // Professional Information (for teachers)
  professionalInfo?: {
    employeeId: string
    department: string
    position: string
    hireDate: string
    specialization: string[]
    officeLocation?: string
  }
  
  // Settings & Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'limited'
      showEmail: boolean
      showPhone: boolean
    }
  }
  
  // Activity & Stats
  activity: {
    lastLogin: string
    totalLogins: number
    accountCreated: string
    isActive: boolean
  }
  
  // Emergency Contact (for students)
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  
  // Advisory Teacher (for students)
  advisoryTeacher?: {
    name: string
    email: string
    phone?: string
    office?: string
    officeHours?: string
    department?: string
  }
}

export interface ProfileUpdateRequest {
  personalInfo?: Partial<UserProfile['personalInfo']>
  academicInfo?: Partial<UserProfile['academicInfo']>
  professionalInfo?: Partial<UserProfile['professionalInfo']>
  preferences?: Partial<UserProfile['preferences']>
  emergencyContact?: Partial<UserProfile['emergencyContact']>
}

export interface ProfileStats {
  coursesEnrolled?: number
  coursesCompleted?: number
  averageGrade?: number
  attendanceRate?: number
  assignmentsCompleted?: number
  assignmentsPending?: number
  
  // For teachers
  coursesTeaching?: number
  studentsManaged?: number
  averageClassGrade?: number
}