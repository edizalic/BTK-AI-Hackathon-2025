# Local Development Setup (PostgreSQL in Docker Only)

This setup runs **only PostgreSQL in Docker** while you develop your NestJS app locally.

## 🚀 Quick Start

### 1. Start PostgreSQL Database
```bash
# Start only PostgreSQL
docker-compose -f docker-compose.local.yml up -d

# Check if it's running
docker-compose -f docker-compose.local.yml ps
```

### 2. Create Local Environment File
Create `.env.local` in your project root:

```env
# Database Configuration (PostgreSQL in Docker)
DATABASE_URL="postgresql://ediz:123_Ediz_2004@localhost:5432/AI_Hackathon"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Application Configuration
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# File Upload Configuration
MAX_FILE_SIZE_MB="10"
FILE_UPLOAD_PATH="./uploads"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"

# Security Configuration
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT_HOURS="24"

# Rate Limiting
RATE_LIMIT_TTL="60"
RATE_LIMIT_MAX="100"

# Logging
LOG_LEVEL="debug"
```

### 3. Install Dependencies & Setup Database
```bash
# Install Node.js dependencies
npm install

# 🚀 One-command setup (starts DB + generates Prisma + migrates)
npm run local:setup

# (Optional) Seed database
npm run db:seed
```

### 4. Start Your NestJS App Locally
```bash
# 🚀 Super easy: Start everything at once
npm run local:dev

# Or manual steps:
npm run start:dev
```

### 5. Access Your Services
- **NestJS API**: http://localhost:3001
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555
- **PostgreSQL**: `localhost:5432`

## 🛠️ Useful Commands

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Direct database connection
psql postgresql://ediz:123_Ediz_2004@localhost:5432/AI_Hackathon
```

### Docker Management
```bash
# 🚀 Easy npm scripts (recommended)
npm run local:db:up      # Start PostgreSQL
npm run local:db:down    # Stop PostgreSQL  
npm run local:db:logs    # View PostgreSQL logs
npm run local:setup      # Full setup (DB + Prisma)
npm run local:dev        # Setup + start NestJS

# Or manual Docker commands
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml down -v  # ⚠️ deletes data
docker-compose -f docker-compose.local.yml restart db
```

## 🎯 Why This Setup?

✅ **Faster Development**: No Docker overhead for your app
✅ **Easy Debugging**: Direct access to your Node.js process
✅ **Hot Reload**: Instant code changes with `npm run start:dev`
✅ **IDE Integration**: Full TypeScript support and debugging
✅ **Consistent Database**: Same PostgreSQL version across team
✅ **Easy Database Management**: Prisma Studio works seamlessly

## 🔄 Switching Between Setups

### Local Development (this setup)
```bash
docker-compose -f docker-compose.local.yml up -d
npm run start:dev
```

### Full Docker (if needed)
```bash
docker-compose up -d
```