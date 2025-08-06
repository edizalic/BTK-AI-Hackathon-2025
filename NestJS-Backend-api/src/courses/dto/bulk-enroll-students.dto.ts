import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkEnrollStudentsDto {
  @ApiProperty({
    description: 'Array of student IDs to enroll in the course',
    type: [String],
    example: ['student-id-1', 'student-id-2', 'student-id-3'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  studentIds: string[];
}