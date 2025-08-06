import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Letter grade',
    example: 'A',
  })
  @IsString()
  letterGrade: string;

  @ApiProperty({
    description: 'Points scored',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({
    description: 'Maximum points possible',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  maxPoints: number;

  @ApiPropertyOptional({
    description: 'Feedback for the student',
    example: 'Good work! Consider reviewing chapter 5 for improvement.',
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    description: 'Is this extra credit',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isExtraCredit?: boolean;

  @ApiPropertyOptional({
    description: 'Weight of this grade in course calculation',
    example: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  weight?: number;
}