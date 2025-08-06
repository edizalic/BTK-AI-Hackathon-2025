"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../database/prisma.service");
const session_service_1 = require("./session.service");
const users_service_1 = require("../users/users.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService, sessionService, usersService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.sessionService = sessionService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(email, password) {
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
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            this.logger.error('Error validating user:', error);
            return null;
        }
    }
    async login(user, ipAddress, userAgent) {
        try {
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                isSupervisor: user.isSupervisor || false,
            };
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
            });
            await this.sessionService.createSession({
                userId: user.id,
                token: accessToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isSupervisor: user.isSupervisor || false,
                    profile: user.profile ? {
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                        avatar: user.avatar,
                    } : undefined,
                },
            };
        }
        catch (error) {
            this.logger.error('Error during login:', error);
            throw new common_1.BadRequestException('Login failed');
        }
    }
    async logout(userId, token) {
        try {
            await this.sessionService.invalidateSession(token);
        }
        catch (error) {
            this.logger.error('Error during logout:', error);
            throw new common_1.BadRequestException('Logout failed');
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            const { refreshToken } = refreshTokenDto;
            let payload;
            try {
                payload = this.jwtService.verify(refreshToken);
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const session = await this.sessionService.findActiveSessionByUserId(payload.sub);
            if (!session || !session.isActive || session.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { profile: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                isSupervisor: user.isSupervisor || false,
            };
            const newAccessToken = this.jwtService.sign(newPayload);
            await this.sessionService.updateSessionToken(session.id, newAccessToken);
            return { accessToken: newAccessToken };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error('Error refreshing token:', error);
            throw new common_1.BadRequestException('Token refresh failed');
        }
    }
    async changePassword(userId, changePasswordDto) {
        try {
            const { currentPassword, newPassword } = changePasswordDto;
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
            const saltRounds = this.configService.get('auth.saltRounds') || 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            await this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error changing password:', error);
            throw new common_1.BadRequestException('Password change failed');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        session_service_1.SessionService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map