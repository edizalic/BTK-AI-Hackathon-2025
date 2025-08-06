import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GradeFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by course ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by semester',
    example: 'Fall',
  })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({
    description: 'Filter by year',
    example: 2024,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({
    description: 'Filter by grading period',
    example: 'midterm',
  })
  @IsOptional()
  @IsString()
  gradingPeriod?: string;
}