"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const gemini_service_1 = require("./gemini.service");
const prisma_service_1 = require("../database/prisma.service");
describe('GeminiService', () => {
    let service;
    let prismaService;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                gemini_service_1.GeminiService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        course: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        quizAttempt: {
                            findMany: jest.fn(),
                        },
                    },
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-api-key'),
                    },
                },
            ],
        }).compile();
        service = module.get(gemini_service_1.GeminiService);
        prismaService = module.get(prisma_service_1.PrismaService);
        configService = module.get(config_1.ConfigService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getWeeklyStudyPlan', () => {
        it('should throw NotFoundException when course not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);
            await expect(service.getWeeklyStudyPlan('non-existent-id')).rejects.toThrow('Course not found');
        });
    });
    describe('getQuiz', () => {
        it('should throw NotFoundException when course not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);
            await expect(service.getQuiz('non-existent-id', [1, 2, 3])).rejects.toThrow('Course not found');
        });
        it('should throw BadRequestException when study plan not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue({
                id: 'course-1',
                name: 'Test Course',
                description: 'Test Description',
                level: 'BEGINNER',
                studyPlan: null,
            });
            await expect(service.getQuiz('course-1', [1, 2, 3])).rejects.toThrow('Study plan not found');
        });
    });
    describe('getAssignment', () => {
        it('should throw NotFoundException when course not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);
            await expect(service.getAssignment('non-existent-id', [1, 2, 3])).rejects.toThrow('Course not found');
        });
    });
    describe('askQuizQuestion', () => {
        it('should throw NotFoundException when course not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);
            await expect(service.askQuizQuestion('non-existent-id', 'Test question')).rejects.toThrow('Course not found');
        });
    });
    describe('getPersonalReport', () => {
        it('should throw NotFoundException when course not found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);
            await expect(service.getPersonalReport('non-existent-id', 'student-1')).rejects.toThrow('Course not found');
        });
        it('should throw BadRequestException when no quiz attempts found', async () => {
            jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue({
                id: 'course-1',
                name: 'Test Course',
                description: 'Test Description',
                level: 'BEGINNER',
            });
            jest.spyOn(prismaService.quizAttempt, 'findMany').mockResolvedValue([]);
            await expect(service.getPersonalReport('course-1', 'student-1')).rejects.toThrow('No quiz attempts found');
        });
    });
});
//# sourceMappingURL=gemini.service.spec.js.map