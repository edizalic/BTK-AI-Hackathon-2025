import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(3001),
  
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),
  
  JWT_SECRET: Joi.string().required().min(32).description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  
  MAX_FILE_SIZE_MB: Joi.number().positive().default(10),
  FILE_UPLOAD_PATH: Joi.string().default('./uploads'),
  ALLOWED_FILE_TYPES: Joi.string().optional(),
  
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),
  
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().integer().min(0).default(0),
  
  BCRYPT_ROUNDS: Joi.number().integer().min(8).max(15).default(12),
  SESSION_TIMEOUT_HOURS: Joi.number().positive().default(24),
  MAX_LOGIN_ATTEMPTS: Joi.number().integer().positive().default(5),
  LOCKOUT_TIME_MINUTES: Joi.number().positive().default(30),
  
  RATE_LIMIT_TTL: Joi.number().positive().default(60),
  RATE_LIMIT_MAX: Joi.number().positive().default(100),
  
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  ENABLE_FILE_LOGGING: Joi.boolean().default(false),
  LOG_DIR: Joi.string().default('./logs'),
});