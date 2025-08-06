import { IsString, IsDateString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Course ID',
    example: 'clr4x1234567890123456789',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Database Design Project',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Assignment description',
    example: 'Design and implement a relational database for a library management system',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Assignment type',
    enum: AssignmentType,
    example: AssignmentType.PROJECT,
  })
  @IsEnum(AssignmentType)
  type: AssignmentType;

  @ApiProperty({
    description: 'Due date',
    example: '2024-02-15T23:59:59.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    description: 'Maximum points',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  maxPoints: number;

  @ApiPropertyOptional({
    description: 'Is group work',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGroupWork?: boolean;

  @ApiPropertyOptional({
    description: 'File attachment IDs',
    example: ['clr4x1234567890123456789'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}