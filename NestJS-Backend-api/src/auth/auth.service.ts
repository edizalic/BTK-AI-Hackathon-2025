import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../database/prisma.service';
import { SessionService } from './session.service';
import { UsersService } from '../users/users.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      // Remove password hash from returned user
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as UserWithProfile;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: UserWithProfile, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    try {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role as UserRole,
        isSupervisor: user.isSupervisor || false,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '30d',
      });

      // Create session
      await this.sessionService.createSession({
        userId: user.id,
        token: accessToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          isSupervisor: user.isSupervisor || false,
          profile: user.profile ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatar: user.avatar,
          } : undefined,
        },
      };
    } catch (error) {
      this.logger.error('Error during login:', error);
      throw new BadRequestException('Login failed');
    }
  }

  async logout(userId: string, token: string): Promise<void> {
    try {
      await this.sessionService.invalidateSession(token);
    } catch (error) {
      this.logger.error('Error during logout:', error);
      throw new BadRequestException('Logout failed');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const { refreshToken } = refreshTokenDto;

      // Verify the refresh token
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify(refreshToken);
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Find active session for the user from the refresh token
      const session = await this.sessionService.findActiveSessionByUserId(payload.sub);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user to ensure they still exist and are active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role as UserRole,
        isSupervisor: user.isSupervisor || false,
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      // Update session with new access token
      await this.sessionService.updateSessionToken(session.id, newAccessToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error refreshing token:', error);
      throw new BadRequestException('Token refresh failed');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePasswordDto;

      // Get user with current password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = this.configService.get<number>('auth.saltRounds') || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Invalidate all user sessions except current one (optional)
      // await this.sessionService.invalidateAllUserSessions(userId);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error changing password:', error);
      throw new BadRequestException('Password change failed');
    }
  }
}