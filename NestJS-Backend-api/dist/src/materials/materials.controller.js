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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const materials_service_1 = require("./materials.service");
const files_service_1 = require("../files/files.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_log_decorator_1 = require("../common/decorators/audit-log.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const create_material_dto_1 = require("./dto/create-material.dto");
const update_material_dto_1 = require("./dto/update-material.dto");
let MaterialsController = class MaterialsController {
    constructor(materialsService, filesService) {
        this.materialsService = materialsService;
        this.filesService = filesService;
    }
    async uploadMaterial(courseId, createMaterialDto, user, file) {
        let fileId;
        if (file) {
            const uploadedFile = await this.filesService.uploadFile(file, user.id);
            fileId = uploadedFile.id;
        }
        return this.materialsService.uploadMaterial(courseId, createMaterialDto, user.id, fileId);
    }
    async getMaterialsByCourse(courseId) {
        return this.materialsService.getMaterialsByCourse(courseId);
    }
    async getMaterialById(id) {
        return this.materialsService.getMaterialById(id);
    }
    async updateMaterial(id, updateMaterialDto, user) {
        return this.materialsService.updateMaterial(id, updateMaterialDto, user.id);
    }
    async deleteMaterial(id, user) {
        await this.materialsService.deleteMaterial(id, user.id);
        return { message: 'Material deleted successfully' };
    }
    async downloadMaterial(id, user) {
        return this.materialsService.downloadMaterial(id, user.id);
    }
    async getMaterialsByType(courseId, type) {
        return this.materialsService.getMaterialsByType(courseId, type);
    }
    async getRequiredMaterials(courseId) {
        return this.materialsService.getRequiredMaterials(courseId);
    }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, common_1.Post)('course/:courseId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload course material (teachers/supervisors)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Material uploaded successfully' }),
    (0, audit_log_decorator_1.AuditLog)('UPLOAD_MATERIAL'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_material_dto_1.CreateMaterialDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "uploadMaterial", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get course materials' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Materials retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "getMaterialsByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get material details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Material details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Material not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "getMaterialById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update material' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Material updated successfully' }),
    (0, audit_log_decorator_1.AuditLog)('UPDATE_MATERIAL'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_material_dto_1.UpdateMaterialDto, Object]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "updateMaterial", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TEACHER, client_1.UserRole.SUPERVISOR_TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete material' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Material deleted successfully' }),
    (0, audit_log_decorator_1.AuditLog)('DELETE_MATERIAL'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "deleteMaterial", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download material file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Material download initiated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "downloadMaterial", null);
__decorate([
    (0, common_1.Get)('course/:courseId/type/:type'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get materials by type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Materials retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "getMaterialsByType", null);
__decorate([
    (0, common_1.Get)('course/:courseId/required'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get required materials for course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Required materials retrieved successfully' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "getRequiredMaterials", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, swagger_1.ApiTags)('Course Materials'),
    (0, common_1.Controller)('materials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService,
        files_service_1.FilesService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map