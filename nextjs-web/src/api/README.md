# API Layer Documentation

This directory contains the complete API layer for the Education Management System frontend, providing a clean interface to communicate with the NestJS backend running on port 3000.

## 📁 Structure

```
src/api/
├── config.ts           # Base API configuration and axios setup
├── types.ts            # TypeScript interfaces for all API data
├── api-auth.ts         # Authentication and session management
├── api-users.ts        # User management (CRUD, registration)
├── api-courses.ts      # Course management and enrollment
├── api-assignments.ts  # Assignment creation and submissions
├── api-grades.ts       # Grading system and academic performance
├── api-materials.ts    # Course materials and file distribution
├── api-quizzes.ts      # Quiz system and attempts
├── api-notifications.ts # Notification management
├── api-files.ts        # File upload/download operations
├── api-pages.ts        # Dynamic page configurations
├── api-admin.ts        # Administrative operations
├── index.ts            # Main export file
├── examples.ts         # Usage examples (reference only)
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { API, TokenManager } from '@/api'

// Login user
const loginResponse = await API.auth.login({
  email: 'student@school.edu',
  password: 'password123'
})

// Tokens are automatically stored and managed
console.log('Logged in as:', loginResponse.user)
```

### 2. Making API Calls

```typescript
// Get student's courses
const courses = await API.courses.getStudentCourses()

// Get assignments with filtering
const assignments = await API.assignments.getStudentAssignments(undefined, {
  status: 'ASSIGNED',
  courseId: 'course-123'
})

// Submit assignment
const submission = await API.assignments.submitAssignment('assignment-id', {
  content: 'My solution...',
  fileIds: ['file-1', 'file-2']
})
```

### 3. Error Handling

```typescript
try {
  const result = await API.courses.getCourses()
} catch (error: any) {
  if (error.statusCode === 401) {
    // Redirect to login
  } else if (error.statusCode === 403) {
    // Show access denied message
  } else {
    // Handle other errors
    console.error('API Error:', error.message)
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Base Configuration

The API client is configured in `config.ts` with:

- **Base URL**: Your NestJS backend URL
- **Timeout**: 10 seconds default
- **Automatic token management**: JWT tokens automatically added to requests
- **Token refresh**: Automatic token refresh on 401 errors
- **Error handling**: Standardized error responses

## 📚 API Services

### Authentication (`API.auth`)

```typescript
// Login
await API.auth.login({ email, password })

// Get current user
await API.auth.getProfile()

// Change password
await API.auth.changePassword({ currentPassword, newPassword })

// Logout
await API.auth.logout()

// Token management
TokenManager.isAuthenticated()
TokenManager.getUser()
TokenManager.hasRole('STUDENT')
```

### Users Management (`API.users`)

```typescript
// Create student (supervisors only)
await API.users.createStudent({
  email: 'student@school.edu',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  studentId: 'STD001'
})

// Get users with filtering
await API.users.getUsers({
  role: 'STUDENT',
  search: 'john',
  limit: 10
})

// Assign advisory teacher
await API.users.assignAdvisoryTeacher('student-id', {
  advisoryTeacherId: 'teacher-id'
})
```

### Courses (`API.courses`)

```typescript
// Create course (supervisors only)
await API.courses.createCourse({
  code: 'CS101',
  name: 'Programming Basics',
  instructorId: 'teacher-id',
  // ... other fields
})

// Get student's courses
await API.courses.getStudentCourses()

// Enroll student
await API.courses.enrollStudent('course-id', {
  studentId: 'student-id'
})
```

### Assignments (`API.assignments`)

```typescript
// Create assignment
await API.assignments.createAssignment({
  courseId: 'course-id',
  title: 'Assignment 1',
  description: 'Complete the exercises',
  type: 'HOMEWORK',
  dueDate: '2024-02-15T23:59:59Z',
  maxPoints: 100
})

// Submit assignment
await API.assignments.submitAssignment('assignment-id', {
  content: 'My solution',
  fileIds: ['file1', 'file2']
})

// Get student assignments
await API.assignments.getStudentAssignments()
```

### Grades (`API.grades`)

```typescript
// Create grade (teachers)
await API.grades.createGrade({
  studentId: 'student-id',
  assignmentId: 'assignment-id',
  letterGrade: 'A',
  score: 95,
  maxPoints: 100,
  feedback: 'Excellent work!'
})

// Get student grades
await API.grades.getMyGrades()

// Generate grade report
await API.grades.getMyGradeReport({
  semester: 'Fall',
  year: 2024
})
```

### File Operations (`API.files`)

```typescript
// Upload file with progress
await API.files.uploadFile(file, {
  description: 'Assignment file',
  onProgress: (progress) => console.log(`${progress}%`)
})

// Download file
const blob = await API.files.downloadFile('file-id')

// Get file info
const fileInfo = await API.files.getFileMetadata('file-id')
```

### Notifications (`API.notifications`)

```typescript
// Get notifications
await API.notifications.getMyNotifications({
  isRead: false,
  limit: 10
})

// Mark as read
await API.notifications.markAsRead('notification-id')

// Send course announcement (teachers)
await API.notifications.sendCourseAnnouncement('course-id', {
  title: 'Important Update',
  message: 'Class moved to tomorrow'
})
```

## 🔐 Authentication & Security

### Token Management

The API layer automatically handles:

- **JWT Token Storage**: Access and refresh tokens stored in localStorage
- **Automatic Token Refresh**: Refreshes expired tokens transparently
- **Request Interceptors**: Adds Authorization headers automatically
- **Logout on Failure**: Redirects to login if refresh fails

### Role-Based Access

```typescript
// Check user permissions
if (TokenManager.hasRole('TEACHER')) {
  // Show teacher-specific UI
}

if (TokenManager.isSupervisor()) {
  // Show supervisor controls
}
```

### Security Best Practices

- Tokens are automatically included in all requests
- Sensitive operations require appropriate user roles
- File uploads are validated client-side before sending
- API calls include proper error handling for security failures

## 📊 Error Handling

### Standard Error Format

```typescript
interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
```

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (login required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Rate Limited
- **500**: Server Error

### Error Handling Pattern

```typescript
try {
  const result = await API.courses.getCourses()
  // Handle success
} catch (error: any) {
  switch (error.statusCode) {
    case 401:
      // Redirect to login
      router.push('/login')
      break
    case 403:
      // Show permission error
      toast.error('You do not have permission to perform this action')
      break
    case 429:
      // Show rate limit error
      toast.error('Too many requests. Please try again later.')
      break
    default:
      // Show generic error
      toast.error(error.message || 'An error occurred')
  }
}
```

## 🛠️ Development Utilities

### Development Mode Features

```typescript
import { APIDev, APIStatus } from '@/api'

// Quick login for testing (development only)
await APIDev.quickLogin('student')

// Test API connection
const status = await APIStatus.testConnection()

// Clear all data
APIDev.clearAll()

// Log current status
APIDev.logStatus()
```

### API Status Monitoring

```typescript
// Check if API is online
const isOnline = await APIStatus.isOnline()

// Get API version
const version = await APIStatus.getVersion()

// Test connection with auth
const connectionTest = await APIStatus.testConnection()
```

## 📈 Performance Optimization

### Parallel API Calls

```typescript
// Load dashboard data efficiently
const [profile, courses, assignments, notifications] = await Promise.all([
  API.auth.getProfile(),
  API.courses.getStudentCourses(),
  API.assignments.getStudentAssignments(),
  API.notifications.getMyNotifications({ limit: 5 })
])
```

### Caching Strategy

```typescript
// Implement caching in your components
const useCoursesCache = () => {
  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!courses && !loading) {
      setLoading(true)
      API.courses.getStudentCourses()
        .then(setCourses)
        .finally(() => setLoading(false))
    }
  }, [courses, loading])

  return { courses, loading, refetch: () => setCourses(null) }
}
```

## 🔄 Integration with React

### Custom Hooks Example

```typescript
// useAuth hook
export const useAuth = () => {
  const [user, setUser] = useState(TokenManager.getUser())
  const [loading, setLoading] = useState(false)

  const login = async (credentials: LoginDto) => {
    setLoading(true)
    try {
      const response = await API.auth.login(credentials)
      TokenManager.storeTokens(response)
      setUser(response.user)
      return response
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await API.auth.logout()
    TokenManager.clearTokens()
    setUser(null)
  }

  return { user, login, logout, loading, isAuthenticated: !!user }
}
```

### Data Fetching with SWR

```typescript
import useSWR from 'swr'

const useCourses = () => {
  return useSWR('courses', () => API.courses.getStudentCourses())
}

const useAssignments = (courseId?: string) => {
  return useSWR(
    courseId ? ['assignments', courseId] : null,
    () => API.assignments.getCourseAssignments(courseId!)
  )
}
```

## 🐛 Debugging

### Debug Mode

Set `NEXT_PUBLIC_DEBUG_API=true` in your environment to enable debug logging.

### Common Issues

1. **CORS Errors**: Ensure your NestJS backend has CORS configured for `http://localhost:3000`
2. **401 Errors**: Check if tokens are being sent correctly
3. **Network Errors**: Verify the API base URL is correct
4. **Type Errors**: Ensure you're using the correct interfaces from `types.ts`

### Debug Tools

```typescript
// Log all API requests (development only)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use(request => {
    console.log('🚀 API Request:', request.method?.toUpperCase(), request.url)
    return request
  })

  apiClient.interceptors.response.use(response => {
    console.log('✅ API Response:', response.status, response.config.url)
    return response
  })
}
```

## 📝 Migration from Mock Data

### Step-by-Step Migration

1. **Replace Mock Imports**:
   ```typescript
   // Before
   import mockData from '@/data/mock-courses.json'
   
   // After
   import { API } from '@/api'
   ```

2. **Update Data Fetching**:
   ```typescript
   // Before
   const [courses, setCourses] = useState(mockData.courses)
   
   // After
   const [courses, setCourses] = useState([])
   useEffect(() => {
     API.courses.getStudentCourses().then(response => {
       setCourses(response.enrollments.map(e => e.course))
     })
   }, [])
   ```

3. **Add Error Handling**:
   ```typescript
   const [error, setError] = useState(null)
   
   API.courses.getStudentCourses()
     .then(response => setCourses(response.enrollments))
     .catch(error => setError(error.message))
   ```

4. **Add Loading States**:
   ```typescript
   const [loading, setLoading] = useState(true)
   
   API.courses.getStudentCourses()
     .then(response => setCourses(response.enrollments))
     .catch(setError)
     .finally(() => setLoading(false))
   ```

## 🔮 Future Enhancements

- **WebSocket Integration**: Real-time notifications
- **Offline Support**: Cache API responses for offline access
- **Request Deduplication**: Prevent duplicate API calls
- **Optimistic Updates**: Update UI before API confirmation
- **GraphQL Support**: If backend adds GraphQL endpoints

## 📞 Support

For API-related issues:

1. Check the console for error messages
2. Verify your NestJS backend is running on port 3000
3. Ensure you have the correct user permissions
4. Check the network tab in browser dev tools
5. Review this documentation and examples

Remember: This API layer is designed to work seamlessly with your NestJS backend. Make sure both are running the same version and have compatible configurations.