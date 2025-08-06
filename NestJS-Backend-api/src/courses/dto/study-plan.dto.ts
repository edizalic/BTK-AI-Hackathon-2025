import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsArray, 
  ValidateNested, 
  IsOptional 
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudyPlanWeekDto {
  @ApiProperty({ 
    description: 'Week number or identifier',
    example: '1'
  })
  @IsString()
  @IsNotEmpty()
  week: string;

  @ApiProperty({ 
    description: 'Description of what will be covered in this week',
    example: 'Introduction to Course Concepts and Basic Principles'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Topics to be covered in this week',
    example: ['Variables and Data Types', 'Control Structures'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiProperty({ 
    description: 'Assignments for this week',
    example: ['Assignment 1: Basic Programming'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignments?: string[];

  @ApiProperty({ 
    description: 'Required readings for this week',
    example: ['Chapter 1-2 from Textbook'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readings?: string[];
}

export class CreateStudyPlanDto {
  @ApiProperty({ 
    description: 'Array of study plan weeks',
    type: [StudyPlanWeekDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyPlanWeekDto)
  weeks: StudyPlanWeekDto[];
}

export class UpdateStudyPlanDto {
  @ApiProperty({ 
    description: 'Array of study plan weeks',
    type: [StudyPlanWeekDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudyPlanWeekDto)
  weeks: StudyPlanWeekDto[];
}