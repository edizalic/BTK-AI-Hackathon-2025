import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  userId: string;

  @IsString()
  token: string;

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}