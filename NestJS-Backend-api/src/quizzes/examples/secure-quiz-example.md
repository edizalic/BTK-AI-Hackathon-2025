# Secure Quiz System Examples

## 1. Creating a Quiz (Teacher/Supervisor)

### POST /quizzes
```json
{
  "courseId": "course_cs_database_101",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of basic database concepts, SQL, and database design principles",
  "duration": "60 minutes",
  "dueDate": "2024-02-20T23:59:59.000Z",
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
      "question": "Which of the following is NOT a type of database relationship?",
      "options": [
        "One-to-One",
        "One-to-Many",
        "Many-to-Many",
        "All-to-All"
      ],
      "correctAnswer": 3,
      "points": 10,
      "explanation": "All-to-All is not a standard database relationship type."
    },
    {
      "id": "q3",
      "question": "What is a primary key in a database table?",
      "options": [
        "A field that can contain duplicate values",
        "A field that uniquely identifies each record in a table",
        "A field that can be null",
        "A field used only for sorting"
      ],
      "correctAnswer": 1,
      "points": 10,
      "explanation": "A primary key uniquely identifies each record and cannot contain null or duplicate values."
    }
  ]
}
```

### Response:
```json
{
  "id": "quiz_db_fundamentals_001",
  "courseId": "course_cs_database_101",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of basic database concepts, SQL, and database design principles",
  "duration": "60 minutes",
  "totalQuestions": 3,
  "maxPoints": 30,
  "dueDate": "2024-02-20T23:59:59.000Z",
  "isTimed": true,
  "attemptsAllowed": 2,
  "questionsData": {
    "questions": [
      // Full questions with correct answers (only visible to teachers)
    ]
  },
  "createdAt": "2024-02-15T10:00:00.000Z"
}
```

## 2. Student Getting Quiz (Without Correct Answers)

### GET /quizzes/{id}/student
```json
{
  "id": "quiz_db_fundamentals_001",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of basic database concepts, SQL, and database design principles",
  "duration": "60 minutes",
  "totalQuestions": 3,
  "maxPoints": 30,
  "dueDate": "2024-02-20T23:59:59.000Z",
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
      "points": 10
      // NO correctAnswer or explanation field
    },
    {
      "id": "q2",
      "question": "Which of the following is NOT a type of database relationship?",
      "options": [
        "One-to-One",
        "One-to-Many",
        "Many-to-Many",
        "All-to-All"
      ],
      "points": 10
      // NO correctAnswer or explanation field
    },
    {
      "id": "q3",
      "question": "What is a primary key in a database table?",
      "options": [
        "A field that can contain duplicate values",
        "A field that uniquely identifies each record in a table",
        "A field that can be null",
        "A field used only for sorting"
      ],
      "points": 10
      // NO correctAnswer or explanation field
    }
  ]
}
```

## 3. Student Submitting Quiz

### POST /quizzes/{id}/submit
```json
{
  "answers": {
    "q1": 0,
    "q2": 3,
    "q3": 1
  }
}
```

### Response (Graded Results):
```json
{
  "score": 30,
  "maxPoints": 30,
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
      "studentAnswer": 3,
      "correctAnswer": 3,
      "isCorrect": true,
      "pointsEarned": 10,
      "maxPoints": 10,
      "explanation": "All-to-All is not a standard database relationship type."
    },
    {
      "questionId": "q3",
      "studentAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true,
      "pointsEarned": 10,
      "maxPoints": 10,
      "explanation": "A primary key uniquely identifies each record and cannot contain null or duplicate values."
    }
  ]
}
```

## 4. Teacher Getting Quiz (With Correct Answers)

### GET /quizzes/{id}/teacher
```json
{
  "id": "quiz_db_fundamentals_001",
  "title": "Database Fundamentals Quiz",
  "description": "Test your understanding of basic database concepts",
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
        "explanation": "SQL stands for Structured Query Language"
      }
      // ... more questions with correct answers
    ]
  },
  // ... other quiz metadata
}
```

## Security Features Implemented

1. **Correct answers never sent to frontend for students**
2. **Server-side grading prevents tampering**
3. **Role-based access control**
4. **Enrollment verification**
5. **Attempt limits and time restrictions**
6. **Secure question storage in JSON field**

## API Endpoints Summary

- `POST /quizzes` - Create quiz (Teacher/Supervisor only)
- `GET /quizzes/{id}/student` - Get quiz for student (no answers)
- `GET /quizzes/{id}/teacher` - Get quiz for teacher (with answers)
- `POST /quizzes/{id}/submit` - Submit and grade quiz (Student only)
- `GET /quizzes/{id}/attempts` - Get quiz attempts (Teacher/Supervisor only)