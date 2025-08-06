"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuizAttemptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAttemptsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let QuizAttemptsService = QuizAttemptsService_1 = class QuizAttemptsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(QuizAttemptsService_1.name);
    }
    async startQuizAttempt(quizId, studentId) {
        try {
            const quiz = await this.prisma.quiz.findUnique({
                where: { id: quizId },
                include: { course: true },
            });
            if (!quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId,
                    courseId: quiz.courseId,
                    status: client_1.EnrollmentStatus.ACTIVE,
                },
            });
            if (!enrollment) {
                throw new common_1.BadRequestException('You are not enrolled in this course');
            }
            if (quiz.dueDate && new Date() > quiz.dueDate) {
                throw new common_1.BadRequestException('Quiz deadline has passed');
            }
            const existingUnsubmittedAttempt = await this.prisma.quizAttempt.findFirst({
                where: {
                    quizId,
                    studentId,
                    submittedAt: null,
                },
                orderBy: { startedAt: 'desc' },
            });
            if (existingUnsubmittedAttempt) {
                const attempt = await this.prisma.quizAttempt.findUnique({
                    where: { id: existingUnsubmittedAttempt.id },
                    include: {
                        quiz: {
                            include: { course: true },
                        },
                        student: {
                            include: { profile: true },
                        },
                    },
                });
                const sanitizedQuiz = await this.getQuizWithQuestionsForStudent(quizId, studentId);
                const result = {
                    ...attempt,
                    quiz: sanitizedQuiz
                };
                this.logger.debug(`Returning result with quiz questions count: ${result.quiz?.questions?.length || 0}`);
                this.logger.debug(`Sanitized quiz questions: ${JSON.stringify(result.quiz?.questions)}`);
                return result;
            }
            const totalAttempts = await this.prisma.quizAttempt.count({
                where: {
                    quizId,
                    studentId,
                },
            });
            if (totalAttempts >= quiz.attemptsAllowed) {
                throw new common_1.BadRequestException('Maximum attempts exceeded');
            }
            const attempt = await this.prisma.quizAttempt.create({
                data: {
                    quizId,
                    studentId,
                    startedAt: new Date(),
                    score: 0,
                    answers: {},
                },
                include: {
                    quiz: {
                        include: { course: true },
                    },
                    student: {
                        include: { profile: true },
                    },
                },
            });
            const sanitizedQuiz = await this.getQuizWithQuestionsForStudent(quizId, studentId);
            const result = {
                ...attempt,
                quiz: sanitizedQuiz
            };
            this.logger.debug(`Returning result with quiz questions count: ${result.quiz?.questions?.length || 0}`);
            this.logger.debug(`Sanitized quiz questions: ${JSON.stringify(result.quiz?.questions)}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error starting quiz attempt:', error);
            throw error;
        }
    }
    async submitQuizAttempt(attemptId, answers, studentId) {
        try {
            const attempt = await this.prisma.quizAttempt.findUnique({
                where: { id: attemptId },
                include: {
                    quiz: true,
                    student: true,
                },
            });
            if (!attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            if (attempt.studentId !== studentId) {
                throw new common_1.BadRequestException('You can only submit your own quiz attempts');
            }
            if (attempt.submittedAt) {
                throw new common_1.BadRequestException('Quiz attempt already submitted');
            }
            if (attempt.quiz.isTimed && attempt.startedAt) {
                const durationInMs = this.parseDuration(attempt.quiz.duration);
                const timeElapsed = Date.now() - attempt.startedAt.getTime();
                if (timeElapsed > durationInMs) {
                    throw new common_1.BadRequestException('Time limit exceeded');
                }
            }
            const score = this.calculateScore(answers, attempt.quiz);
            const updatedAttempt = await this.prisma.quizAttempt.update({
                where: { id: attemptId },
                data: {
                    answers,
                    score,
                    submittedAt: new Date(),
                },
                include: {
                    quiz: {
                        include: { course: true },
                    },
                    student: {
                        include: { profile: true },
                    },
                },
            });
            await this.createGradeFromQuizAttempt(updatedAttempt);
            return updatedAttempt;
        }
        catch (error) {
            this.logger.error('Error submitting quiz attempt:', error);
            throw error;
        }
    }
    async getStudentAttempts(quizId, studentId) {
        return this.prisma.quizAttempt.findMany({
            where: {
                quizId,
                studentId,
            },
            include: {
                quiz: {
                    include: { course: true },
                },
            },
            orderBy: { startedAt: 'desc' },
        });
    }
    async getAttemptById(attemptId, userId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: {
                    include: {
                        course: true,
                        createdBy: true,
                    },
                },
                student: {
                    include: { profile: true },
                },
            },
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Quiz attempt not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const canAccess = attempt.studentId === userId ||
            user.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            attempt.quiz.createdById === userId ||
            attempt.quiz.course.instructorId === userId;
        if (!canAccess) {
            throw new common_1.BadRequestException('Access denied');
        }
        return attempt;
    }
    parseDuration(duration) {
        const match = duration.match(/(\d+)\s*(minute|hour|day)s?/i);
        if (!match) {
            return 60 * 60 * 1000;
        }
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'minute':
                return value * 60 * 1000;
            case 'hour':
                return value * 60 * 60 * 1000;
            case 'day':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 60 * 60 * 1000;
        }
    }
    calculateScore(answers, quiz) {
        const totalQuestions = quiz.totalQuestions;
        const answeredQuestions = Object.keys(answers).length;
        return Math.round((answeredQuestions / totalQuestions) * quiz.maxPoints);
    }
    async getQuizWithQuestionsForStudent(quizId, studentId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { course: true },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId: quiz.courseId,
                status: 'ACTIVE',
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('You are not enrolled in this course');
        }
        const questionsData = quiz.questionsData;
        this.logger.debug(`Quiz questionsData: ${JSON.stringify(questionsData)}`);
        const sanitizedQuestions = questionsData?.questions ? questionsData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            points: q.points
        })) : [];
        this.logger.debug(`Sanitized questions count: ${sanitizedQuestions.length}`);
        this.logger.debug(`Sanitized questions: ${JSON.stringify(sanitizedQuestions)}`);
        const result = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            totalQuestions: quiz.totalQuestions,
            maxPoints: quiz.maxPoints,
            dueDate: quiz.dueDate,
            isTimed: quiz.isTimed,
            attemptsAllowed: quiz.attemptsAllowed,
            questions: sanitizedQuestions,
            course: quiz.course
        };
        this.logger.debug(`Returning sanitized quiz with questions count: ${result.questions.length}`);
        return result;
    }
    async createGradeFromQuizAttempt(attempt) {
        try {
            const existingGrade = await this.prisma.grade.findFirst({
                where: {
                    studentId: attempt.studentId,
                    courseId: attempt.quiz.courseId,
                    feedback: {
                        contains: `Quiz: ${attempt.quiz.title}`
                    }
                },
            });
            if (existingGrade) {
                this.logger.debug('Grade already exists for this quiz attempt');
                return;
            }
            const percentage = (attempt.score / attempt.quiz.maxPoints) * 100;
            const letterGrade = this.calculateLetterGrade(percentage);
            await this.prisma.grade.create({
                data: {
                    studentId: attempt.studentId,
                    courseId: attempt.quiz.courseId,
                    letterGrade,
                    score: attempt.score,
                    maxPoints: attempt.quiz.maxPoints,
                    percentage,
                    gradedById: attempt.quiz.createdById,
                    feedback: `Quiz: ${attempt.quiz.title}`,
                    isExtraCredit: false,
                    weight: 1.0,
                },
            });
            this.logger.log(`Created grade entry for quiz attempt ${attempt.id}`);
        }
        catch (error) {
            this.logger.error('Error creating grade from quiz attempt:', error);
        }
    }
    calculateLetterGrade(percentage) {
        if (percentage >= 93)
            return 'A';
        if (percentage >= 90)
            return 'A-';
        if (percentage >= 87)
            return 'B+';
        if (percentage >= 83)
            return 'B';
        if (percentage >= 80)
            return 'B-';
        if (percentage >= 77)
            return 'C+';
        if (percentage >= 73)
            return 'C';
        if (percentage >= 70)
            return 'C-';
        if (percentage >= 67)
            return 'D+';
        if (percentage >= 63)
            return 'D';
        if (percentage >= 60)
            return 'D-';
        return 'F';
    }
};
exports.QuizAttemptsService = QuizAttemptsService;
exports.QuizAttemptsService = QuizAttemptsService = QuizAttemptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizAttemptsService);
//# sourceMappingURL=quiz-attempts.service.js.map