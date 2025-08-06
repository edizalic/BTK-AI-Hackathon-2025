import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Student answers as key-value pairs where key is question ID and value is selected option index',
    example: { "q1": 0, "q2": 3, "q3": 1, "q4": 2 },
  })
  @IsObject()
  answers: Record<string, number>;
}