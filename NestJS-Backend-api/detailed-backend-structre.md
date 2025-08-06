# NestJS Education Management System Backend

## 📊 Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============= USER MANAGEMENT =============

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed password
  role      UserRole
  isActive  Boolean  @default(true)
  avatar    String?
  
  // Teacher-specific fields
  isSupervisor Boolean @default(false) // Only applies to TEACHER role
  
  // Profile information
  profile   UserProfile?
  
  // Academic relationships (if student)
  studentEnrollments     Enrollment[]           @relation("StudentEnrollments")
  assignmentSubmissions  AssignmentSubmission[]
  quizAttempts          QuizAttempt[]
  grades                Grade[]
  
  // Teaching relationships (BOTH teachers AND supervisors)
  taughtCourses         Course[]               @relation("CourseInstructor")
  advisoryStudents      UserProfile[]          @relation("AdvisoryTeacher")
  gradedAssignments     Grade[]                @relation("GradedBy")
  courseAnnouncements   CourseAnnouncement[]
  createdAssignments    Assignment[]           @relation("AssignmentCreator")
  createdQuizzes        Quiz[]                 @relation("QuizCreator")
  uploadedMaterials     CourseMaterial[]       @relation("MaterialUploader")
  
  // Supervisor-specific relationships (only supervisors)
  createdCourses        Course[]               @relation("CourseCreator")
  registeredTeachers    User[]                 @relation("TeacherRegisteredBy")
  registeredStudents    User[]                 @relation("StudentRegisteredBy")
  assignedTeachers      TeacherCourseAssignment[] @relation("AssignedBy")
  assignedAdvisories    AdvisoryAssignment[]   @relation("AdvisoryAssignedBy")
  managedDepartments    Department[]           @relation("DepartmentHead")
  
  // Registration tracking
  teacherRegisteredById String?
  teacherRegisteredBy   User?                  @relation("TeacherRegisteredBy", fields: [teacherRegisteredById], references: [id])
  studentRegisteredById String?
  studentRegisteredBy   User?                  @relation("StudentRegisteredBy", fields: [studentRegisteredById], references: [id])
  
  // Activity tracking
  userActivity          UserActivity[]
  
  // File uploads
  uploadedFiles         FileAttachment[]       @relation("UploadedBy")
  
  // Audit logs
  auditLogs             AuditLog[]
  
  // Enrollment management
  enrollmentsManaged    Enrollment[]           @relation("EnrolledBy")
  
  // Notifications
  notifications         Notification[]
  
  // Sessions
  sessions              Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}

model UserProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Personal Information
  firstName   String
  lastName    String
  dateOfBirth DateTime?
  phone       String?
  
  // Address
  street   String?
  city     String?
  state    String?
  zipCode  String?
  country  String?
  
  // Academic Info (for students)
  studentId        String?
  grade           String?
  gpa             Float?
  enrollmentDate  DateTime?
  graduationDate  DateTime?
  major           String?
  minor           String?
  
  // Professional Info (for teachers) 
  employeeId       String?
  department       String?
  position         String?
  hireDate         DateTime?
  specialization   String[] // Array of specializations
  officeLocation   String?
  officeHours      String?
  
  // Advisory relationship (assigned by supervisor)
  advisoryTeacherId String?
  advisoryTeacher   User?   @relation("AdvisoryTeacher", fields: [advisoryTeacherId], references: [id])
  
  // Emergency Contact
  emergencyContactName         String?
  emergencyContactRelationship String?
  emergencyContactPhone        String?
  emergencyContactEmail        String?
  
  // User Preferences
  theme                 ThemeMode    @default(SYSTEM)
  language             String       @default("en")
  timezone             String       @default("UTC")
  emailNotifications   Boolean      @default(true)
  pushNotifications    Boolean      @default(true)
  smsNotifications     Boolean      @default(false)
  profileVisibility    Visibility   @default(LIMITED)
  showEmail            Boolean      @default(false)
  showPhone            Boolean      @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("user_profiles")
}

model UserActivity {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action    String   // login, logout, view_course, submit_assignment, create_course, register_user, etc.
  details   Json?    // Additional action details
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())
  
  @@map("user_activities")
}

// ============= PERMISSIONS & ROLES =============

model Permission {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  category    String? // course_management, user_management, system_admin, etc.
  
  // Role permissions
  rolePermissions RolePermission[]
  
  createdAt DateTime @default(now())
  
  @@map("permissions")
}

model RolePermission {
  id           String @id @default(cuid())
  role         UserRole
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  // Additional constraints
  requiresSupervisor Boolean  @default(false) // For teacher role permissions
  
  @@unique([role, permissionId])
  @@map("role_permissions")
}

// ============= ACADEMIC STRUCTURE =============

model Department {
  id          String   @id @default(cuid())
  name        String   @unique
  code        String   @unique
  description String?
  
  // Department head (supervisor teacher)
  departmentHeadId String?
  departmentHead   User?   @relation("DepartmentHead", fields: [departmentHeadId], references: [id])
  
  courses     Course[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("departments")
}

model Course {
  id          String @id @default(cuid())
  code        String @unique
  name        String
  description String
  credits     Int
  
  // Schedule
  scheduleDays String[] // ["monday", "wednesday", "friday"]
  startTime    String
  endTime      String
  location     String
  building     String?
  room         String?
  
  // Course creator (supervisor teacher)
  createdById  String
  createdBy    User   @relation("CourseCreator", fields: [createdById], references: [id])
  
  // Assigned instructor (regular teacher or supervisor)
  instructorId String
  instructor   User   @relation("CourseInstructor", fields: [instructorId], references: [id])
  
  // Course details
  semester            String
  year                Int
  capacity            Int
  enrolled            Int      @default(0)
  status              CourseStatus @default(ACTIVE)
  category            String
  departmentId        String
  department          Department @relation(fields: [departmentId], references: [id])
  level               CourseLevel
  
  // Dates
  startDate           DateTime
  endDate             DateTime
  enrollmentDeadline  DateTime?
  
  // Course content
  syllabusUrl         String?
  
  // Prerequisites (many-to-many self-relation)
  prerequisites       Course[] @relation("CoursePrerequisites")
  prerequisiteFor     Course[] @relation("CoursePrerequisites")
  
  // Related entities
  enrollments         Enrollment[]
  assignments         Assignment[]
  courseMaterials     CourseMaterial[]
  quizzes             Quiz[]
  announcements       CourseAnnouncement[]
  classSessions       ClassSession[]
  grades              Grade[]
  teacherAssignments  TeacherCourseAssignment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("courses")
}

model Enrollment {
  id             String @id @default(cuid())
  studentId      String
  courseId       String
  
  student        User   @relation("StudentEnrollments", fields: [studentId], references: [id], onDelete: Cascade)
  course         Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Enrollment managed by supervisor
  enrolledById   String
  enrolledBy     User   @relation("EnrolledBy", fields: [enrolledById], references: [id])
  
  enrollmentDate DateTime @default(now())
  status         EnrollmentStatus @default(ACTIVE)
  finalGrade     String?
  finalPoints    Float?
  
  // Progress tracking
  completed      Int @default(0)
  total          Int @default(0)
  currentGrade   Float?
  attendance     Float?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([studentId, courseId])
  @@map("enrollments")
}

// ============= ASSIGNMENTS & GRADING =============

model Assignment {
  id           String @id @default(cuid())
  courseId     String
  course       Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Creator (can be teacher or supervisor)
  createdById  String
  createdBy    User   @relation("AssignmentCreator", fields: [createdById], references: [id])
  
  title        String
  description  String
  type         AssignmentType
  
  // Timing
  assignedDate     DateTime @default(now())
  dueDate          DateTime
  
  // Grading
  maxPoints        Float
  isGroupWork      Boolean @default(false)
  
  // Status
  status           AssignmentStatus @default(ASSIGNED)
  
  // Related entities
  submissions      AssignmentSubmission[]
  grades           Grade[]
  attachments      FileAttachment[]       @relation("AssignmentAttachments")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("assignments")
}

model AssignmentSubmission {
  id           String @id @default(cuid())
  assignmentId String
  studentId    String
  
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student      User       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  submittedAt  DateTime   @default(now())
  textContent  String?    // Text submission
  
  // File attachments
  files        FileAttachment[] @relation("SubmissionFiles")
  
  // Grading
  grade        Grade?
  
  @@unique([assignmentId, studentId])
  @@map("assignment_submissions")
}

model Grade {
  id              String @id @default(cuid())
  studentId       String
  courseId        String?
  assignmentId    String?
  submissionId    String? @unique
  
  student         User                 @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course          Course?              @relation(fields: [courseId], references: [id])
  assignment      Assignment?          @relation(fields: [assignmentId], references: [id])
  submission      AssignmentSubmission? @relation(fields: [submissionId], references: [id])
  
  // Grade information
  letterGrade     String
  score           Float
  maxPoints       Float
  percentage      Float?
  
  // Grading details (done by teacher or supervisor)
  gradedById      String
  gradedBy        User       @relation("GradedBy", fields: [gradedById], references: [id])
  gradedDate      DateTime   @default(now())
  gradingPeriod   String?
  feedback        String?
  isExtraCredit   Boolean    @default(false)
  weight          Float?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("grades")
}

// ============= COURSE CONTENT =============

model CourseMaterial {
  id          String @id @default(cuid())
  courseId    String
  course      Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Uploader (can be teacher or supervisor)
  uploadedById String
  uploadedBy   User   @relation("MaterialUploader", fields: [uploadedById], references: [id])
  
  title       String
  description String?
  type        MaterialType
  uploadDate  DateTime @default(now())
  isRequired  Boolean  @default(false)
  
  // File reference
  fileId      String?
  file        FileAttachment? @relation(fields: [fileId], references: [id])
  
  // External URL (for links, references)
  url         String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("course_materials")
}

model Quiz {
  id              String @id @default(cuid())
  courseId        String
  course          Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Creator (can be teacher or supervisor)
  createdById     String
  createdBy       User   @relation("QuizCreator", fields: [createdById], references: [id])
  
  title           String
  description     String
  duration        String // "30 minutes", "1 hour"
  totalQuestions  Int
  maxPoints       Float
  dueDate         DateTime
  isTimed         Boolean @default(false)
  attemptsAllowed Int     @default(1)
  
  // Quiz attempts
  attempts        QuizAttempt[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("quizzes")
}

model QuizAttempt {
  id          String @id @default(cuid())
  quizId      String
  studentId   String
  
  quiz        Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  student     User @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  score       Float?
  maxPoints   Float?
  answers     Json     // Store quiz answers as JSON
  
  @@unique([quizId, studentId])
  @@map("quiz_attempts")
}

model CourseAnnouncement {
  id          String @id @default(cuid())
  courseId    String
  authorId    String
  
  course      Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  author      User   @relation(fields: [authorId], references: [id])
  
  title       String
  content     String
  priority    AnnouncementPriority @default(LOW)
  isImportant Boolean              @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("course_announcements")
}

model ClassSession {
  id       String @id @default(cuid())
  courseId String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  date       DateTime
  topic      String
  location   String
  notes      String?
  cancelled  Boolean @default(false)
  
  // Attendance tracking
  attendances StudentAttendance[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("class_sessions")
}

model StudentAttendance {
  id        String @id @default(cuid())
  sessionId String
  studentId String
  
  session   ClassSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student   User         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  status    AttendanceStatus @default(PRESENT)
  notes     String?
  
  createdAt DateTime @default(now())
  
  @@unique([sessionId, studentId])
  @@map("student_attendance")
}

// ============= TEACHER-COURSE ASSIGNMENTS =============

model TeacherCourseAssignment {
  id         String @id @default(cuid())
  teacherId  String
  courseId   String
  assignedById String // Supervisor who made the assignment
  
  teacher    User   @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  course     Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  assignedBy User   @relation("AssignedBy", fields: [assignedById], references: [id])
  
  assignedDate DateTime @default(now())
  isActive     Boolean  @default(true)
  notes        String?
  
  @@unique([teacherId, courseId])
  @@map("teacher_course_assignments")
}

// ============= ADVISORY ASSIGNMENTS =============

model AdvisoryAssignment {
  id               String @id @default(cuid())
  studentId        String
  advisoryTeacherId String
  assignedById     String // Supervisor who made the assignment
  
  student          User @relation(fields: [studentId], references: [id], onDelete: Cascade)
  advisoryTeacher  User @relation(fields: [advisoryTeacherId], references: [id])
  assignedBy       User @relation("AdvisoryAssignedBy", fields: [assignedById], references: [id])
  
  assignedDate DateTime @default(now())
  isActive     Boolean  @default(true)
  notes        String?
  
  @@unique([studentId]) // A student can only have one active advisory teacher
  @@map("advisory_assignments")
}

// ============= FILE MANAGEMENT =============

model FileAttachment {
  id           String @id @default(cuid())
  filename     String
  originalName String
  mimeType     String
  fileSize     BigInt
  path         String // File system path or cloud storage URL
  
  // Upload metadata
  uploadedById String
  uploadedBy   User   @relation("UploadedBy", fields: [uploadedById], references: [id])
  
  // Relations
  courseMaterials      CourseMaterial[]
  assignmentAttachments Assignment[]          @relation("AssignmentAttachments")
  submissionFiles      AssignmentSubmission[] @relation("SubmissionFiles")
  
  createdAt DateTime @default(now())
  
  @@map("file_attachments")
}

// ============= DYNAMIC PAGE SYSTEM =============

model PageConfiguration {
  id          String @id @default(cuid())
  title       String
  description String?
  userType    UserRole?
  layoutType  String @default("dashboard")
  layoutClass String?
  
  // Page sections as JSON
  sections    Json
  
  // Metadata
  requiresAuth      Boolean   @default(true)
  permissions       String[]  // Array of required permissions
  requiresSupervisor Boolean  @default(false) // For teacher-only pages that need supervisor access
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("page_configurations")
}

// ============= NOTIFICATIONS =============

model Notification {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title     String
  message   String
  type      NotificationType
  priority  NotificationPriority @default(NORMAL)
  
  // Status
  isRead    Boolean  @default(false)
  readAt    DateTime?
  
  // Related entities
  courseId     String?
  assignmentId String?
  gradeId      String?
  
  // Metadata
  metadata  Json?
  
  createdAt DateTime @default(now())
  
  @@map("notifications")
}

// ============= SYSTEM ADMINISTRATION =============

model SystemSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String
  type  String @default("string") // string, number, boolean, json
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("system_settings")
}

model AuditLog {
  id       String @id @default(cuid())
  userId   String?
  user     User?  @relation(fields: [userId], references: [id])
  
  action   String // CREATE_COURSE, REGISTER_USER, ASSIGN_TEACHER, ASSIGN_ADVISORY, etc.
  resource String // users, courses, assignments, etc.
  resourceId String?
  
  oldValues Json?
  newValues Json?
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())
  
  @@map("audit_logs")
}

// ============= SESSIONS & AUTHENTICATION =============

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token     String   @unique
  expiresAt DateTime
  isActive  Boolean  @default(true)
  
  // Session metadata
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("sessions")
}

// ============= ENUMS =============

enum UserRole {
  STUDENT           // Can view courses, submit assignments, view grades
  TEACHER           // Can teach assigned courses, grade assignments
  SUPERVISOR_TEACHER // Can do everything teachers can + create courses, register users, assign teachers/advisors
  ADMIN             // Can register supervisor teachers, system-wide management
}

enum ThemeMode {
  LIGHT
  DARK
  SYSTEM
}

enum Visibility {
  PUBLIC
  PRIVATE
  LIMITED
}

enum CourseStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  UPCOMING
  DRAFT
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
  PENDING
  WITHDRAWN
}

enum AssignmentType {
  HOMEWORK
  PROJECT
  ESSAY
  LAB
  QUIZ
  EXAM
  PRESENTATION
  DISCUSSION
  PARTICIPATION
}

enum AssignmentStatus {
  DRAFT
  ASSIGNED
  SUBMITTED
  GRADED
  OVERDUE
  CANCELLED
}

enum MaterialType {
  SYLLABUS
  SLIDES
  HANDOUT
  READING
  REFERENCE
  VIDEO
  AUDIO
  LINK
  SOFTWARE
  OTHER
}

enum AnnouncementPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
  PARTIAL
}

enum NotificationType {
  ASSIGNMENT_DUE
  GRADE_POSTED
  COURSE_ANNOUNCEMENT
  ENROLLMENT_CONFIRMED
  SYSTEM_ALERT
  REMINDER
  MESSAGE
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

## 🏗️ NestJS Module Architecture

### Core Module Structure

src/
├── app.module.ts # Root module - imports all feature modules
├── main.ts # Application bootstrap
├── common/ # Shared utilities, guards, interceptors
├── config/ # Configuration management
├── database/ # Prisma service and database utilities
├── auth/ # Authentication & authorization
├── users/ # User management (students, teachers, supervisors)
├── courses/ # Course management
├── assignments/ # Assignment system
├── grades/ # Grading system
├── materials/ # Course materials management
├── quizzes/ # Quiz system
├── notifications/ # Notification system
├── files/ # File upload and management
├── admin/ # Administrative operations
├── audit/ # Activity logging and audit trails
└── pages/ # Dynamic page configuration



## 🔐 Authentication Module (`src/auth/`)

### Purpose
Handles user authentication, authorization, session management, and security for the entire application.

### Key Components

#### AuthModule
- **Imports**: UsersModule, JwtModule, PassportModule
- **Providers**: AuthService, LocalStrategy, JwtStrategy, Guards
- **Controllers**: AuthController
- **Exports**: AuthService, Guards

#### AuthService
**Responsibilities:**
- User login/logout validation
- JWT token generation and validation
- Password hashing and verification
- Session management
- Role-based access control

**Key Methods:**
- `validateUser(email, password)` - Validates login credentials
- `login(user)` - Generates JWT token and creates session
- `logout(userId, token)` - Invalidates session
- `refreshToken(token)` - Refreshes expired tokens
- `validateToken(token)` - Validates JWT tokens

#### AuthController
**Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout  
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get current user profile
- `PUT /auth/change-password` - Change password

**DTOs:**
- `LoginDto`: { email: string, password: string }
- `ChangePasswordDto`: { currentPassword: string, newPassword: string }
- `RefreshTokenDto`: { refreshToken: string }

#### Guards
- `JwtAuthGuard` - Validates JWT tokens
- `RolesGuard` - Checks user roles (STUDENT, TEACHER, SUPERVISOR_TEACHER, ADMIN)
- `SupervisorGuard` - Ensures user is supervisor teacher
- `TeacherOrSupervisorGuard` - Allows teachers or supervisors
- `CanManageCourseGuard` - Checks if user can manage specific course

## 👥 Users Module (`src/users/`)

### Purpose
Manages user accounts, profiles, and user-related operations for all user types.

### Key Components

#### UsersModule
- **Imports**: DatabaseModule, AuthModule, FilesModule
- **Providers**: UsersService, ProfileService
- **Controllers**: UsersController, ProfileController
- **Exports**: UsersService

#### UsersService
**Responsibilities:**
- User CRUD operations
- User registration (by supervisors/admins)
- Profile management
- User search and filtering
- Advisory teacher assignments

**Key Methods:**
- `createStudent(dto, supervisorId)` - Register new student
- `createTeacher(dto, supervisorId)` - Register new teacher  
- `createSupervisor(dto, adminId)` - Register supervisor teacher
- `findByRole(role)` - Get users by role
- `assignAdvisoryTeacher(studentId, teacherId, supervisorId)` - Assign advisory teacher
- `updateProfile(userId, dto)` - Update user profile
- `deactivateUser(userId)` - Deactivate user account

#### UsersController
**Endpoints:**
- `POST /users/students` - Register student (supervisors only)
- `POST /users/teachers` - Register teacher (supervisors only)
- `POST /users/supervisors` - Register supervisor (admins only)
- `GET /users` - List users with filters
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Deactivate user
- `POST /users/:studentId/advisory` - Assign advisory teacher

**DTOs:**
- `CreateStudentDto`: { email, password, firstName, lastName, grade?, major?, advisoryTeacherId? }
- `CreateTeacherDto`: { email, password, firstName, lastName, department, position, specialization[], officeLocation? }
- `CreateSupervisorDto`: { email, password, firstName, lastName, department, position }
- `UpdateProfileDto`: { firstName?, lastName?, phone?, address?, preferences? }
- `AssignAdvisoryDto`: { studentId, advisoryTeacherId }

## 📚 Courses Module (`src/courses/`)

### Purpose
Manages course creation, scheduling, teacher assignments, and course-related operations.

### Key Components

#### CoursesModule
- **Imports**: DatabaseModule, UsersModule, MaterialsModule, AuthModule
- **Providers**: CoursesService, EnrollmentService
- **Controllers**: CoursesController, EnrollmentController
- **Exports**: CoursesService

#### CoursesService
**Responsibilities:**
- Course CRUD operations (supervisors only for creation)
- Teacher-course assignments
- Student enrollments
- Course scheduling and capacity management
- Prerequisites handling

**Key Methods:**
- `createCourse(dto, supervisorId)` - Create new course (supervisors only)
- `assignTeacher(courseId, teacherId, supervisorId)` - Assign teacher to course
- `enrollStudent(courseId, studentId, supervisorId)` - Enroll student in course
- `getCoursesByInstructor(teacherId)` - Get courses taught by teacher
- `getCoursesByStudent(studentId)` - Get courses enrolled by student
- `updateCourseSchedule(courseId, scheduleDto)` - Update course schedule

#### CoursesController
**Endpoints:**
- `POST /courses` - Create course (supervisors only)
- `GET /courses` - List courses with filters
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `POST /courses/:id/assign-teacher` - Assign teacher (supervisors only)
- `POST /courses/:id/enroll-student` - Enroll student (supervisors only)
- `GET /courses/:id/enrollments` - Get course enrollments

**DTOs:**
- `CreateCourseDto`: { code, name, description, credits, scheduleDays[], startTime, endTime, location, instructorId, departmentId, capacity, startDate, endDate }
- `UpdateCourseDto`: Partial<CreateCourseDto>
- `AssignTeacherDto`: { teacherId, notes? }
- `EnrollStudentDto`: { studentId }
- `CourseFiltersDto`: { department?, instructor?, semester?, year?, status?, level?, search? }

## 📝 Assignments Module (`src/assignments/`)

### Purpose
Manages assignment creation, submissions, and assignment-related operations.

### Key Components

#### AssignmentsModule
- **Imports**: DatabaseModule, CoursesModule, FilesModule, GradesModule
- **Providers**: AssignmentsService, SubmissionsService
- **Controllers**: AssignmentsController, SubmissionsController
- **Exports**: AssignmentsService

#### AssignmentsService
**Responsibilities:**
- Assignment CRUD operations (teachers and supervisors)
- Assignment submission handling
- Due date and status management
- File attachment processing

**Key Methods:**
- `createAssignment(dto, creatorId)` - Create assignment (teachers/supervisors)
- `updateAssignment(id, dto, userId)` - Update assignment
- `submitAssignment(assignmentId, studentId, submissionDto)` - Submit assignment
- `getAssignmentsByStudent(studentId)` - Get student's assignments
- `getAssignmentsByCourse(courseId)` - Get course assignments
- `checkOverdueAssignments()` - Update overdue assignments (cron job)

#### AssignmentsController
**Endpoints:**
- `POST /assignments` - Create assignment (teachers/supervisors)
- `GET /assignments` - List assignments with filters
- `GET /assignments/:id` - Get assignment details
- `PUT /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment
- `POST /assignments/:id/submit` - Submit assignment (students)
- `GET /assignments/:id/submissions` - Get assignment submissions

**DTOs:**
- `CreateAssignmentDto`: { courseId, title, description, type, dueDate, maxPoints, isGroupWork?, attachmentIds[] }
- `UpdateAssignmentDto`: Partial<CreateAssignmentDto>
- `SubmitAssignmentDto`: { textContent?, fileIds[] }
- `AssignmentFiltersDto`: { courseId?, status?, type?, studentId? }

## 📊 Grades Module (`src/grades/`)

### Purpose
Manages grading system, grade calculations, and academic performance tracking.

### Key Components

#### GradesModule
- **Imports**: DatabaseModule, AssignmentsModule, CoursesModule, NotificationsModule
- **Providers**: GradesService, GradeCalculationService
- **Controllers**: GradesController
- **Exports**: GradesService

#### GradesService
**Responsibilities:**
- Grade assignment and management
- GPA calculations
- Grade statistics and analytics
- Feedback management

**Key Methods:**
- `gradeAssignment(submissionId, gradeDto, graderId)` - Grade assignment submission
- `updateGrade(gradeId, dto, graderId)` - Update existing grade
- `calculateGPA(studentId)` - Calculate student GPA
- `getGradesByStudent(studentId)` - Get student's grades
- `getGradesByCourse(courseId)` - Get course grades
- `generateGradeReport(studentId, semester?, year?)` - Generate grade reports

#### GradesController
**Endpoints:**
- `POST /grades` - Create grade (teachers/supervisors)
- `GET /grades/student/:id` - Get student grades
- `GET /grades/course/:id` - Get course grades
- `PUT /grades/:id` - Update grade
- `GET /grades/:studentId/gpa` - Calculate GPA
- `GET /grades/:studentId/report` - Generate grade report

**DTOs:**
- `CreateGradeDto`: { submissionId, letterGrade, score, maxPoints, feedback?, isExtraCredit?, weight? }
- `UpdateGradeDto`: Partial<CreateGradeDto>
- `GradeFiltersDto`: { courseId?, studentId?, semester?, year?, gradingPeriod? }

## 📁 Materials Module (`src/materials/`)

### Purpose
Manages course materials, file uploads, and content distribution.

### Key Components

#### MaterialsModule
- **Imports**: DatabaseModule, FilesModule, CoursesModule
- **Providers**: MaterialsService
- **Controllers**: MaterialsController
- **Exports**: MaterialsService

#### MaterialsService
**Responsibilities:**
- Course material CRUD operations
- File upload processing for materials
- Material categorization and organization
- Access control for materials

**Key Methods:**
- `uploadMaterial(courseId, dto, uploaderId)` - Upload course material
- `getMaterialsByCourse(courseId)` - Get course materials
- `updateMaterial(id, dto)` - Update material details
- `deleteMaterial(id)` - Delete material
- `downloadMaterial(id, userId)` - Handle material downloads

#### MaterialsController
**Endpoints:**
- `POST /materials` - Upload material (teachers/supervisors)
- `GET /materials/course/:id` - Get course materials
- `GET /materials/:id` - Get material details
- `PUT /materials/:id` - Update material
- `DELETE /materials/:id` - Delete material
- `GET /materials/:id/download` - Download material

**DTOs:**
- `CreateMaterialDto`: { courseId, title, description?, type, isRequired?, url? }
- `UpdateMaterialDto`: Partial<CreateMaterialDto>

## 🎯 Quizzes Module (`src/quizzes/`)

### Purpose
Manages quiz creation, attempts, and quiz-related functionality.

### Key Components

#### QuizzesModule
- **Imports**: DatabaseModule, CoursesModule, GradesModule
- **Providers**: QuizzesService, QuizAttemptsService
- **Controllers**: QuizzesController, QuizAttemptsController
- **Exports**: QuizzesService

#### QuizzesService
**Responsibilities:**
- Quiz CRUD operations
- Quiz attempt management
- Time limit enforcement
- Quiz statistics and analytics

**Key Methods:**
- `createQuiz(dto, creatorId)` - Create quiz (teachers/supervisors)
- `startQuizAttempt(quizId, studentId)` - Start quiz attempt
- `submitQuizAttempt(attemptId, answers)` - Submit quiz attempt
- `getQuizzesByCourse(courseId)` - Get course quizzes
- `getQuizAttempts(quizId, studentId?)` - Get quiz attempts

#### QuizzesController
**Endpoints:**
- `POST /quizzes` - Create quiz (teachers/supervisors)
- `GET /quizzes/course/:id` - Get course quizzes
- `GET /quizzes/:id` - Get quiz details
- `POST /quizzes/:id/start` - Start quiz attempt (students)
- `POST /quizzes/attempts/:id/submit` - Submit quiz attempt
- `GET /quizzes/:id/attempts` - Get quiz attempts

**DTOs:**
- `CreateQuizDto`: { courseId, title, description, duration, totalQuestions, maxPoints, dueDate, isTimed?, attemptsAllowed? }
- `SubmitQuizDto`: { answers: Record<string, any> }

## 🔔 Notifications Module (`src/notifications/`)

### Purpose
Manages system notifications, alerts, and communication between users.

### Key Components

#### NotificationsModule
- **Imports**: DatabaseModule, UsersModule
- **Providers**: NotificationsService, NotificationGateway (WebSocket)
- **Controllers**: NotificationsController
- **Exports**: NotificationsService

#### NotificationsService
**Responsibilities:**
- Notification creation and delivery
- Notification preferences management
- Real-time notification via WebSocket
- Email/SMS notification integration

**Key Methods:**
- `createNotification(dto)` - Create notification
- `sendToUser(userId, notification)` - Send to specific user
- `sendToRole(role, notification)` - Send to all users with role
- `markAsRead(notificationId, userId)` - Mark notification as read
- `getUserNotifications(userId, filters)` - Get user notifications

#### NotificationsController
**Endpoints:**
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/unread-count` - Get unread count

**DTOs:**
- `CreateNotificationDto`: { title, message, type, priority?, userId?, courseId?, assignmentId? }
- `NotificationFiltersDto`: { isRead?, type?, priority?, limit?, offset? }

## 📁 Files Module (`src/files/`)

### Purpose
Handles file uploads, storage, and file management across the application.

### Key Components

#### FilesModule
- **Imports**: DatabaseModule, MulterModule
- **Providers**: FilesService, StorageService
- **Controllers**: FilesController
- **Exports**: FilesService

#### FilesService
**Responsibilities:**
- File upload processing
- File storage management (local/cloud)
- File access control and security
- File metadata management

**Key Methods:**
- `uploadFile(file, uploaderId)` - Process file upload
- `downloadFile(fileId, userId)` - Handle file downloads
- `deleteFile(fileId)` - Delete file
- `getFileMetadata(fileId)` - Get file information
- `validateFileAccess(fileId, userId)` - Check file access permissions

#### FilesController
**Endpoints:**
- `POST /files/upload` - Upload file
- `GET /files/:id` - Get file metadata
- `GET /files/:id/download` - Download file
- `DELETE /files/:id` - Delete file

**DTOs:**
- `UploadFileDto`: { file: Express.Multer.File, description?, isPublic? }

## 🔧 Admin Module (`src/admin/`)

### Purpose
Administrative operations, system management, and supervisor teacher management.

### Key Components

#### AdminModule
- **Imports**: DatabaseModule, UsersModule, CoursesModule, AuditModule
- **Providers**: AdminService, SystemService
- **Controllers**: AdminController, SystemController
- **Exports**: AdminService

#### AdminService
**Responsibilities:**
- Supervisor teacher registration
- System-wide user management
- System statistics and reporting
- Administrative operations

**Key Methods:**
- `registerSupervisor(dto, adminId)` - Register supervisor teacher
- `getSystemStats()` - Get system statistics
- `getUserStats(filters)` - Get user statistics
- `getCourseStats(filters)` - Get course statistics
- `generateSystemReport()` - Generate system reports

#### AdminController
**Endpoints:**
- `POST /admin/supervisors` - Register supervisor (admins only)
- `GET /admin/stats` - Get system statistics
- `GET /admin/users` - Get all users (with filters)
- `GET /admin/reports` - Generate reports
- `PUT /admin/settings` - Update system settings

**DTOs:**
- `CreateSupervisorDto`: { email, password, firstName, lastName, department, position }
- `SystemStatsFiltersDto`: { startDate?, endDate?, department? }

## 📋 Audit Module (`src/audit/`)

### Purpose
Activity logging, audit trails, and system monitoring.

### Key Components

#### AuditModule
- **Imports**: DatabaseModule
- **Providers**: AuditService, ActivityLoggerService
- **Controllers**: AuditController
- **Exports**: AuditService

#### AuditService
**Responsibilities:**
- Automatic activity logging via interceptors
- Manual audit log creation
- Audit log querying and reporting
- Security event monitoring

**Key Methods:**
- `logActivity(userId, action, details)` - Log user activity
- `logSystemEvent(event, details)` - Log system events
- `getActivityLogs(filters)` - Query activity logs
- `generateAuditReport(filters)` - Generate audit reports

#### Working Mechanism for Activity Logging

**Automatic Logging via Interceptors:**
1. **AuditLogInterceptor** is applied globally or to specific controllers
2. **Before method execution**: Captures request details (user, IP, user-agent)
3. **After method execution**: Captures result and logs the activity
4. **Uses Prisma transactions**: Ensures activity log is created atomically with main operation
5. **Error handling**: Logging failures don't break main operations

**Manual Logging in Services:**
1. **Service methods** call `auditService.log()` for important operations
2. **Batch operations** use `auditService.logBulk()` for efficiency
3. **Critical operations** use Prisma transactions to ensure data consistency

**Prisma Middleware Approach:**
1. **Database-level logging**: Automatically logs all CREATE, UPDATE, DELETE operations
2. **Transparent to services**: No need to manually add logging calls
3. **Consistent logging**: All database changes are captured uniformly

## 🎛️ Pages Module (`src/pages/`)

### Purpose
Manages dynamic page configurations for the frontend dynamic rendering system.

### Key Components

#### PagesModule
- **Imports**: DatabaseModule, AuthModule
- **Providers**: PagesService
- **Controllers**: PagesController
- **Exports**: PagesService

#### PagesService
**Responsibilities:**
- Page configuration CRUD operations
- Role-based page access control
- Page template management
- Dynamic content generation

**Key Methods:**
- `getPageConfig(pageId, userRole)` - Get page configuration
- `createPageConfig(dto)` - Create page configuration
- `updatePageConfig(pageId, dto)` - Update page configuration
- `getAvailablePages(userRole, permissions)` - Get accessible pages

## 🛡️ Common Module (`src/common/`)

### Purpose
Shared utilities, guards, interceptors, and common functionality.

### Key Components

#### Guards
- **RoleGuards**: Check user roles and permissions
- **ResourceGuards**: Check access to specific resources
- **SupervisorGuards**: Ensure supervisor-level access

#### Interceptors
- **AuditLogInterceptor**: Automatic activity logging
- **ResponseInterceptor**: Standardize API responses
- **ErrorInterceptor**: Handle and log errors

#### Decorators
- **@Roles()**: Specify required roles for endpoints
- **@AuditLog()**: Mark endpoints for activity logging
- **@CurrentUser()**: Get current user from request

#### Pipes
- **ValidationPipe**: Validate DTOs using class-validator
- **ParseFilePipe**: Validate file uploads
- **TransformPipe**: Transform and sanitize data

## 🔄 Integration Flow Examples

### User Registration Flow (Supervisor registers teacher)
1. **Request**: `POST /users/teachers` with CreateTeacherDto
2. **AuthGuard**: Validates JWT token
3. **RoleGuard**: Ensures user is SUPERVISOR_TEACHER
4. **UsersController**: Receives request
5. **UsersService**: Creates teacher account
6. **AuditInterceptor**: Logs REGISTER_TEACHER activity
7. **NotificationService**: Notifies new teacher via email
8. **Response**: Returns created teacher data

### Assignment Submission Flow
1. **Request**: `POST /assignments/:id/submit` with SubmitAssignmentDto
2. **AuthGuard**: Validates student token
3. **AssignmentsController**: Receives submission
4. **AssignmentsService**: Processes submission
5. **FilesService**: Handles file attachments
6. **Prisma Transaction**: Creates submission + logs activity
7. **NotificationService**: Notifies teacher of new submission
8. **Response**: Returns submission confirmation

### Course Creation Flow (Supervisor creates course)
1. **Request**: `POST /courses` with CreateCourseDto
2. **AuthGuard**: Validates supervisor token
3. **SupervisorGuard**: Ensures supervisor privileges
4. **CoursesController**: Receives course data
5. **CoursesService**: Creates course
6. **TeacherAssignment**: Automatically assigns instructor
7. **AuditLog**: Records course creation
8. **Response**: Returns created course

## 🔧 Configuration and Setup

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/education_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
FILE_UPLOAD_PATH="/uploads"
MAX_FILE_SIZE="10MB"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Key Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "multer": "^1.4.5-lts.1"
  }
}
```

## 🎯 Key Design Principles

### 1. **Separation of Concerns**
- Each module handles a specific domain
- Services contain business logic
- Controllers handle HTTP requests/responses
- DTOs define data contracts

### 2. **Role-Based Access Control**
- Guards enforce permissions at controller level
- Services validate business rules
- Database constraints ensure data integrity

### 3. **Automatic Activity Logging**
- Interceptors provide transparent logging
- Prisma transactions ensure consistency
- No manual logging calls needed in most cases

### 4. **Error Handling**
- Global exception filters
- Standardized error responses
- Detailed error logging

### 5. **Data Validation**
- DTOs with class-validator decorators
- Input sanitization and transformation
- Type safety throughout the application
