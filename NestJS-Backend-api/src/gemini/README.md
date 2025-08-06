# Gemini AI Module

This module provides AI-powered educational features using Google's Gemini AI through LangChain. It offers comprehensive tools for generating study plans, quizzes, assignments, and personalized reports.

## Features

### 1. Weekly Study Plan Generation
- **Endpoint**: `GET /gemini/:courseId/get-weekly-study-plan`
- **Description**: Generates a comprehensive weekly study plan based on course information
- **Input**: Course ID
- **Output**: Structured study plan with learning objectives, topics, readings, activities, and assessments

### 2. Quiz Generation
- **Endpoint**: `POST /gemini/:courseId/get-quiz`
- **Description**: Creates quizzes based on course content and study plan for specified weeks
- **Input**: Course ID and weeks to cover
- **Output**: Quiz with multiple choice, true/false, and short answer questions

### 3. Assignment Generation
- **Endpoint**: `POST /gemini/:courseId/get-assignment`
- **Description**: Generates comprehensive assignments based on course content
- **Input**: Course ID and weeks to cover
- **Output**: Detailed assignment with requirements, rubric, and instructions

### 4. Quiz Question Analysis
- **Endpoint**: `POST /gemini/:courseId/ask-quiz-question`
- **Description**: Provides detailed explanations for quiz questions and answers
- **Input**: Course ID and specific question
- **Output**: Comprehensive explanation with logic and reasoning

### 5. Personal Performance Report
- **Endpoint**: `POST /gemini/:courseId/get-personal-report`
- **Description**: Analyzes student quiz performance and generates personalized reports
- **Input**: Course ID and student ID
- **Output**: Detailed report on knowledge gaps, strengths, and recommendations

## Setup

### Prerequisites

1. **Google GenAI API Key**: You need a valid Google GenAI API key
2. **Environment Variable**: Add the following to your `.env` file:
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

### Dependencies

The module uses the following packages (already included in package.json):
- `@langchain/core`: Core LangChain functionality
- `@langchain/google-genai`: Google GenAI integration
- `@nestjs/config`: Configuration management

## API Endpoints

### 1. Generate Weekly Study Plan

```http
GET /gemini/{courseId}/get-weekly-study-plan
```

**Response Example:**
```json
{
  "studyPlan": {
    "weeks": [
      {
        "weekNumber": 1,
        "objectives": ["Understand course structure", "Learn basic terminology"],
        "topics": ["Introduction to Course", "Basic Concepts"],
        "readings": ["Chapter 1", "Course Syllabus"],
        "activities": ["Assignment 1", "Discussion Forum"],
        "assessments": ["Quiz 1", "Participation"],
        "outcomes": ["Familiarity with course content", "Basic concept understanding"]
      }
    ]
  }
}
```

### 2. Generate Quiz

```http
POST /gemini/{courseId}/get-quiz
Content-Type: application/json

{
  "weeksToCover": [1, 2, 3]
}
```

**Response Example:**
```json
{
  "quiz": {
    "title": "Week 1-3 Quiz",
    "description": "Comprehensive quiz covering weeks 1-3",
    "totalQuestions": 18,
    "maxPoints": 100,
    "questions": [
      {
        "question": "What is the main concept covered in week 1?",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "points": 5,
        "explanation": "Week 1 focuses on basic concepts..."
      }
    ]
  }
}
```

### 3. Generate Assignment

```http
POST /gemini/{courseId}/get-assignment
Content-Type: application/json

{
  "weeksToCover": [1, 2, 3]
}
```

**Response Example:**
```json
{
  "assignment": {
    "title": "Week 1-3 Assignment",
    "description": "Comprehensive assignment covering weeks 1-3",
    "objectives": ["Apply learned concepts", "Demonstrate understanding"],
    "requirements": ["Complete all tasks", "Submit on time"],
    "deliverables": ["Written report", "Code implementation"],
    "instructions": "Step-by-step instructions...",
    "rubric": "Assessment criteria...",
    "timeCommitment": "4-6 hours",
    "resources": ["Textbook", "Online materials"],
    "submissionGuidelines": "Submit via LMS",
    "dueDate": "2025-02-15"
  }
}
```

### 4. Ask Quiz Question

```http
POST /gemini/{courseId}/ask-quiz-question
Content-Type: application/json

{
  "question": "What is the logic behind question 3?"
}
```

**Response Example:**
```json
{
  "answer": "The logic behind this question is based on the fundamental principle that..."
}
```

### 5. Get Personal Report

```http
POST /gemini/{courseId}/get-personal-report
Content-Type: application/json

{
  "studentId": "student_123"
}
```

**Response Example:**
```json
{
  "report": {
    "overallScore": 75,
    "performanceLevel": "Good",
    "strengths": ["Good understanding of basic concepts"],
    "weakAreas": ["Advanced topics", "Complex problem solving"],
    "recommendations": ["Review Chapter 3", "Practice more exercises"],
    "studyTips": ["Use spaced repetition", "Create concept maps"],
    "resources": ["Additional readings", "Practice problems"],
    "nextSteps": ["Focus on weak areas", "Schedule tutoring"]
  }
}
```

## Error Handling

The module includes comprehensive error handling:

- **404 Not Found**: Course not found
- **400 Bad Request**: Invalid input, missing study plan, or AI generation failure
- **500 Internal Server Error**: Configuration issues or API key problems

## Configuration

### Environment Variables

```env
# Required
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Optional (with defaults)
GOOGLE_GENAI_MODEL=gemini-pro
GOOGLE_GENAI_MAX_TOKENS=2048
GOOGLE_GENAI_TEMPERATURE=0.7
```

### Model Configuration

The Gemini model is configured with:
- **Model**: `gemini-pro`
- **Max Output Tokens**: 2048
- **Temperature**: 0.7 (balanced creativity and consistency)

## Security Considerations

1. **API Key Security**: Store the Google GenAI API key securely in environment variables
2. **Input Validation**: All inputs are validated using class-validator decorators
3. **Rate Limiting**: Consider implementing rate limiting for AI endpoints
4. **Error Handling**: Sensitive information is not exposed in error messages

## Integration with Existing Modules

The Gemini module integrates with:
- **Courses Module**: Retrieves course information and study plans
- **Quizzes Module**: Analyzes quiz attempts for personal reports
- **Database Module**: Uses Prisma for data access

## Best Practices

1. **Study Plan First**: Generate a study plan before creating quizzes or assignments
2. **Week Specification**: Specify weeks to cover for targeted content generation
3. **Student Data**: Ensure student has quiz attempts before generating personal reports
4. **Error Handling**: Implement proper error handling for AI generation failures

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `GOOGLE_GENAI_API_KEY` is set correctly
2. **Study Plan Missing**: Generate study plan before creating quizzes/assignments
3. **JSON Parsing Errors**: AI responses are validated and parsed as JSON
4. **Rate Limiting**: Google GenAI has rate limits; implement retry logic if needed

### Debug Mode

Enable debug logging by setting the log level in your NestJS configuration:

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

## Future Enhancements

1. **Caching**: Implement caching for generated content
2. **Batch Processing**: Support for generating multiple items at once
3. **Custom Prompts**: Allow customization of AI prompts
4. **Progress Tracking**: Enhanced progress tracking and analytics
5. **Multi-language Support**: Support for multiple languages in generated content 