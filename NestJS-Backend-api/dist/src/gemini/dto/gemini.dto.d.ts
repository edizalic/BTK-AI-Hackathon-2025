export declare class GetWeeklyStudyPlanDto {
    courseId: string;
}
export declare class GetQuizDto {
    courseId: string;
    weeksToCover: number[];
}
export declare class GetAssignmentDto {
    courseId: string;
    weeksToCover: number[];
}
export declare class AskQuizQuestionDto {
    courseId: string;
    question: string;
}
export declare class GetPersonalReportDto {
    courseId: string;
    studentId: string;
}
export declare class WeeklyStudyPlanResponseDto {
    studyPlan: any;
}
export declare class QuizResponseDto {
    quiz: any;
}
export declare class AssignmentResponseDto {
    assignment: any;
}
export declare class QuizQuestionResponseDto {
    answer: string;
}
export declare class PersonalReportResponseDto {
    report: any;
}
