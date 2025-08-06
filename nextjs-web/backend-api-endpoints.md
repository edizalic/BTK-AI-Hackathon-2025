# Education Management System - API Documentation

## Overview
This NestJS backend provides a comprehensive education management system with a 4-tier user hierarchy and role-based access control.

## User Roles
- **ADMIN**: System-wide management and supervisor registration
- **SUPERVISOR_TEACHER**: Can create courses, register users, assign teachers
- **TEACHER**: Can teach assigned courses, grade assignments, manage materials
- **STUDENT**: Can view courses, submit assignments, view grades

## Authentication
All endpoints (except public ones) require JWT authentication via `Authorization: Bearer <token>` header.

---

## 🔐 Authentication Endpoints
**Base URL**: `/auth`

### POST /auth/login
**Description**: User login with email and password  
**Access**: Public  
**Body**: `LoginDto`
```typescript
{
  email: string;
  password: string;
}
```
**Returns**: JWT tokens and user info
```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isSupervisor: boolean;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}
```

### POST /auth/logout
**Description**: Logout and invalidate session  
**Access**: Authenticated users  
**Returns**: Success message

### POST /auth/refresh
**Description**: Refresh access token using refresh token  
**Access**: Public  
**Body**: `RefreshTokenDto`
```typescript
{
  refreshToken: string;
}
```
**Returns**: New access token

### GET /auth/profile
**Description**: Get current user profile  
**Access**: Authenticated users  
**Returns**: Current user with profile data

### PUT /auth/change-password
**Description**: Change user password  
**Access**: Authenticated users  
**Body**: `ChangePasswordDto`
```typescript
{
  currentPassword: string;
  newPassword: string; // Min 8 chars, must contain uppercase, lowercase, number, special char
}
```

### GET /auth/sessions
**Description**: Get user's active sessions  
**Access**: Authenticated users  
**Returns**: List of active sessions (without tokens)

### POST /auth/sessions/:sessionId/invalidate
**Description**: Invalidate all user sessions  
**Access**: Authenticated users  
**Returns**: Success message

---

## 👥 Users Endpoints
**Base URL**: `/users`

### POST /users/students
**Description**: Register a new student  
**Access**: SUPERVISOR_TEACHER only  
**Body**: `CreateStudentDto`
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  grade: string;
  major: string;
  minor?: string;
  enrollmentDate?: Date;
  studentId: string;
  advisoryTeacherId?: string;
}
```

### POST /users/teachers
**Description**: Register a new teacher  
**Access**: SUPERVISOR_TEACHER only  
**Body**: `CreateTeacherDto`
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  specialization: string[];
  employeeId: string;
  position?: string;
  hireDate?: Date;
}
```

### POST /users/supervisors
**Description**: Register a new supervisor teacher  
**Access**: ADMIN only  
**Body**: `CreateSupervisorDto`
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  specialization: string[];
  employeeId: string;
  position?: string;
  hireDate?: Date;
}
```

### GET /users
**Description**: Get all users with filtering  
**Access**: SUPERVISOR_TEACHER, ADMIN  
**Query**: `UserFiltersDto`
```typescript
{
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
}
```

### GET /users/:id
**Description**: Get user by ID  
**Access**: SUPERVISOR_TEACHER, ADMIN (or own profile)  
**Returns**: User with profile data

### PUT /users/:id
**Description**: Update user information  
**Access**: SUPERVISOR_TEACHER, ADMIN (or own profile)  
**Body**: `UpdateUserDto` (partial user data)

### DELETE /users/:id
**Description**: Deactivate user account  
**Access**: SUPERVISOR_TEACHER, ADMIN  
**Returns**: Success message

### POST /users/:studentId/advisory
**Description**: Assign advisory teacher to student  
**Access**: SUPERVISOR_TEACHER only  
**Body**: `AssignAdvisoryDto`
```typescript
{
  advisoryTeacherId: string;
  notes?: string;
}
```

---

## 📚 Courses Endpoints
**Base URL**: `/courses`

### POST /courses
**Description**: Create a new course  
**Access**: SUPERVISOR_TEACHER only  
**Body**: `CreateCourseDto`
```typescript
{
  title: string;
  courseCode: string;
  description: string;
  credits: number;
  departmentId: string;
  instructorId: string;
  startDate: Date;
  endDate: Date;
  maxStudents?: number;
}
```

### GET /courses
**Description**: Get all courses with filtering  
**Access**: All authenticated users  
**Query**: Course filters (department, instructor, active status)

### GET /courses/:id
**Description**: Get course details  
**Access**: All authenticated users  
**Returns**: Course with instructor, department, and enrollment info

### PUT /courses/:id
**Description**: Update course information  
**Access**: SUPERVISOR_TEACHER, course instructor  
**Body**: `UpdateCourseDto` (partial course data)

### DELETE /courses/:id
**Description**: Delete course  
**Access**: SUPERVISOR_TEACHER only  
**Returns**: Success message

### POST /courses/:id/enroll
**Description**: Enroll student in course  
**Access**: SUPERVISOR_TEACHER only  
**Body**: `EnrollStudentDto`
```typescript
{
  studentId: string;
}
```

### DELETE /courses/:id/enroll/:studentId
**Description**: Remove student from course  
**Access**: SUPERVISOR_TEACHER only  
**Returns**: Success message

### GET /courses/:id/students
**Description**: Get enrolled students  
**Access**: SUPERVISOR_TEACHER, course instructor  
**Returns**: List of enrolled students with profiles

---

## 📝 Assignments Endpoints
**Base URL**: `/assignments`

### POST /assignments/course/:courseId
**Description**: Create assignment for course  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Body**: `CreateAssignmentDto`
```typescript
{
  title: string;
  description: string;
  type: AssignmentType; // PROJECT, HOMEWORK, LAB, EXAM
  dueDate: Date;
  maxPoints: number;
  isGroupWork?: boolean;
  attachmentIds?: string[];
}
```

### GET /assignments/course/:courseId
**Description**: Get course assignments  
**Access**: All authenticated users  
**Returns**: List of assignments for course

### GET /assignments/:id
**Description**: Get assignment details  
**Access**: All authenticated users  
**Returns**: Assignment with attachments and submission info

### PUT /assignments/:id
**Description**: Update assignment  
**Access**: TEACHER, SUPERVISOR_TEACHER (assignment creator)  
**Body**: `UpdateAssignmentDto` (partial assignment data)

### DELETE /assignments/:id
**Description**: Delete assignment  
**Access**: TEACHER, SUPERVISOR_TEACHER (assignment creator)  
**Returns**: Success message

### POST /assignments/:id/submit
**Description**: Submit assignment solution  
**Access**: STUDENT only  
**Body**: `SubmitAssignmentDto`
```typescript
{
  content?: string;
  fileIds?: string[];
  notes?: string;
}
```

### GET /assignments/:id/submissions
**Description**: Get assignment submissions  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Returns**: List of student submissions

### GET /assignments/submissions/:submissionId
**Description**: Get submission details  
**Access**: TEACHER, SUPERVISOR_TEACHER, submission owner  
**Returns**: Submission with files and feedback

---

## 📊 Grades Endpoints
**Base URL**: `/grades`

### POST /grades
**Description**: Create/assign grade  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Body**: `CreateGradeDto`
```typescript
{
  letterGrade: string; // A, B, C, D, F
  score: number;
  maxPoints: number;
  feedback?: string;
  isExtraCredit?: boolean;
  weight?: number; // 0-5
}
```

### GET /grades/student/:studentId
**Description**: Get student's grades  
**Access**: TEACHER, SUPERVISOR_TEACHER, grade owner  
**Query**: `GradeFiltersDto`
```typescript
{
  courseId?: string;
  semester?: string;
  year?: number;
}
```

### GET /grades/course/:courseId
**Description**: Get all grades for course  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Returns**: List of grades for course

### PUT /grades/:id
**Description**: Update grade  
**Access**: TEACHER, SUPERVISOR_TEACHER (grader)  
**Body**: `UpdateGradeDto` (partial grade data)

### DELETE /grades/:id
**Description**: Delete grade  
**Access**: SUPERVISOR_TEACHER only  
**Returns**: Success message

### GET /grades/student/:studentId/report
**Description**: Generate grade report for student  
**Access**: TEACHER, SUPERVISOR_TEACHER, report owner  
**Query**: Semester and year filters  
**Returns**: Comprehensive grade report with GPA

---

## 📄 Course Materials Endpoints
**Base URL**: `/materials`

### POST /materials/course/:courseId
**Description**: Upload course material  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Body**: `CreateMaterialDto` + file upload
```typescript
{
  title: string;
  description?: string;
  type: MaterialType; // SLIDES, DOCUMENT, VIDEO, READING, REFERENCE
  isRequired?: boolean;
  url?: string; // For external links
}
```

### GET /materials/course/:courseId
**Description**: Get course materials  
**Access**: Public  
**Returns**: List of materials for course

### GET /materials/:id
**Description**: Get material details  
**Access**: Public  
**Returns**: Material info with download links

### PUT /materials/:id
**Description**: Update material  
**Access**: TEACHER, SUPERVISOR_TEACHER (uploader)  
**Body**: `UpdateMaterialDto` (partial material data)

### DELETE /materials/:id
**Description**: Delete material  
**Access**: TEACHER, SUPERVISOR_TEACHER (uploader)  
**Returns**: Success message

### GET /materials/:id/download
**Description**: Download material file  
**Access**: All authenticated users  
**Returns**: File download

### GET /materials/course/:courseId/type/:type
**Description**: Get materials by type  
**Access**: Public  
**Returns**: Filtered materials list

### GET /materials/course/:courseId/required
**Description**: Get required materials  
**Access**: Public  
**Returns**: Required materials only

---

## 🎯 Quizzes Endpoints
**Base URL**: `/quizzes`

### POST /quizzes
**Description**: Create quiz  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Body**: `CreateQuizDto`
```typescript
{
  courseId: string;
  title: string;
  description: string;
  duration: string; // "60 minutes", "1 hour"
  totalQuestions: number;
  maxPoints: number;
  dueDate: Date;
  isTimed?: boolean;
  attemptsAllowed?: number;
}
```

### GET /quizzes/course/:id
**Description**: Get course quizzes  
**Access**: All authenticated users  
**Returns**: List of quizzes for course

### GET /quizzes/:id
**Description**: Get quiz details  
**Access**: All authenticated users  
**Returns**: Quiz information

### PUT /quizzes/:id
**Description**: Update quiz  
**Access**: TEACHER, SUPERVISOR_TEACHER (creator)  
**Body**: `UpdateQuizDto` (partial quiz data)

### DELETE /quizzes/:id
**Description**: Delete quiz  
**Access**: TEACHER, SUPERVISOR_TEACHER (creator)  
**Returns**: Success message

### GET /quizzes/:id/attempts
**Description**: Get quiz attempts  
**Access**: TEACHER, SUPERVISOR_TEACHER  
**Query**: Optional studentId filter  
**Returns**: List of quiz attempts

---

## 🎯 Quiz Attempts Endpoints
**Base URL**: `/quiz-attempts`

### POST /quiz-attempts/start/:quizId
**Description**: Start quiz attempt  
**Access**: STUDENT only  
**Returns**: Started quiz attempt

### POST /quiz-attempts/:attemptId/submit
**Description**: Submit quiz answers  
**Access**: STUDENT only (attempt owner)  
**Body**: `SubmitQuizAnswersDto`
```typescript
{
  answers: Record<string, any>; // questionId -> answer
}
```

### GET /quiz-attempts/quiz/:quizId/my-attempts
**Description**: Get student's quiz attempts  
**Access**: STUDENT only  
**Returns**: Student's attempts for quiz

### GET /quiz-attempts/:attemptId
**Description**: Get quiz attempt details  
**Access**: STUDENT (owner), TEACHER, SUPERVISOR_TEACHER  
**Returns**: Attempt details with score

---

## 🔔 Notifications Endpoints
**Base URL**: `/notifications`

### POST /notifications
**Description**: Create notification  
**Access**: TEACHER, SUPERVISOR_TEACHER, ADMIN  
**Body**: `CreateNotificationDto`
```typescript
{
  title: string;
  message: string;
  type: NotificationType; // ANNOUNCEMENT, REMINDER, ALERT, SYSTEM
  priority: NotificationPriority; // LOW, MEDIUM, HIGH, URGENT
  targetUserIds?: string[];
  targetRoles?: UserRole[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  scheduledFor?: Date;
  metadata?: any;
}
```

### GET /notifications/my
**Description**: Get user's notifications  
**Access**: All authenticated users  
**Query**: `NotificationFiltersDto`
```typescript
{
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}
```

### PUT /notifications/:id/read
**Description**: Mark notification as read  
**Access**: All authenticated users (notification recipient)  
**Returns**: Success message

### DELETE /notifications/:id
**Description**: Delete notification  
**Access**: SUPERVISOR_TEACHER, ADMIN (notification creator)  
**Returns**: Success message

---

## 📁 Files Endpoints
**Base URL**: `/files`

### POST /files/upload
**Description**: Upload file  
**Access**: All authenticated users  
**Body**: Multipart form data with file  
**Returns**: File metadata with ID

### GET /files/:id
**Description**: Get file metadata  
**Access**: All authenticated users  
**Returns**: File information

### GET /files/:id/download
**Description**: Download file  
**Access**: All authenticated users (with access check)  
**Returns**: File download

### DELETE /files/:id
**Description**: Delete file  
**Access**: File uploader, SUPERVISOR_TEACHER  
**Returns**: Success message

---

## 👨‍💼 Admin Endpoints
**Base URL**: `/admin`

### GET /admin/dashboard
**Description**: Get admin dashboard data  
**Access**: ADMIN only  
**Returns**: System statistics and metrics

### GET /admin/users/stats
**Description**: Get user statistics  
**Access**: ADMIN only  
**Returns**: User counts by role and status

### POST /admin/system/backup
**Description**: Create system backup  
**Access**: ADMIN only  
**Returns**: Backup status

### GET /admin/system/health
**Description**: Check system health  
**Access**: ADMIN only  
**Returns**: System health metrics

---

## 📋 Audit Endpoints
**Base URL**: `/audit`

### GET /audit/activities
**Description**: Get audit log activities  
**Access**: SUPERVISOR_TEACHER, ADMIN  
**Query**: `AuditFiltersDto`
```typescript
{
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
```

### GET /audit/activities/:id
**Description**: Get audit activity details  
**Access**: SUPERVISOR_TEACHER, ADMIN  
**Returns**: Detailed audit log entry

---

## 📄 Pages Endpoints
**Base URL**: `/pages`

### GET /pages/:id
**Description**: Get page configuration  
**Access**: All authenticated users  
**Returns**: Page config based on user role

### GET /pages
**Description**: Get available pages for user  
**Access**: All authenticated users  
**Returns**: List of accessible pages

---

## Error Responses

All endpoints may return these common error responses:

### 400 Bad Request
```typescript
{
  statusCode: 400;
  message: string | string[];
  error: "Bad Request";
}
```

### 401 Unauthorized
```typescript
{
  statusCode: 401;
  message: "Unauthorized";
}
```

### 403 Forbidden
```typescript
{
  statusCode: 403;
  message: "Forbidden resource";
  error: "Forbidden";
}
```

### 404 Not Found
```typescript
{
  statusCode: 404;
  message: "Not Found";
  error: "Not Found";
}
```

### 500 Internal Server Error
```typescript
{
  statusCode: 500;
  message: "Internal server error";
  error: "Internal Server Error";
}
```

---

## Rate Limiting
- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## CORS Configuration
- **Allowed Origins**: `http://localhost:3000` (configurable via `FRONTEND_URL`)
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

## WebSocket Events (Notifications)
**Namespace**: `/notifications`

### Events
- `notification` - New notification received
- `notification_read` - Notification marked as read
- `notification_deleted` - Notification deleted

### Authentication
WebSocket connections require JWT token in connection query or headers.
