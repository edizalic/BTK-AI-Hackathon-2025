import { IsEmail, IsString, MinLength, IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({
    description: 'Teacher email address',
    example: 'john.smith@teacher.edu',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Teacher password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'Teacher first name',
    example: 'John',
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    description: 'Teacher last name',
    example: 'Smith',
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty({
    description: 'Department',
    example: 'Computer Science',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: 'Position/Title',
    example: 'Assistant Professor',
  })
  @IsString()
  position: string;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'EMP20240001',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Hire date',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    description: 'Areas of specialization',
    example: ['Data Structures', 'Algorithms', 'Web Development'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[];

  @ApiPropertyOptional({
    description: 'Office location',
    example: 'Building A, Room 205',
  })
  @IsOptional()
  @IsString()
  officeLocation?: string;

  @ApiPropertyOptional({
    description: 'Office hours',
    example: 'Mon-Wed-Fri 2:00-4:00 PM',
  })
  @IsOptional()
  @IsString()
  officeHours?: string;
}