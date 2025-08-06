"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    app: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        environment: process.env.NODE_ENV || 'development',
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
        uploadPath: process.env.FILE_UPLOAD_PATH || './uploads',
        allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ],
    },
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
    },
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_HOURS, 10) || 24,
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
        lockoutTime: parseInt(process.env.LOCKOUT_TIME_MINUTES, 10) || 30,
    },
    rateLimiting: {
        ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
        limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
        logDir: process.env.LOG_DIR || './logs',
    },
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map