"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const audit_log_interceptor_1 = require("./common/interceptors/audit-log.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const reflector = app.get(core_1.Reflector);
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor(), new audit_log_interceptor_1.AuditLogInterceptor(reflector));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3003',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Education Management System API')
        .setDescription('NestJS backend for education management with 4-tier user hierarchy')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication')
        .addTag('Users')
        .addTag('Courses')
        .addTag('Assignments')
        .addTag('Grades')
        .addTag('Course Materials')
        .addTag('Quizzes')
        .addTag('Notifications')
        .addTag('Files')
        .addTag('Admin')
        .addTag('Audit')
        .addTag('Pages')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('❌ Error starting application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map