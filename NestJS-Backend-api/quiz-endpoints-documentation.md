# Quiz Endpoints Documentation

This document provides comprehensive documentation for the quiz management system endpoints, including JSON request formats, response structures, and usage examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Quiz Endpoints](#quiz-endpoints)
4. [JSON Request Formats](#json-request-formats)
5. [Response Structures](#response-structures)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)

## Overview

The quiz system supports creating, managing, and taking quizzes with the following features:
- Multiple choice questions with configurable points
- Timed and untimed quizzes
- Multiple attempts support
- Automatic grading
- Role-based access control
- Detailed analytics and reporting

## Authentication & Authorization

All quiz endpoints require JWT authentication. Different endpoints have different role requirements:

- **Teachers & Supervisor Teachers**: Can create, update, delete, and view quizzes with answers
- **Students**: Can view quizzes (without answers) and submit attempts
- **Admins**: Full access to all quiz functionality

## Quiz Endpoints

### 1. Create Quiz
**POST** `/quizzes`

**Required Roles**: `TEACHER`, `SUPERVISOR_TEACHER`

**Description**: Creates a new quiz for a course

**Request Body**: See [Create Quiz JSON Format](#create-quiz-json-format)

**Response**: Quiz object with complete details

### 2. Get Quizzes by Course
**GET** `/quizzes/course/:courseId`

**Required Roles**: Any authenticated user

**Description**: Retrieves all quizzes for a specific course

**Parameters**:
- `courseId` (path): Course ID

**Response**: Array of quiz objects

### 3. Get Quiz by ID
**GET** `/quizzes/:id`

**Required Roles**: Any authenticated user

**Description**: Retrieves a specific quiz by ID

**Parameters**:
- `id` (path): Quiz ID

**Response**: Quiz object

### 4. Update Quiz
**PATCH** `/quizzes/:id`

**Required Roles**: `TEACHER`, `SUPERVISOR_TEACHER`

**Description**: Updates an existing quiz

**Parameters**:
- `id` (path): Quiz ID

**Request Body**: See [Update Quiz JSON Format](#update-quiz-json-format)

**Response**: Updated quiz object

### 5. Delete Quiz
**DELETE** `/quizzes/:id`

**Required Roles**: `TEACHER`, `SUPERVISOR_TEACHER`

**Description**: Deletes a quiz

**Parameters**:
- `id` (path): Quiz ID

**Response**: Success message

### 6. Get Quiz Attempts
**GET** `/quizzes/:id/attempts`

**Required Roles**: `TEACHER`, `SUPERVISOR_TEACHER`

**Description**: Retrieves all attempts for a specific quiz

**Parameters**:
- `id` (path): Quiz ID
- `studentId` (query, optional): Filter by specific student

**Response**: Array of quiz attempt objects

### 7. Get Quiz for Student
**GET** `/quizzes/:id/student`

**Required Roles**: `STUDENT`

**Description**: Retrieves quiz for student view (without correct answers)

**Parameters**:
- `id` (path): Quiz ID

**Response**: Quiz object without correct answers

### 8. Get Quiz for Teacher
**GET** `/quizzes/:id/teacher`

**Required Roles**: `TEACHER`, `SUPERVISOR_TEACHER`

**Description**: Retrieves quiz for teacher view (with correct answers)

**Parameters**:
- `id` (path): Quiz ID

**Response**: Quiz object with correct answers

### 9. Submit Quiz Attempt
**POST** `/quizzes/:id/submit`

**Required Roles**: `STUDENT`

**Description**: Submits a quiz attempt and automatically grades it

**Parameters**:
- `id` (path): Quiz ID

**Request Body**: See [Submit Quiz JSON Format](#submit-quiz-json-format)

**Response**: Graded quiz attempt with score and results

## JSON Request Formats

### Create Quiz JSON Format

```json
{
  "courseId": "clr4x1234567890123456789",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of database concepts and SQL",
  "duration": "60 minutes",
  "dueDate": "2024-02-15T23:59:59.000Z",
  "isTimed": true,
  "attemptsAllowed": 2,
  "questions": [
    {
      "id": "q1",
      "question": "What does SQL stand for?",
      "options": [
        "Structured Query Language",
        "Simple Query Language",
        "Standard Query Language",
        "System Query Language"
      ],
      "correctAnswer": 0,
      "points": 10,
      "explanation": "SQL stands for Structured Query Language, which is used to communicate with databases."
    },
    {
      "id": "q2",
      "question": "Which SQL command is used to retrieve data from a database?",
      "options": [
        "INSERT",
        "SELECT",
        "UPDATE",
        "DELETE"
      ],
      "correctAnswer": 1,
      "points": 15,
      "explanation": "The SELECT command is used to retrieve data from database tables."
    },
    {
      "id": "q3",
      "question": "What is a primary key?",
      "options": [
        "A field that can contain NULL values",
        "A field that uniquely identifies each record",
        "A field that references another table",
        "A field that stores text data"
      ],
      "correctAnswer": 1,
      "points": 20,
      "explanation": "A primary key is a field that uniquely identifies each record in a table."
    }
  ]
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | string | Yes | ID of the course this quiz belongs to |
| `title` | string | Yes | Quiz title |
| `description` | string | Yes | Quiz description |
| `duration` | string | Yes | Quiz duration (e.g., "60 minutes", "1 hour") |
| `dueDate` | string | Yes | Quiz deadline (ISO 8601 format) |
| `isTimed` | boolean | No | Whether the quiz is timed (default: false) |
| `attemptsAllowed` | number | No | Number of attempts allowed (default: 1) |
| `questions` | array | Yes | Array of quiz questions |

**Question Object Structure**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique question identifier |
| `question` | string | Yes | Question text |
| `options` | string[] | Yes | Array of answer options |
| `correctAnswer` | number | Yes | Index of correct answer (0-based) |
| `points` | number | Yes | Points for this question |
| `explanation` | string | No | Explanation for the correct answer |

### Update Quiz JSON Format

The update quiz endpoint accepts the same JSON format as create quiz, but all fields are optional. Only the fields you want to update need to be included.

```json
{
  "title": "Updated Database Fundamentals Quiz",
  "description": "Updated description",
  "dueDate": "2024-03-15T23:59:59.000Z",
  "questions": [
    {
      "id": "q1",
      "question": "Updated question text",
      "options": [
        "Updated option 1",
        "Updated option 2",
        "Updated option 3",
        "Updated option 4"
      ],
      "correctAnswer": 2,
      "points": 15,
      "explanation": "Updated explanation"
    }
  ]
}
```

### Submit Quiz JSON Format

```json
{
  "answers": {
    "q1": 0,
    "q2": 1,
    "q3": 1
  }
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answers` | object | Yes | Key-value pairs where key is question ID and value is selected option index (0-based) |

## Response Structures

### Quiz Object Response

```json
{
  "id": "clr4x1234567890123456789",
  "courseId": "clr4x1234567890123456789",
  "createdById": "clr4x1234567890123456789",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of database concepts and SQL",
  "duration": "60 minutes",
  "totalQuestions": 3,
  "maxPoints": 45,
  "dueDate": "2024-02-15T23:59:59.000Z",
  "isTimed": true,
  "attemptsAllowed": 2,
  "questionsData": {
    "questions": [
      {
        "id": "q1",
        "question": "What does SQL stand for?",
        "options": [
          "Structured Query Language",
          "Simple Query Language",
          "Standard Query Language",
          "System Query Language"
        ],
        "correctAnswer": 0,
        "points": 10,
        "explanation": "SQL stands for Structured Query Language, which is used to communicate with databases."
      }
    ]
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "course": {
    "id": "clr4x1234567890123456789",
    "name": "Database Management Systems",
    "code": "CS301"
  },
  "createdBy": {
    "id": "clr4x1234567890123456789",
    "email": "teacher@university.edu",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "attempts": [],
  "_count": {
    "attempts": 0
  }
}
```

### Quiz Attempt Response

```json
{
  "id": "clr4x1234567890123456789",
  "quizId": "clr4x1234567890123456789",
  "studentId": "clr4x1234567890123456789",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "submittedAt": "2024-01-15T10:45:00.000Z",
  "score": 35,
  "maxPoints": 45,
  "answers": {
    "studentAnswers": {
      "q1": 0,
      "q2": 1,
      "q3": 1
    },
    "results": [
      {
        "questionId": "q1",
        "studentAnswer": 0,
        "correctAnswer": 0,
        "isCorrect": true,
        "pointsEarned": 10,
        "maxPoints": 10,
        "explanation": "SQL stands for Structured Query Language, which is used to communicate with databases."
      },
      {
        "questionId": "q2",
        "studentAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "pointsEarned": 15,
        "maxPoints": 15,
        "explanation": "The SELECT command is used to retrieve data from database tables."
      },
      {
        "questionId": "q3",
        "studentAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "pointsEarned": 10,
        "maxPoints": 20,
        "explanation": "A primary key is a field that uniquely identifies each record in a table."
      }
    ]
  },
  "quiz": {
    "id": "clr4x1234567890123456789",
    "title": "Database Fundamentals Quiz",
    "course": {
      "id": "clr4x1234567890123456789",
      "name": "Database Management Systems"
    }
  },
  "student": {
    "id": "clr4x1234567890123456789",
    "email": "student@university.edu",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

### Submit Quiz Response

```json
{
  "score": 35,
  "maxPoints": 45,
  "results": [
    {
      "questionId": "q1",
      "studentAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "pointsEarned": 10,
      "maxPoints": 10,
      "explanation": "SQL stands for Structured Query Language, which is used to communicate with databases."
    },
    {
      "questionId": "q2",
      "studentAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true,
      "pointsEarned": 15,
      "maxPoints": 15,
      "explanation": "The SELECT command is used to retrieve data from database tables."
    },
    {
      "questionId": "q3",
      "studentAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true,
      "pointsEarned": 10,
      "maxPoints": 20,
      "explanation": "A primary key is a field that uniquely identifies each record in a table."
    }
  ]
}
```

## Usage Examples

### Example 1: Creating a Quiz

```bash
curl -X POST http://localhost:3000/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "clr4x1234567890123456789",
    "title": "JavaScript Fundamentals",
    "description": "Test your knowledge of JavaScript basics",
    "duration": "45 minutes",
    "dueDate": "2024-02-20T23:59:59.000Z",
    "isTimed": true,
    "attemptsAllowed": 1,
    "questions": [
      {
        "id": "q1",
        "question": "What is the correct way to declare a variable in JavaScript?",
        "options": [
          "var myVariable = 10;",
          "variable myVariable = 10;",
          "v myVariable = 10;",
          "let myVariable = 10;"
        ],
        "correctAnswer": 3,
        "points": 10,
        "explanation": "let is the modern way to declare variables in JavaScript (ES6+)."
      },
      {
        "id": "q2",
        "question": "Which method is used to add an element to the end of an array?",
        "options": [
          "push()",
          "pop()",
          "shift()",
          "unshift()"
        ],
        "correctAnswer": 0,
        "points": 10,
        "explanation": "push() adds one or more elements to the end of an array."
      }
    ]
  }'
```

### Example 2: Submitting a Quiz Attempt

```bash
curl -X POST http://localhost:3000/quizzes/clr4x1234567890123456789/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": 3,
      "q2": 0
    }
  }'
```

### Example 3: Getting Quiz for Student View

```bash
curl -X GET http://localhost:3000/quizzes/clr4x1234567890123456789/student \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Getting Quiz Attempts (Teacher View)

```bash
curl -X GET "http://localhost:3000/quizzes/clr4x1234567890123456789/attempts?studentId=clr4x1234567890123456789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "You cannot create quizzes for this course",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You are not enrolled in this course",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Quiz not found",
  "error": "Not Found"
}
```

### Validation Errors

When request validation fails, the API returns detailed error messages:

```json
{
  "statusCode": 400,
  "message": [
    "courseId should not be empty",
    "title should not be empty",
    "questions must be an array",
    "questions should not be empty"
  ],
  "error": "Bad Request"
}
```

## Security Considerations

1. **Role-Based Access**: Different endpoints require different user roles
2. **Course Enrollment**: Students can only access quizzes for courses they're enrolled in
3. **Answer Protection**: Correct answers are only visible to teachers and supervisors
4. **Attempt Limits**: Students cannot exceed the allowed number of attempts
5. **Time Limits**: Timed quizzes enforce duration restrictions
6. **Deadline Enforcement**: Quizzes cannot be taken after the due date

## Database Schema

The quiz system uses the following database models:

### Quiz Model
```prisma
model Quiz {
  id              String @id @default(cuid())
  courseId        String
  course          Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  createdById     String
  createdBy       User   @relation("QuizCreator", fields: [createdById], references: [id])
  
  title           String
  description     String
  duration        String
  totalQuestions  Int
  maxPoints       Float
  dueDate         DateTime
  isTimed         Boolean @default(false)
  attemptsAllowed Int     @default(1)
  
  questionsData   Json    // Contains questions with correct answers
  
  attempts        QuizAttempt[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### QuizAttempt Model
```prisma
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
}
```

## Best Practices

1. **Question IDs**: Use meaningful, unique IDs for questions (e.g., "q1", "q2")
2. **Points Distribution**: Distribute points evenly or based on question difficulty
3. **Explanations**: Provide helpful explanations for correct answers
4. **Time Limits**: Set reasonable time limits based on question count and complexity
5. **Attempt Limits**: Consider allowing multiple attempts for learning purposes
6. **Deadlines**: Set clear deadlines well in advance of course end dates
7. **Validation**: Always validate student enrollment before allowing quiz access
8. **Audit Logging**: All quiz operations are automatically logged for audit purposes 