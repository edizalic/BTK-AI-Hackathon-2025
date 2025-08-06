"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const system_service_1 = require("./system.service");
const system_controller_1 = require("./system.controller");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const audit_module_1 = require("../audit/audit.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, courses_module_1.CoursesModule, audit_module_1.AuditModule],
        providers: [admin_service_1.AdminService, system_service_1.SystemService],
        controllers: [admin_controller_1.AdminController, system_controller_1.SystemController],
        exports: [admin_service_1.AdminService, system_service_1.SystemService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map