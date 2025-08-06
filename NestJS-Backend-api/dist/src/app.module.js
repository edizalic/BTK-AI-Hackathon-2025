"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const database_module_1 = require("./database/database.module");
const configuration_module_1 = require("./config/configuration.module");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const courses_module_1 = require("./courses/courses.module");
const assignments_module_1 = require("./assignments/assignments.module");
const grades_module_1 = require("./grades/grades.module");
const materials_module_1 = require("./materials/materials.module");
const quizzes_module_1 = require("./quizzes/quizzes.module");
const notifications_module_1 = require("./notifications/notifications.module");
const files_module_1 = require("./files/files.module");
const admin_module_1 = require("./admin/admin.module");
const audit_module_1 = require("./audit/audit.module");
const pages_module_1 = require("./pages/pages.module");
const gemini_module_1 = require("./gemini/gemini.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            configuration_module_1.ConfigurationModule,
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            assignments_module_1.AssignmentsModule,
            grades_module_1.GradesModule,
            materials_module_1.MaterialsModule,
            quizzes_module_1.QuizzesModule,
            notifications_module_1.NotificationsModule,
            files_module_1.FilesModule,
            admin_module_1.AdminModule,
            audit_module_1.AuditModule,
            pages_module_1.PagesModule,
            gemini_module_1.GeminiModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map