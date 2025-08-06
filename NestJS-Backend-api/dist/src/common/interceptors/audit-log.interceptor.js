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
var AuditLogInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const audit_log_decorator_1 = require("../decorators/audit-log.decorator");
let AuditLogInterceptor = AuditLogInterceptor_1 = class AuditLogInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(AuditLogInterceptor_1.name);
    }
    intercept(context, next) {
        const action = this.reflector.get(audit_log_decorator_1.AUDIT_LOG_KEY, context.getHandler());
        if (!action) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const { user, ip, headers } = request;
        const userAgent = headers['user-agent'];
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.logger.log(`Action: ${action} | User: ${user?.id || 'anonymous'} | IP: ${ip}`);
        }), (0, operators_1.catchError)((error) => {
            this.logger.error(`Failed Action: ${action} | User: ${user?.id || 'anonymous'} | IP: ${ip} | Error: ${error.message}`);
            throw error;
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = AuditLogInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map