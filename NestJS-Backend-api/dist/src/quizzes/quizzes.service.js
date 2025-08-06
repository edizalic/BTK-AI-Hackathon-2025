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
var QuizzesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
let QuizzesService = QuizzesService_1 = class QuizzesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(QuizzesService_1.name);
    }
    async createQuiz(dto, creatorId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: dto.courseId },
                include: { instructor: true, createdBy: true },
            });
            if (!course) {
                throw new common_1.NotFoundException('Course not found');
            }
            const creator = await this.prisma.user.findUnique({
                where: { id: creatorId },
            });
            if (!creator) {
                throw new common_1.NotFoundException('Creator not found');
            }
            const canCreate = creator.role === client_1.UserRole.SUPERVISOR_TEACHER ||
                course.instructorId === creatorId ||
                course.createdById === creatorId;
            if (!canCreate) {
                throw new common_1.BadRequestException('You cannot create quizzes for this course');
            }
            const totalQuestions = dto.questions.length;
            const maxPoints = dto.questions.reduce((sum, q) => sum + q.points, 0);
            return await this.prisma.quiz.create({
                data: {
                    courseId: dto.courseId,
                    createdById: creatorId,
                    title: dto.title,
                    description: dto.description,
                    duration: dto.duration,
                    totalQuestions,
                    maxPoints,
                    dueDate: dto.dueDate,
                    isTimed: dto.isTimed || false,
                    attemptsAllowed: dto.attemptsAllowed || 1,
                    questionsData: {
                        questions: dto.questions
                    },
                },
                include: {
                    course: {
                        include: { department: true },
                    },
                    createdBy: {
                        include: { profile: true },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error('Error creating quiz:', error);
            throw error;
        }
    }
    async getQuizzesByCourse(courseId) {
        return this.prisma.quiz.findMany({
            where: { courseId },
            include: {
                createdBy: {
                    include: { profile: true },
                },
                attempts: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
                _count: {
                    select: {
                        attempts: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getQuizById(id) {
        return this.prisma.quiz.findUnique({
            where: { id },
            include: {
                course: {
                    include: {
                        department: true,
                        instructor: {
                            include: { profile: true },
                        },
                    },
                },
                createdBy: {
                    include: { profile: true },
                },
                attempts: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
            },
        });
    }
    async updateQuiz(id, dto, userId) {
        const quiz = await this.getQuizById(id);
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canUpdate = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            quiz.createdById === userId;
        if (!canUpdate) {
            throw new common_1.BadRequestException('You cannot update this quiz');
        }
        const updateData = {
            title: dto.title,
            description: dto.description,
            duration: dto.duration,
            dueDate: dto.dueDate,
            isTimed: dto.isTimed,
            attemptsAllowed: dto.attemptsAllowed,
        };
        if (dto.questions && dto.questions.length > 0) {
            updateData.totalQuestions = dto.questions.length;
            updateData.maxPoints = dto.questions.reduce((sum, q) => sum + q.points, 0);
            updateData.questionsData = {
                questions: dto.questions
            };
        }
        return this.prisma.quiz.update({
            where: { id },
            data: updateData,
            include: {
                course: {
                    include: { department: true },
                },
                createdBy: {
                    include: { profile: true },
                },
            },
        });
    }
    async deleteQuiz(id, userId) {
        const quiz = await this.getQuizById(id);
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const canDelete = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
            quiz.createdById === userId;
        if (!canDelete) {
            throw new common_1.BadRequestException('You cannot delete this quiz');
        }
        await this.prisma.quiz.delete({
            where: { id },
        });
    }
    async getQuizzesByStudent(studentId) {
        return this.prisma.quiz.findMany({
            where: {
                course: {
                    enrollments: {
                        some: {
                            studentId,
                            status: 'ACTIVE',
                        },
                    },
                },
            },
            include: {
                course: {
                    include: {
                        instructor: {
                            include: { profile: true },
                        },
                    },
                },
                attempts: {
                    where: { studentId },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async canStudentTakeQuiz(quizId, studentId) {
        try {
            const quiz = await this.getQuizById(quizId);
            if (!quiz) {
                return { canTake: false, reason: 'Quiz not found' };
            }
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    courseId: quiz.courseId,
                    studentId,
                    status: 'ACTIVE',
                },
            });
            if (!enrollment) {
                return { canTake: false, reason: 'Not enrolled in this course' };
            }
            if (quiz.dueDate < new Date()) {
                return { canTake: false, reason: 'Quiz deadline has passed' };
            }
            const attemptCount = await this.prisma.quizAttempt.count({
                where: {
                    quizId,
                    studentId,
                },
            });
            const attemptsLeft = quiz.attemptsAllowed - attemptCount;
            if (attemptsLeft <= 0) {
                return {
                    canTake: false,
                    reason: 'Maximum attempts reached',
                    attemptsLeft: 0,
                };
            }
            return {
                canTake: true,
                attemptsLeft,
            };
        }
        catch (error) {
            this.logger.error('Error checking quiz eligibility:', error);
            return { canTake: false, reason: 'Error checking eligibility' };
        }
    }
    async getQuizStatistics(quizId) {
        try {
            const attempts = await this.prisma.quizAttempt.findMany({
                where: {
                    quizId,
                    submittedAt: { not: null },
                },
            });
            if (attempts.length === 0) {
                return {
                    totalAttempts: 0,
                    averageScore: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    completionRate: 0,
                    scoreDistribution: [],
                };
            }
            const scores = attempts
                .filter(attempt => attempt.score !== null)
                .map(attempt => attempt.score);
            const totalAttempts = attempts.length;
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);
            const totalStarted = await this.prisma.quizAttempt.count({
                where: { quizId },
            });
            const completionRate = totalStarted > 0 ? (totalAttempts / totalStarted) * 100 : 0;
            const scoreRanges = [
                { range: '0-20%', min: 0, max: 20 },
                { range: '21-40%', min: 21, max: 40 },
                { range: '41-60%', min: 41, max: 60 },
                { range: '61-80%', min: 61, max: 80 },
                { range: '81-100%', min: 81, max: 100 },
            ];
            const scoreDistribution = scoreRanges.map(range => ({
                range: range.range,
                count: scores.filter(score => {
                    const percentage = (score / (attempts.find(a => a.score === score)?.maxPoints || 100)) * 100;
                    return percentage >= range.min && percentage <= range.max;
                }).length,
            }));
            return {
                totalAttempts,
                averageScore: Math.round(averageScore * 100) / 100,
                highestScore,
                lowestScore,
                completionRate: Math.round(completionRate * 100) / 100,
                scoreDistribution,
            };
        }
        catch (error) {
            this.logger.error(`Error calculating quiz statistics for ${quizId}:`, error);
            throw error;
        }
    }
    async getQuizAttempts(quizId, studentId) {
        try {
            const where = { quizId };
            if (studentId) {
                where.studentId = studentId;
            }
            return this.prisma.quizAttempt.findMany({
                where,
                include: {
                    student: {
                        include: { profile: true },
                    },
                    quiz: {
                        select: {
                            title: true,
                            maxPoints: true,
                        },
                    },
                },
                orderBy: {
                    startedAt: 'desc',
                },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching quiz attempts for ${quizId}:`, error);
            throw error;
        }
    }
    async getQuizForStudent(id, studentId) {
        try {
            const quiz = await this.prisma.quiz.findUnique({
                where: { id },
                include: {
                    course: {
                        include: {
                            enrollments: {
                                where: { studentId, status: 'ACTIVE' }
                            }
                        }
                    }
                }
            });
            if (!quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            this.logger.debug(`Course enrollments: ${JSON.stringify(quiz.course.enrollments)}`);
            this.logger.debug(`Student ID: ${studentId}`);
            this.logger.debug(`Enrollment count: ${quiz.course.enrollments.length}`);
            if (quiz.course.enrollments.length === 0) {
                this.logger.debug('No enrollments found for student');
                throw new common_1.BadRequestException('You are not enrolled in this course');
            }
            this.logger.debug(`Quiz questionsData: ${JSON.stringify(quiz.questionsData)}`);
            this.logger.debug(`Quiz questionsData type: ${typeof quiz.questionsData}`);
            const questionsData = quiz.questionsData;
            this.logger.debug(`Parsed questionsData: ${JSON.stringify(questionsData)}`);
            const sanitizedQuestions = questionsData?.questions ? questionsData.questions.map((q) => ({
                id: q.id,
                question: q.question,
                options: q.options,
                points: q.points
            })) : [];
            this.logger.debug(`Sanitized questions count: ${sanitizedQuestions.length}`);
            this.logger.debug(`Sanitized questions: ${JSON.stringify(sanitizedQuestions)}`);
            return {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                duration: quiz.duration,
                totalQuestions: quiz.totalQuestions,
                maxPoints: quiz.maxPoints,
                dueDate: quiz.dueDate,
                isTimed: quiz.isTimed,
                attemptsAllowed: quiz.attemptsAllowed,
                questions: sanitizedQuestions
            };
        }
        catch (error) {
            this.logger.error('Error getting quiz for student:', error);
            throw error;
        }
    }
    async getQuizForTeacher(id, userId) {
        try {
            const quiz = await this.prisma.quiz.findUnique({
                where: { id },
                include: {
                    course: true,
                    createdBy: { include: { profile: true } }
                }
            });
            if (!quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            const canView = user?.role === client_1.UserRole.SUPERVISOR_TEACHER ||
                quiz.createdById === userId ||
                quiz.course.instructorId === userId;
            if (!canView) {
                throw new common_1.BadRequestException('Access denied');
            }
            return quiz;
        }
        catch (error) {
            this.logger.error('Error getting quiz for teacher:', error);
            throw error;
        }
    }
    async gradeQuizAttempt(attemptId, studentAnswers) {
        try {
            const attempt = await this.prisma.quizAttempt.findUnique({
                where: { id: attemptId },
                include: { quiz: true }
            });
            if (!attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            const questionsData = attempt.quiz.questionsData;
            const questions = questionsData.questions;
            let totalScore = 0;
            const results = [];
            for (const question of questions) {
                const studentAnswer = studentAnswers[question.id];
                const isCorrect = studentAnswer === question.correctAnswer;
                const pointsEarned = isCorrect ? question.points : 0;
                totalScore += pointsEarned;
                results.push({
                    questionId: question.id,
                    studentAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    pointsEarned,
                    maxPoints: question.points,
                    explanation: question.explanation
                });
            }
            const updatedAttempt = await this.prisma.quizAttempt.update({
                where: { id: attemptId },
                data: {
                    score: totalScore,
                    maxPoints: attempt.quiz.maxPoints,
                    submittedAt: new Date(),
                    answers: {
                        studentAnswers,
                        results
                    }
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
            return {
                score: totalScore,
                maxPoints: attempt.quiz.maxPoints,
                results
            };
        }
        catch (error) {
            this.logger.error('Error grading quiz attempt:', error);
            throw error;
        }
    }
    async getStudentWrongAnswers(studentId) {
        try {
            const attempts = await this.prisma.quizAttempt.findMany({
                where: {
                    studentId,
                    submittedAt: { not: null },
                },
                include: {
                    quiz: {
                        include: {
                            course: true,
                        },
                    },
                },
                orderBy: { submittedAt: 'desc' },
            });
            const filteredResults = [];
            for (const attempt of attempts) {
                const answers = attempt.answers;
                const questionsData = attempt.quiz.questionsData;
                if (!answers?.results || !questionsData?.questions) {
                    continue;
                }
                const wrongAnswers = answers.results
                    .filter((result) => !result.isCorrect)
                    .map((result) => {
                    const question = questionsData.questions.find((q) => q.id === result.questionId);
                    return {
                        questionId: result.questionId,
                        question: question?.question || 'Question not found',
                        studentAnswer: result.studentAnswer,
                        correctAnswer: result.correctAnswer,
                        explanation: result.explanation,
                    };
                });
                if (wrongAnswers.length > 0) {
                    filteredResults.push({
                        quizTitle: attempt.quiz.title,
                        quizDescription: attempt.quiz.description,
                        courseName: attempt.quiz.course.name,
                        submittedAt: attempt.submittedAt,
                        score: attempt.score,
                        maxPoints: attempt.maxPoints,
                        wrongAnsweredQuestions: wrongAnswers,
                    });
                }
            }
            return filteredResults;
        }
        catch (error) {
            this.logger.error('Error getting student wrong answers:', error);
            throw error;
        }
    }
    async getStudentAllQuizAttempts(studentId) {
        return this.prisma.quizAttempt.findMany({
            where: {
                studentId,
                submittedAt: { not: null },
            },
            include: {
                quiz: {
                    include: {
                        course: true,
                        createdBy: {
                            include: { profile: true },
                        },
                    },
                },
                student: {
                    include: { profile: true },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async createGradeFromQuizAttempt(attempt) {
        try {
            this.logger.log(`Attempting to create grade for quiz attempt ${attempt.id}`);
            this.logger.log(`Student ID: ${attempt.studentId}`);
            this.logger.log(`Course ID: ${attempt.quiz.courseId}`);
            this.logger.log(`Quiz Title: ${attempt.quiz.title}`);
            this.logger.log(`Score: ${attempt.score}`);
            this.logger.log(`Max Points: ${attempt.quiz.maxPoints}`);
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
            this.logger.log(`Calculated percentage: ${percentage}%`);
            this.logger.log(`Calculated letter grade: ${letterGrade}`);
            const gradeData = {
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
            };
            this.logger.log(`Creating grade with data: ${JSON.stringify(gradeData)}`);
            const createdGrade = await this.prisma.grade.create({
                data: gradeData,
            });
            this.logger.log(`Successfully created grade entry ${createdGrade.id} for quiz attempt ${attempt.id}`);
        }
        catch (error) {
            this.logger.error('Error creating grade from quiz attempt:', error);
            this.logger.error('Error details:', error.message);
            this.logger.error('Error stack:', error.stack);
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
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = QuizzesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map