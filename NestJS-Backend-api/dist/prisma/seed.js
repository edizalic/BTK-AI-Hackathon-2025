"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const DEFAULT_PASSWORD = 'Password123!';
const BCRYPT_ROUNDS = 12;
async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('🗑️  Cleaning existing seed data...');
    await prisma.userActivity.deleteMany({});
    await prisma.userProfile.deleteMany({});
    await prisma.user.deleteMany({});
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    console.log('👑 Creating Admin account...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.ADMIN,
            isActive: true,
            profile: {
                create: {
                    firstName: 'System',
                    lastName: 'Administrator',
                    department: 'Administration',
                    position: 'System Administrator',
                    employeeId: 'ADMIN001',
                    hireDate: new Date('2024-01-01'),
                },
            },
        },
        include: {
            profile: true,
        },
    });
    console.log('🏫 Creating Supervisor Teacher accounts...');
    const supervisor1 = await prisma.user.create({
        data: {
            email: 'supervisor.math@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.SUPERVISOR_TEACHER,
            isSupervisor: true,
            isActive: true,
            profile: {
                create: {
                    firstName: 'Mary',
                    lastName: 'Johnson',
                    department: 'Mathematics',
                    position: 'Department Head',
                    employeeId: 'SUP001',
                    hireDate: new Date('2024-01-15'),
                    specialization: ['Algebra', 'Calculus', 'Statistics'],
                    officeLocation: 'Building A, Room 101',
                    officeHours: 'Mon-Wed-Fri 2:00-4:00 PM',
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const supervisor2 = await prisma.user.create({
        data: {
            email: 'supervisor.cs@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.SUPERVISOR_TEACHER,
            isSupervisor: true,
            isActive: true,
            profile: {
                create: {
                    firstName: 'Robert',
                    lastName: 'Williams',
                    department: 'Computer Science',
                    position: 'Department Head',
                    employeeId: 'SUP002',
                    hireDate: new Date('2024-01-20'),
                    specialization: ['Programming', 'Data Structures', 'Software Engineering'],
                    officeLocation: 'Building B, Room 201',
                    officeHours: 'Tue-Thu 1:00-3:00 PM',
                },
            },
        },
        include: {
            profile: true,
        },
    });
    console.log('👨‍🏫 Creating Teacher accounts...');
    const teacher1 = await prisma.user.create({
        data: {
            email: 'john.smith@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.TEACHER,
            isActive: true,
            teacherRegisteredById: supervisor1.id,
            profile: {
                create: {
                    firstName: 'John',
                    lastName: 'Smith',
                    department: 'Mathematics',
                    position: 'Math Teacher',
                    employeeId: 'TEACH001',
                    hireDate: new Date('2024-02-01'),
                    specialization: ['Geometry', 'Trigonometry'],
                    officeLocation: 'Building A, Room 105',
                    officeHours: 'Mon-Wed 3:00-5:00 PM',
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const teacher2 = await prisma.user.create({
        data: {
            email: 'ediz.alic@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.TEACHER,
            isActive: true,
            teacherRegisteredById: supervisor2.id,
            profile: {
                create: {
                    firstName: 'Ediz',
                    lastName: 'Aliç',
                    department: 'Computer Science',
                    position: 'CS Teacher',
                    employeeId: 'TEACH002',
                    hireDate: new Date('2024-02-15'),
                    specialization: ['Web Development', 'Database Systems'],
                    officeLocation: 'Building B, Room 205',
                    officeHours: 'Tue-Thu 2:00-4:00 PM',
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const teacher3 = await prisma.user.create({
        data: {
            email: 'ediz.bektas@education.system',
            passwordHash: hashedPassword,
            role: client_1.UserRole.TEACHER,
            isActive: true,
            teacherRegisteredById: supervisor1.id,
            profile: {
                create: {
                    firstName: 'Ediz',
                    lastName: 'Bektaş',
                    department: 'Mathematics',
                    position: 'Statistics Teacher',
                    employeeId: 'TEACH003',
                    hireDate: new Date('2024-03-01'),
                    specialization: ['Statistics', 'Data Analysis'],
                    officeLocation: 'Building A, Room 110',
                    officeHours: 'Mon-Fri 1:00-2:00 PM',
                },
            },
        },
        include: {
            profile: true,
        },
    });
    console.log('👨‍🎓 Creating Student accounts...');
    const student1 = await prisma.user.create({
        data: {
            email: 'ediz.bektas@student.edu',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            isActive: true,
            studentRegisteredById: supervisor1.id,
            profile: {
                create: {
                    firstName: 'Ediz',
                    lastName: 'Bektaş',
                    studentId: 'STU20240001',
                    grade: '11th Grade',
                    major: 'Mathematics',
                    minor: 'Computer Science',
                    enrollmentDate: new Date('2024-01-15'),
                    advisoryTeacherId: teacher1.id,
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const student2 = await prisma.user.create({
        data: {
            email: 'ediz.alic@student.edu',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            isActive: true,
            studentRegisteredById: supervisor2.id,
            profile: {
                create: {
                    firstName: 'Ediz',
                    lastName: 'Aliç',
                    studentId: 'STU20240002',
                    grade: '12th Grade',
                    major: 'Computer Science',
                    minor: 'Mathematics',
                    enrollmentDate: new Date('2024-01-20'),
                    advisoryTeacherId: teacher2.id,
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const student3 = await prisma.user.create({
        data: {
            email: 'emma.garcia@student.edu',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            isActive: true,
            studentRegisteredById: supervisor1.id,
            profile: {
                create: {
                    firstName: 'Emma',
                    lastName: 'Garcia',
                    studentId: 'STU20240003',
                    grade: '10th Grade',
                    major: 'Mathematics',
                    enrollmentDate: new Date('2024-02-01'),
                    advisoryTeacherId: teacher3.id,
                },
            },
        },
        include: {
            profile: true,
        },
    });
    const student4 = await prisma.user.create({
        data: {
            email: 'david.lee@student.edu',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            isActive: true,
            studentRegisteredById: supervisor2.id,
            profile: {
                create: {
                    firstName: 'David',
                    lastName: 'Lee',
                    studentId: 'STU20240004',
                    grade: '11th Grade',
                    major: 'Computer Science',
                    enrollmentDate: new Date('2024-02-15'),
                    advisoryTeacherId: teacher2.id,
                },
            },
        },
        include: {
            profile: true,
        },
    });
    console.log('🏢 Creating departments...');
    await prisma.department.createMany({
        data: [
            {
                name: 'Mathematics',
                code: 'MATH',
                description: 'Department of Mathematics',
                departmentHeadId: supervisor1.id,
            },
            {
                name: 'Computer Science',
                code: 'CS',
                description: 'Department of Computer Science',
                departmentHeadId: supervisor2.id,
            },
        ],
    });
    console.log('🔐 Creating permissions...');
    await prisma.permission.createMany({
        data: [
            { name: 'create_course', description: 'Create new courses', category: 'course' },
            { name: 'manage_users', description: 'Manage user accounts', category: 'user' },
            { name: 'grade_assignments', description: 'Grade student assignments', category: 'grading' },
            { name: 'view_analytics', description: 'View system analytics', category: 'reporting' },
            { name: 'manage_system', description: 'System administration', category: 'system' },
        ],
    });
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Default Accounts Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Default Password for all accounts: Password123!');
    console.log('   (Please change these passwords in production!)');
    console.log('\n👑 ADMIN:');
    console.log('   📧 admin@education.system');
    console.log('\n🏫 SUPERVISOR TEACHERS:');
    console.log('   📧 supervisor.math@education.system (Math Department Head)');
    console.log('   📧 supervisor.cs@education.system (CS Department Head)');
    console.log('\n👨‍🏫 TEACHERS:');
    console.log('   📧 john.smith@education.system (Math Teacher)');
    console.log('   📧 ediz.alic@education.system (CS Teacher)');
    console.log('   📧 ediz.bektas@education.system (Statistics Teacher)');
    console.log('\n👨‍🎓 STUDENTS:');
    console.log('   📧 ediz.bektas@student.edu (11th Grade Math)');
    console.log('   📧 ediz.alic@student.edu (12th Grade CS)');
    console.log('   📧 emma.garcia@student.edu (10th Grade Math)');
    console.log('   📧 david.lee@student.edu (11th Grade CS)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map