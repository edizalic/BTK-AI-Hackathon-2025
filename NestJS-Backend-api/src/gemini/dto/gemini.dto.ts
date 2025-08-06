import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsArray, 
  IsNumber,
  IsInt,
  Min,
  Max,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetWeeklyStudyPlanDto {
  @ApiProperty({ 
    description: 'Course ID',
    example: 'course_123'
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}

export class GetQuizDto {
  @ApiProperty({ 
    description: 'Course ID',
    example: 'course_123'
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ 
    description: 'Weeks to cover in the quiz',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsInt({ each: true })
  @Min(1, { each: true })
  weeksToCover: number[];
}

export class GetAssignmentDto {
  @ApiProperty({ 
    description: 'Course ID',
    example: 'course_123'
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ 
    description: 'Weeks to cover in the assignment',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsInt({ each: true })
  @Min(1, { each: true })
  weeksToCover: number[];
}

export class AskQuizQuestionDto {
  @ApiProperty({ 
    description: 'Course ID',
    example: 'course_123'
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ 
    description: 'Question to ask about the quiz',
    example: 'What is the logic behind question 3?'
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class GetPersonalReportDto {
  @ApiProperty({ 
    description: 'Course ID',
    example: 'course_123'
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ 
    description: 'Student ID',
    example: 'student_123'
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;
}

export class WeeklyStudyPlanResponseDto {
  @ApiProperty({ 
    description: 'Generated weekly study plan',
    example: {
      weeks: [
        {
          week: 1,
          topics: ['Introduction to Course', 'Basic Concepts'],
          activities: ['Reading Chapter 1', 'Assignment 1'],
          objectives: ['Understand course structure', 'Learn basic terminology']
        }
      ]
    }
  })
  studyPlan: any;
}

export class QuizResponseDto {
  @ApiProperty({ 
    description: 'Generated quiz',
    example: {
      title: 'Week 1-3 Quiz',
      questions: [
        {
          question: 'What is the main concept covered in week 1?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A'
        }
      ]
    }
  })
  quiz: any;
}

export class AssignmentResponseDto {
  @ApiProperty({ 
    description: 'Generated assignment',
    example: {
      title: 'Week 1-3 Assignment',
      description: 'Complete the following tasks...',
      requirements: ['Task 1', 'Task 2'],
      rubric: 'Grading criteria...'
    }
  })
  assignment: any;
}

export class QuizQuestionResponseDto {
  @ApiProperty({ 
    description: 'Answer to the quiz question',
    example: 'The logic behind this question is...'
  })
  answer: string;
}

export class PersonalReportResponseDto {
  @ApiProperty({ 
    description: 'Personal report on student performance',
    example: {
      overallScore: 75,
      weakAreas: ['Topic A', 'Topic B'],
      recommendations: ['Review Chapter 3', 'Practice more exercises'],
      strengths: ['Good understanding of basic concepts']
    }
  })
  report: any;
} 