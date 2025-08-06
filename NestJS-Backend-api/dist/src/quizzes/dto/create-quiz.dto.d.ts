declare class QuizQuestionDto {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
    explanation?: string;
}
export declare class CreateQuizDto {
    courseId: string;
    title: string;
    description: string;
    duration: string;
    dueDate: string;
    isTimed?: boolean;
    attemptsAllowed?: number;
    questions: QuizQuestionDto[];
}
export {};
