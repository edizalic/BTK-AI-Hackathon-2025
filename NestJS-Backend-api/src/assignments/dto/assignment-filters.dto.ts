import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType, AssignmentStatus } from '@prisma/client';

export class AssignmentFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by course ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignment status',
    enum: AssignmentStatus,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by assignment type',
    enum: AssignmentType,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  studentId?: string;
}