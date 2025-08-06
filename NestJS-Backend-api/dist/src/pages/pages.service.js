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
var PagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PagesService = PagesService_1 = class PagesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PagesService_1.name);
    }
    async getPageConfig(pageId, userRole) {
        return this.prisma.pageConfiguration.findFirst({
            where: {
                id: pageId,
                OR: [
                    { userType: userRole },
                    { userType: null },
                ],
            },
        });
    }
    async getAvailablePages(userRole, permissions = []) {
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
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = PagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PagesService);
//# sourceMappingURL=pages.service.js.map