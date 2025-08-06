import { QuizAttemptsService } from './quiz-attempts.service';
import { UserWithProfile } from '../users/interfaces/user-with-profile.interface';
declare class SubmitQuizAnswersDto {
    answers: Record<string, any>;
}
export declare class QuizAttemptsController {
    private readonly quizAttemptsService;
    constructor(quizAttemptsService: QuizAttemptsService);
    startAttempt(quizId: string, user: UserWithProfile): Promise<any>;
    submitAttempt(attemptId: string, submitDto: SubmitQuizAnswersDto, user: UserWithProfile): Promise<any>;
    getMyAttempts(quizId: string, user: UserWithProfile): Promise<any[]>;
    getAttempt(attemptId: string, user: UserWithProfile): Promise<any>;
}
export {};
