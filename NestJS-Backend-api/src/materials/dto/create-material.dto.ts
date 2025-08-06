import { IsString, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material title',
    example: 'Database Design Slides - Chapter 1',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Material description',
    example: 'Introduction to database concepts and ER diagrams',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Material type',
    enum: MaterialType,
    example: MaterialType.SLIDES,
  })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiPropertyOptional({
    description: 'Is this material required',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'External URL (for links, references)',
    example: 'https://example.com/resource',
  })
  @IsOptional()
  @IsUrl()
  url?: string;
}