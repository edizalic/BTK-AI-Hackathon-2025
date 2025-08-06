import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignAdvisoryDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'clr4x1234567890123456789',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Advisory teacher ID',
    example: 'clr4x9876543210987654321',
  })
  @IsString()
  advisoryTeacherId: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the assignment',
    example: 'Student needs extra support in mathematics.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}