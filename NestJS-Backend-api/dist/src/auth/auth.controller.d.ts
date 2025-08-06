import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
export declare class AuthController {
    private readonly authService;
    private readonly sessionService;
    constructor(authService: AuthService, sessionService: SessionService);
    login(loginDto: LoginDto, req: any, ip: string, userAgent: string): Promise<AuthResponse>;
    logout(user: UserWithProfile, authorization: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    getProfile(user: UserWithProfile): Promise<UserWithProfile>;
    changePassword(user: UserWithProfile, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getUserSessions(user: UserWithProfile): Promise<{
        id: string;
        ipAddress: string;
        userAgent: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
    invalidateSession(user: UserWithProfile): Promise<{
        message: string;
    }>;
}
