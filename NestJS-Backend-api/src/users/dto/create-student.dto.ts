import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Student email address',
    example: 'jane.doe@student.edu',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Student password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'Jane',
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Student ID number',
    example: 'STU20240001',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Student grade level',
    example: '11th Grade',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Student major',
    example: 'Computer Science',
  })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({
    description: 'Student minor',
    example: 'Mathematics',
  })
  @IsOptional()
  @IsString()
  minor?: string;

  @ApiPropertyOptional({
    description: 'Enrollment date',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiPropertyOptional({
    description: 'Advisory teacher ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  advisoryTeacherId?: string;
}