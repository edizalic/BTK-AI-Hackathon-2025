import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
    example: 'clr4x1234567890123456789',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Assignment Due Soon',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your assignment "Database Project" is due in 2 hours.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.ASSIGNMENT_DUE,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Notification priority',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Related course ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Related assignment ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  assignmentId?: string;

  @ApiPropertyOptional({
    description: 'Related grade ID',
    example: 'clr4x1234567890123456789',
  })
  @IsOptional()
  @IsString()
  gradeId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { customData: 'value' },
  })
  @IsOptional()
  metadata?: any;
}