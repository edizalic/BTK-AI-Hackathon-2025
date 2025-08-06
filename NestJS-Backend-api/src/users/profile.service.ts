import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async updateProfile(userId: string, updateData: any): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: updateData,
    });
  }

  async createProfile(userId: string, profileData: any): Promise<UserProfile> {
    return this.prisma.userProfile.create({
      data: {
        userId,
        ...profileData,
      },
    });
  }
}