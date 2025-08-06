import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Session } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const sessionTimeoutHours = this.configService.get<number>('security.sessionTimeout');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + sessionTimeoutHours);

    return this.prisma.session.create({
      data: {
        userId: createSessionDto.userId,
        token: createSessionDto.token,
        expiresAt,
        ipAddress: createSessionDto.ipAddress,
        userAgent: createSessionDto.userAgent,
      },
    });
  }

  async findActiveSession(token: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  }

  async invalidateSession(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async extendSession(token: string): Promise<void> {
    const sessionTimeoutHours = this.configService.get<number>('security.sessionTimeout');
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + sessionTimeoutHours);

    await this.prisma.session.updateMany({
      where: {
        token,
        isActive: true,
      },
      data: {
        expiresAt: newExpiresAt,
      },
    });
  }

  // Clean up expired sessions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false },
          ],
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired sessions`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
    }
  }

  async getSessionStats(userId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    const where = userId ? { userId } : {};
    const now = new Date();

    const [total, active, expired] = await Promise.all([
      this.prisma.session.count({ where }),
      this.prisma.session.count({
        where: {
          ...where,
          isActive: true,
          expiresAt: { gte: now },
        },
      }),
      this.prisma.session.count({
        where: {
          ...where,
          OR: [
            { isActive: false },
            { expiresAt: { lt: now } },
          ],
        },
      }),
    ]);

    return { total, active, expired };
  }

  async findActiveSessionByUserId(userId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateSessionToken(sessionId: string, newAccessToken: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { token: newAccessToken },
    });
  }
}