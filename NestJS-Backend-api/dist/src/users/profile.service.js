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
var ProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ProfileService = ProfileService_1 = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProfileService_1.name);
    }
    async getProfile(userId) {
        return this.prisma.userProfile.findUnique({
            where: { userId },
        });
    }
    async updateProfile(userId, updateData) {
        const profile = await this.getProfile(userId);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return this.prisma.userProfile.update({
            where: { userId },
            data: updateData,
        });
    }
    async createProfile(userId, profileData) {
        return this.prisma.userProfile.create({
            data: {
                userId,
                ...profileData,
            },
        });
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = ProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map