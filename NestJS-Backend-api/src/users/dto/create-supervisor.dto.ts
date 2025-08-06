import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupervisorDto {
  @ApiProperty({
    description: 'Supervisor email address',
    example: 'mary.johnson@supervisor.edu',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Supervisor password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'Supervisor first name',
    example: 'Mary',
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    description: 'Supervisor last name',
    example: 'Johnson',
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty({
    description: 'Department',
    example: 'Mathematics',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: 'Position/Title',
    example: 'Department Head',
  })
  @IsString()
  position: string;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'SUP20240001',
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
}