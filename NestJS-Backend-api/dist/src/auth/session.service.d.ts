import { ConfigService } from '@nestjs/config';
import { Session } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
export declare class SessionService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    createSession(createSessionDto: CreateSessionDto): Promise<Session>;
    findActiveSession(token: string): Promise<Session | null>;
    invalidateSession(token: string): Promise<void>;
    invalidateAllUserSessions(userId: string): Promise<void>;
    getUserActiveSessions(userId: string): Promise<Session[]>;
    extendSession(token: string): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    getSessionStats(userId?: string): Promise<{
        total: number;
        active: number;
        expired: number;
    }>;
    findActiveSessionByUserId(userId: string): Promise<Session | null>;
    updateSessionToken(sessionId: string, newAccessToken: string): Promise<void>;
}
