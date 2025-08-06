import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { SessionService } from './session.service';
import { UsersService } from '../users/users.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly sessionService;
    private readonly usersService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, sessionService: SessionService, usersService: UsersService);
    validateUser(email: string, password: string): Promise<UserWithProfile | null>;
    login(user: UserWithProfile, ipAddress: string, userAgent: string): Promise<AuthResponse>;
    logout(userId: string, token: string): Promise<void>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
}
