import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../database/prisma.service';

describe('GeminiService', () => {
  let service: GeminiService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: PrismaService,
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
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
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
      } as any);

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
      } as any);

      jest.spyOn(prismaService.quizAttempt, 'findMany').mockResolvedValue([]);

      await expect(service.getPersonalReport('course-1', 'student-1')).rejects.toThrow('No quiz attempts found');
    });
  });
}); 