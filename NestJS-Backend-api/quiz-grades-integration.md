# Quiz Grades Integration

## Overview

Quiz scores are now automatically logged into the grades table when students submit quiz attempts. This integration allows quiz grades to appear alongside assignment grades in student grade reports and transcripts.

## How It Works

### 1. Quiz Submission Process
When a student submits a quiz:
1. Quiz attempt is graded automatically
2. Score is calculated based on correct answers
3. **NEW**: A grade entry is automatically created in the `grades` table
4. Letter grade is calculated based on percentage score

### 2. Grade Storage
Quiz grades are stored in the `grades` table with:
- `studentId`: The student who took the quiz
- `courseId`: The course the quiz belongs to
- `assignmentId`: `null` (distinguishes from assignment grades)
- `submissionId`: `null` (distinguishes from assignment grades)
- `score`: The quiz score
- `maxPoints`: Maximum possible points for the quiz
- `percentage`: Calculated percentage score
- `letterGrade`: Letter grade (A, B, C, etc.)
- `feedback`: "Quiz: [Quiz Title]" (identifies it as a quiz grade)
- `gradedById`: Quiz creator's ID (auto-graded)

### 3. Grade Retrieval
When retrieving student grades via `/grades/student/{studentId}`:
- Both assignment and quiz grades are returned
- Each grade includes a `gradeType` field:
  - `'assignment'` for assignment grades
  - `'quiz'` for quiz grades
- Each grade includes a `title` field with the assignment/quiz name

## API Endpoints

### Get Student Grades (includes quiz grades)
```
GET /grades/student/{studentId}
```

**Response includes:**
```json
[
  {
    "id": "grade-id",
    "studentId": "student-id",
    "courseId": "course-id",
    "score": 85,
    "maxPoints": 100,
    "percentage": 85.0,
    "letterGrade": "B",
    "feedback": "Quiz: Mathematics Midterm",
    "gradeType": "quiz",
    "title": "Mathematics Midterm",
    "gradedDate": "2024-01-15T10:30:00Z",
    "course": {
      "name": "Mathematics 101",
      "department": { "name": "Mathematics" }
    }
  }
]
```

### Calculate Student GPA (includes quiz grades)
```
GET /grades/student/{studentId}/gpa
```

### Generate Grade Report (includes quiz grades)
```
GET /grades/student/{studentId}/report
```

## Grade Calculation

### Letter Grade Scale
- A: 93-100%
- A-: 90-92%
- B+: 87-89%
- B: 83-86%
- B-: 80-82%
- C+: 77-79%
- C: 73-76%
- C-: 70-72%
- D+: 67-69%
- D: 63-66%
- D-: 60-62%
- F: Below 60%

### Quiz Weight
- Default weight: 1.0
- Can be adjusted by teachers if needed

## Benefits

1. **Unified Grade System**: All grades (assignments and quizzes) are stored in one place
2. **Complete Transcripts**: Quiz grades appear in student transcripts and reports
3. **GPA Calculation**: Quiz grades are included in GPA calculations
4. **Grade Filtering**: Can filter grades by course, semester, year, etc.
5. **Audit Trail**: All grades have proper audit information (who graded, when, etc.)

## Technical Implementation

### Files Modified
- `src/quizzes/quiz-attempts.service.ts`: Added grade creation on quiz submission
- `src/grades/grades.service.ts`: Enhanced grade retrieval to include quiz information

### Database Schema
- Uses existing `grades` table
- No schema changes required
- Quiz grades identified by `assignmentId` and `submissionId` being `null`
- Quiz title stored in `feedback` field with "Quiz: " prefix

## Testing

To test the integration:

1. Create a quiz in a course
2. Have a student take the quiz
3. Submit the quiz
4. Check that a grade entry appears in the grades table
5. Retrieve student grades via API to verify quiz grade appears

## Future Enhancements

- Add quiz-specific weight configuration
- Support for different grading scales per course
- Quiz grade override capabilities for teachers
- Detailed quiz analytics and statistics 