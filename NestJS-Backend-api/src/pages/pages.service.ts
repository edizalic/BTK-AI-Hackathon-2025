import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPageConfig(pageId: string, userRole: UserRole) {
    return this.prisma.pageConfiguration.findFirst({
      where: {
        id: pageId,
        OR: [
          { userType: userRole },
          { userType: null }, // Public pages
        ],
      },
    });
  }

  async getAvailablePages(userRole: UserRole, permissions: string[] = []) {
    return this.prisma.pageConfiguration.findMany({
      where: {
        OR: [
          { userType: userRole },
          { userType: null },
        ],
        requiresAuth: true,
      },
      orderBy: { title: 'asc' },
    });
  }
}