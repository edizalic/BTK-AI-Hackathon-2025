# NestJS Education Management System Backend

A comprehensive NestJS backend for education management with a 4-tier user hierarchy (Admin, Supervisor Teacher, Teacher, Student). This system provides complete functionality for course management, user registration, assignments, grading, and file handling.

## 🏗️ Architecture

### User Hierarchy
- **Admin**: Can register supervisor teachers, system-wide management
- **Supervisor Teacher**: Can create courses, register users, assign teachers/advisors
- **Teacher**: Can teach assigned courses, grade assignments  
- **Student**: Can view courses, submit assignments, view grades

### Key Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, profiles, advisory assignments
- **Course Management**: Course creation, enrollment, teacher assignments
- **Assignment System**: Create, submit, and grade assignments
- **Grading System**: Comprehensive grading with GPA calculations
- **File Management**: Upload and manage course materials and submissions
- **Notification System**: Real-time notifications via WebSocket
- **Audit Logging**: Complete activity tracking and audit trails
- **Dynamic Pages**: Configurable page system for frontend

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-education-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - Database connection string
   - JWT secret (minimum 32 characters)
   - SMTP settings for email notifications
   - File upload settings

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User & UserProfile**: User accounts and detailed profiles
- **Course & Enrollment**: Course management and student enrollments
- **Assignment & AssignmentSubmission**: Assignment system
- **Grade**: Comprehensive grading system
- **CourseMaterial**: File attachments and course resources
- **Quiz & QuizAttempt**: Quiz system
- **Notification**: Real-time notification system
- **AuditLog**: Activity tracking and audit trails

## 🛡️ API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3001/api/docs`
- **API Base URL**: `http://localhost:3001`

## 🔧 Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:reset         # Reset database
npm run db:studio        # Open Prisma Studio

# Build & Production
npm run build            # Build the application
npm run start:prod       # Start in production mode

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage

# Code Quality
npm run lint             # Lint and fix code
npm run format           # Format code with Prettier
```

## 🔑 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/education_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 🏗️ Module Structure

```
src/
├── app.module.ts          # Root module
├── main.ts               # Application bootstrap
├── common/               # Shared utilities, guards, interceptors
├── config/               # Configuration management
├── database/             # Prisma service and database utilities
├── auth/                 # Authentication & authorization
├── users/                # User management
├── courses/              # Course management
├── assignments/          # Assignment system
├── grades/               # Grading system
├── materials/            # Course materials management
├── quizzes/              # Quiz system
├── notifications/        # Notification system
├── files/                # File upload and management
├── admin/                # Administrative operations
├── audit/                # Activity logging and audit trails
└── pages/                # Dynamic page configuration
```

## 🔐 Authentication Flow

1. **Login**: POST `/auth/login` with email/password
2. **Access Token**: Use JWT token in Authorization header
3. **Refresh Token**: POST `/auth/refresh` to get new access token
4. **Logout**: POST `/auth/logout` to invalidate session

## 👥 User Registration Flow

1. **Admin** registers **Supervisor Teachers**
2. **Supervisor Teachers** register **Teachers** and **Students**
3. **Supervisor Teachers** assign:
   - Teachers to courses
   - Advisory teachers to students
   - Students to courses

## 📝 Assignment & Grading Flow

1. **Teachers/Supervisors** create assignments
2. **Students** submit assignments (text + file attachments)
3. **Teachers/Supervisors** grade submissions
4. **Grades** automatically calculate GPA
5. **Notifications** sent for due dates and grade updates

## 🔄 Development Workflow

1. **Database Changes**: 
   - Edit `prisma/schema.prisma`
   - Run `npm run db:migrate`
   
2. **Adding Features**:
   - Create DTOs in `dto/` folders
   - Implement services with business logic
   - Create controllers with API endpoints
   - Add proper guards and decorators

3. **Testing**:
   - Write unit tests for services
   - Write e2e tests for controllers
   - Test with different user roles

## 🔧 Production Deployment

1. **Environment Setup**:
   - Set `NODE_ENV=production`
   - Use production database
   - Configure proper JWT secrets
   
2. **Database Migration**:
   ```bash
   npm run db:migrate:deploy
   ```

3. **Build & Start**:
   ```bash
   npm run build
   npm run start:prod
   ```

## 📚 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Authentication](https://jwt.io/)
- [Class Validator](https://github.com/typestack/class-validator)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Note**: This is a comprehensive education management system. Make sure to properly configure security settings, database connections, and environment variables before deploying to production.