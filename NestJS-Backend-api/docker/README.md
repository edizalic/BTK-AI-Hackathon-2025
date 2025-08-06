# Docker Setup for NestJS Education Management System

This directory contains Docker configuration files for running the Education Management System in containerized environments.

## 🚀 Quick Start

### Development Environment

1. **Run the setup script:**
   ```bash
   chmod +x docker/scripts/dev-setup.sh
   ./docker/scripts/dev-setup.sh
   ```

2. **Or manually start services:**
   ```bash
   # Start all services in development mode
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

   # View logs
   docker-compose logs -f backend
   ```

### Production Environment

```bash
# Build and start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check status
docker-compose ps
```

## 📋 Available Services

| Service | Description | Port | URL |
|---------|-------------|------|-----|
| **backend** | NestJS API Server | 3001 | http://localhost:3001 |
| **db** | PostgreSQL Database | 5432 | localhost:5432 |
| **redis** | Redis Cache | 6379 | localhost:6379 |
| **pgadmin** | Database Admin | 8080 | http://localhost:8080 |
| **nginx** | Reverse Proxy (prod) | 80/443 | http://localhost |

## 🔧 Useful Commands

### Container Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service_name]

# Access container shell
docker-compose exec backend sh
docker-compose exec db bash
```

### Database Operations
```bash
# Access PostgreSQL CLI
docker-compose exec db psql -U ediz -d AI_Hackathon

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Reset database
docker-compose exec backend npx prisma migrate reset

# Generate Prisma client
docker-compose exec backend npx prisma generate

# View database with Prisma Studio
docker-compose exec backend npx prisma studio
```

### Development Commands
```bash
# Install dependencies
docker-compose exec backend npm install

# Run tests
docker-compose exec backend npm test

# Lint code
docker-compose exec backend npm run lint

# Format code
docker-compose exec backend npm run format
```

## 📁 Directory Structure

```
docker/
├── README.md                 # This file
├── nginx/
│   └── nginx.conf           # Nginx configuration
├── postgres/
│   └── init/
│       └── 01-init.sql      # Database initialization
└── scripts/
    └── dev-setup.sh         # Development setup script
```

## 🔒 Environment Variables

Key environment variables for the backend service:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Generated automatically |
| `JWT_SECRET` | JWT secret key | **Must be set** |
| `FRONTEND_URL` | Frontend application URL | http://localhost:3000 |
| `REDIS_HOST` | Redis server host | redis |
| `NODE_ENV` | Node environment | development |

## 🗄️ Data Persistence

The following Docker volumes are created for data persistence:

- `pg_data`: PostgreSQL database files
- `redis_data`: Redis data
- `pgadmin_data`: pgAdmin configuration
- `uploads_data`: Uploaded files

## 🔍 Monitoring & Debugging

### Health Checks
- Database: `docker-compose exec db pg_isready -U ediz -d AI_Hackathon`
- Redis: `docker-compose exec redis redis-cli ping`
- Backend: `curl http://localhost:3001/health`

### Logs
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check which ports are in use
   docker-compose ps
   netstat -tulpn | grep :5432
   ```

2. **Database connection issues:**
   ```bash
   # Restart database service
   docker-compose restart db
   
   # Check database logs
   docker-compose logs db
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER uploads/
   chmod +x docker/scripts/dev-setup.sh
   ```

4. **Clean restart:**
   ```bash
   # Stop and remove all containers, networks, volumes
   docker-compose down -v
   docker system prune -f
   
   # Restart from scratch
   ./docker/scripts/dev-setup.sh
   ```

## 🔐 Security Considerations

### Development
- Database uses trust authentication for convenience
- pgAdmin is exposed with default credentials
- All ports are exposed for debugging

### Production
- Database is not exposed externally
- SSL/TLS should be configured in Nginx
- Remove or secure pgAdmin access
- Use strong passwords and secrets
- Enable proper firewall rules

## 🎯 Performance Tuning

### PostgreSQL
```sql
-- Connect to database and run
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
```

### Redis
```bash
# Configure Redis memory limit
docker-compose exec redis redis-cli CONFIG SET maxmemory 128mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 📝 Additional Notes

- The setup automatically creates necessary directories and files
- Database migrations run automatically in development
- File uploads are persisted in Docker volumes
- Hot reload is enabled in development mode
- Production build optimizes for size and performance