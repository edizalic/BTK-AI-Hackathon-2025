export declare class StudyPlanWeekDto {
    week: string;
    description: string;
    topics?: string[];
    assignments?: string[];
    readings?: string[];
}
export declare class CreateStudyPlanDto {
    weeks: StudyPlanWeekDto[];
}
export declare class UpdateStudyPlanDto {
    weeks: StudyPlanWeekDto[];
}
