import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsArray, 
  IsEnum, 
  IsOptional, 
  IsDateString,
  Min,
  Max,
  ArrayNotEmpty,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseLevel } from '@prisma/client';
import { StudyPlanWeekDto } from './study-plan.dto';

export class CreateCourseDto {
  @ApiProperty({ 
    description: 'Unique course code',
    example: 'CS204'
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ 
    description: 'Course name',
    example: 'Computer Science Fundamentals'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Course description',
    example: 'Introduction to computer science concepts'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Number of credits',
    example: 3,
    minimum: 1,
    maximum: 6
  })
  @IsInt()
  @Min(1)
  @Max(6)
  credits: number;

  @ApiProperty({ 
    description: 'Days of the week when course meets',
    example: ['monday', 'wednesday', 'friday'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  scheduleDays: string[];

  @ApiProperty({ 
    description: 'Start time in HH:MM format',
    example: '09:00'
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ 
    description: 'End time in HH:MM format',
    example: '10:30'
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ 
    description: 'Location/room identifier',
    example: 'Room 101'
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ 
    description: 'Building name',
    example: 'Science Building',
    required: false
  })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ 
    description: 'Room number',
    example: '202',
    required: false
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ 
    description: 'ID of the instructor (teacher) assigned to this course',
    example: 'cmdz6y2b80006vvy4gvza1dt3'
  })
  @IsString()
  @IsNotEmpty()
  instructorId: string;

  @ApiProperty({ 
    description: 'Semester',
    example: 'Spring'
  })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ 
    description: 'Academic year',
    example: 2025
  })
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({ 
    description: 'Maximum number of students that can enroll',
    example: 30,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ 
    description: 'Course category',
    example: 'Core'
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ 
    description: 'Department ID',
    example: 'dept_computer_science'
  })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ 
    description: 'Course difficulty level',
    enum: CourseLevel,
    example: CourseLevel.BEGINNER
  })
  @Transform(({ value }) => {
    // Map frontend level values to backend enum values
    const levelMap: Record<string, CourseLevel> = {
      'UNDERGRADUATE': CourseLevel.BEGINNER,
      'GRADUATE': CourseLevel.INTERMEDIATE,
      'DOCTORAL': CourseLevel.ADVANCED,
      // Also support direct backend enum values for flexibility
      'BEGINNER': CourseLevel.BEGINNER,
      'INTERMEDIATE': CourseLevel.INTERMEDIATE,
      'ADVANCED': CourseLevel.ADVANCED
    };
    
    return levelMap[value?.toString().toUpperCase()] || value;
  })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ 
    description: 'Course start date',
    example: '2025-09-25'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'Course end date',
    example: '2025-12-05'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: 'Enrollment deadline',
    example: '2025-09-20',
    required: false
  })
  @IsOptional()
  @IsDateString()
  enrollmentDeadline?: string;

  @ApiProperty({ 
    description: 'Study plan for the course',
    example: [
      {
        "week": "1",
        "description": "Introduction to Course Concepts",
        "topics": ["Variables", "Data Types"],
        "assignments": ["Assignment 1"],
        "readings": ["Chapter 1-2"]
      }
    ],
    required: false,
    type: [StudyPlanWeekDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyPlanWeekDto)
  studyPlan?: StudyPlanWeekDto[];
}