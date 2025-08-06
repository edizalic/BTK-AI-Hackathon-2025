#!/bin/bash

# Development setup script for NestJS Education Management System

set -e

echo "🚀 Setting up NestJS Education Management System for development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p docker/postgres/init

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://ediz:123_Ediz_2004@localhost:5432/AI_Hackathon"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Application Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# File Upload Configuration
MAX_FILE_SIZE_MB=10
FILE_UPLOAD_PATH="./uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_HOURS=24
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=30

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL="info"
ENABLE_FILE_LOGGING=false
LOG_DIR="./logs"
EOF
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec db pg_isready -U ediz -d AI_Hackathon; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "✅ Database is ready!"

# Install dependencies and run migrations
echo "📦 Installing dependencies..."
docker-compose exec backend npm install

echo "🗃️  Generating Prisma client..."
docker-compose exec backend npx prisma generate

echo "🗃️  Running database migrations..."
docker-compose exec backend npx prisma migrate dev --name init

echo "🌱 Seeding database (optional)..."
# docker-compose exec backend npx prisma db seed

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📍 Available services:"
echo "   🌐 Backend API: http://localhost:3001"
echo "   📊 API Documentation: http://localhost:3001/api/docs"
echo "   🗃️  Database: localhost:5432"
echo "   🔧 pgAdmin: http://localhost:8080 (admin@education.local / admin123)"
echo "   📦 Redis: localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose logs -f backend    # View backend logs"
echo "   docker-compose exec backend sh    # Access backend container"
echo "   docker-compose exec db psql -U ediz -d AI_Hackathon  # Access database"
echo "   docker-compose down               # Stop all services"
echo ""