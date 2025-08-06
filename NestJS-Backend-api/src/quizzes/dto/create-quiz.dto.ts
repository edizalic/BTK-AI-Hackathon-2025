import { IsString, IsDateString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class QuizQuestionDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'q1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Question text',
    example: 'What does SQL stand for?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Answer options',
    example: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Index of the correct answer (0-based)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  correctAnswer: number;

  @ApiProperty({
    description: 'Points for this question',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiPropertyOptional({
    description: 'Explanation for the correct answer',
    example: 'SQL stands for Structured Query Language, which is used to communicate with databases.',
  })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuizDto {
  @ApiProperty({
    description: 'Course ID',
    example: 'clr4x1234567890123456789',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Database Fundamentals Quiz',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Test your understanding of database concepts and SQL',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Quiz duration',
    example: '60 minutes',
  })
  @IsString()
  duration: string;

  @ApiProperty({
    description: 'Due date for the quiz',
    example: '2024-02-15T23:59:59.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Is the quiz timed',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTimed?: boolean;

  @ApiPropertyOptional({
    description: 'Number of attempts allowed',
    example: 2,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  attemptsAllowed?: number;

  @ApiProperty({
    description: 'Quiz questions with correct answers',
    type: [QuizQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}