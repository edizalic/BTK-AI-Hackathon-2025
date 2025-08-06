export declare const configuration: () => {
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    app: {
        frontendUrl: string;
        environment: string;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
        allowedFileTypes: string[];
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    security: {
        bcryptRounds: number;
        sessionTimeout: number;
        maxLoginAttempts: number;
        lockoutTime: number;
    };
    rateLimiting: {
        ttl: number;
        limit: number;
    };
    logging: {
        level: string;
        enableFileLogging: boolean;
        logDir: string;
    };
};
