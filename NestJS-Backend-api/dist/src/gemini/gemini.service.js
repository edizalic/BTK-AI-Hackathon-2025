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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
let GeminiService = class GeminiService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('GOOGLE_GENAI_API_KEY');
        if (!apiKey) {
            throw new Error('GOOGLE_GENAI_API_KEY is not configured');
        }
        this.geminiModel = new google_genai_1.ChatGoogleGenerativeAI({
            model: 'gemini-1.5-flash',
            maxOutputTokens: 2048,
            temperature: 0.7,
            apiKey,
        });
    }
    parseAIResponse(result, context) {
        console.log(`\n=== Parsing ${context} response ===`);
        console.log('Raw response length:', result.length);
        console.log('Raw response (first 1000 chars):', result.substring(0, 1000));
        console.log('Raw response (last 500 chars):', result.substring(Math.max(0, result.length - 500)));
        try {
            console.log('Attempting direct JSON parse...');
            const parsed = JSON.parse(result);
            console.log('✅ Direct parse successful');
            return parsed;
        }
        catch (parseError) {
            console.log('❌ Direct parse failed:', parseError.message);
            try {
                console.log('Looking for markdown JSON blocks...');
                const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    console.log('✅ Found markdown JSON block');
                    return JSON.parse(jsonMatch[1]);
                }
                console.log('Looking for JSON arrays...');
                const arrayMatch = result.match(/\[[\s\S]*\]/);
                if (arrayMatch) {
                    console.log('✅ Found JSON array');
                    return JSON.parse(arrayMatch[0]);
                }
                console.log('Looking for JSON objects...');
                const braceMatch = result.match(/\{[\s\S]*\}/);
                if (braceMatch) {
                    console.log('✅ Found JSON object');
                    return JSON.parse(braceMatch[0]);
                }
                console.log('Looking for array brackets...');
                const arrayStart = result.indexOf('[');
                const arrayEnd = result.lastIndexOf(']');
                if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
                    const arrayString = result.substring(arrayStart, arrayEnd + 1);
                    console.log('✅ Found array brackets, attempting parse...');
                    return JSON.parse(arrayString);
                }
                console.log('Looking for object braces...');
                const jsonStart = result.indexOf('{');
                const jsonEnd = result.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    const jsonString = result.substring(jsonStart, jsonEnd + 1);
                    console.log('✅ Found object braces, attempting parse...');
                    return JSON.parse(jsonString);
                }
                console.log('Attempting cleanup and re-parse...');
                const cleanedResult = result
                    .replace(/```/g, '')
                    .replace(/^[^[{]*/, '')
                    .replace(/[^}\]]*$/, '')
                    .trim();
                console.log('Cleaned result:', cleanedResult.substring(0, 200));
                if ((cleanedResult.startsWith('{') && cleanedResult.endsWith('}')) ||
                    (cleanedResult.startsWith('[') && cleanedResult.endsWith(']'))) {
                    console.log('✅ Cleaned result looks valid, attempting parse...');
                    return JSON.parse(cleanedResult);
                }
                console.log('❌ No valid JSON found in response');
                const errorIndicators = [
                    'I apologize',
                    'cannot generate',
                    'try again',
                    'error',
                    'sorry',
                    'unable to',
                    'not available'
                ];
                const hasErrorIndicator = errorIndicators.some(indicator => result.toLowerCase().includes(indicator.toLowerCase()));
                if (hasErrorIndicator) {
                    console.log('⚠️ AI returned an error message, will use fallback');
                    throw new Error('AI returned error message: ' + result.substring(0, 100));
                }
                throw new Error('No valid JSON found in response');
            }
            catch (extractError) {
                console.error(`❌ Failed to parse ${context} response`);
                console.error('Original response:', result);
                console.error('Parse error:', parseError);
                console.error('Extract error:', extractError);
                if (extractError.message.includes('AI returned error message')) {
                    throw new common_1.BadRequestException(`AI model is currently unavailable. Please try again later.`);
                }
                throw new common_1.BadRequestException(`Invalid JSON response from AI model for ${context}. Please try again.`);
            }
        }
    }
    async getWeeklyStudyPlan(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                department: true,
                prerequisites: true,
                instructor: {
                    include: { profile: true },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        const weeksDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const now = new Date();
        const currentWeek = now >= startDate ? Math.min(Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)), weeksDiff) : 0;
        const prompt = prompts_1.PromptTemplate.fromTemplate(`
      You are an expert educational content creator specializing in {department} courses. Create a comprehensive weekly study plan for the following course:

      COURSE INFORMATION:
      - Course Name: {courseName}
      - Course Code: {courseCode}
      - Description: {courseDescription}
      - Academic Level: {courseLevel}
      - Department: {department}
      - Credits: {credits}
      - Duration: {weeks} weeks (from {startDate} to {endDate})
      - Prerequisites: {prerequisites}
      - Current Week: {currentWeek}
      - Instructor: {instructor}

      REQUIREMENTS:
      Create a detailed weekly study plan that progressively builds knowledge and skills. Each week should include:
      1. Clear, measurable learning objectives (3-5 per week)
      2. Specific topics and subtopics to be covered
      3. Required readings and supplementary materials
      4. Practical assignments and hands-on activities
      5. Assessment methods and criteria
      6. Expected learning outcomes and competencies

      FORMATTING:
      You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.
      
      The JSON response should be a direct array of {weeks} weeks (not wrapped in an object). Each week object must include:
      {{
        "weekNumber": number,
        "title": "Week X: [Topic Title]",
        "objectives": ["objective1", "objective2", ...],
        "topics": [
          {{
            "title": "Topic Title",
            "subtopics": ["subtopic1", "subtopic2", ...],
            "difficulty": "beginner|intermediate|advanced"
          }}
        ],
        "readings": [
          {{
            "title": "Reading Title",
            "type": "textbook|article|paper|online",
            "pages": "page numbers or chapters",
            "priority": "required|recommended"
          }}
        ],
        "activities": [
          {{
            "title": "Activity Title",
            "type": "assignment|lab|project|discussion",
            "description": "Detailed description",
            "timeEstimate": "estimated hours",
            "points": number
          }}
        ],
        "assessments": [
          {{
            "type": "quiz|exam|project|participation",
            "description": "Assessment description",
            "weight": "percentage of final grade",
            "criteria": ["criterion1", "criterion2", ...]
          }}
        ],
        "outcomes": ["outcome1", "outcome2", ...]
      }}
      
      CRITICAL: You must respond with ONLY a valid JSON array. 
      - Do NOT include any markdown formatting (code blocks, etc.)
      - Do NOT include any explanatory text before or after the JSON
      - Do NOT include any code block markers
      - Do NOT include any additional comments or notes
      - The response must start with [ and end with ]
      - The response must be parseable by JSON.parse()
      - Example format: [{{"weekNumber": 1, "title": "Week 1: Introduction", ...}}, {{"weekNumber": 2, "title": "Week 2: Basics", ...}}]

      Ensure the plan is:
      - Progressive (builds upon previous weeks)
      - Balanced in workload distribution
      - Appropriate for {courseLevel} level students
      - Aligned with {department} standards
      - Realistic for {credits} credit hours
    `);
        const chain = prompt.pipe(this.geminiModel).pipe(new output_parsers_1.StringOutputParser());
        try {
            console.log(`Generating study plan for course: ${course.name} (${courseId})`);
            const result = await chain.invoke({
                courseName: course.name,
                courseCode: course.code || 'N/A',
                courseDescription: course.description,
                courseLevel: course.level,
                department: course.department?.name || 'General',
                weeks: weeksDiff,
                credits: course.credits,
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString(),
                currentWeek: currentWeek,
                prerequisites: course.prerequisites?.map(p => p.name).join(', ') || 'None',
                instructor: course.instructor?.profile?.firstName && course.instructor?.profile?.lastName
                    ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
                    : 'TBA',
            });
            console.log(`AI response received for course ${courseId}, length: ${result.length}`);
            console.log('Raw AI response (first 500 chars):', result.substring(0, 500));
            const studyPlan = this.parseAIResponse(result, 'study plan');
            console.log('Parsed study plan structure:', typeof studyPlan, Array.isArray(studyPlan));
            console.log('Study plan keys:', studyPlan && typeof studyPlan === 'object' ? Object.keys(studyPlan) : 'Not an object');
            let weeksArray;
            if (Array.isArray(studyPlan)) {
                weeksArray = studyPlan;
            }
            else if (studyPlan && typeof studyPlan === 'object') {
                if (studyPlan.weeks && Array.isArray(studyPlan.weeks)) {
                    weeksArray = studyPlan.weeks;
                }
                else if (studyPlan.studyPlan && Array.isArray(studyPlan.studyPlan)) {
                    weeksArray = studyPlan.studyPlan;
                }
                else if (studyPlan.plan && Array.isArray(studyPlan.plan)) {
                    weeksArray = studyPlan.plan;
                }
                else {
                    const arrayProps = Object.keys(studyPlan).filter(key => Array.isArray(studyPlan[key]));
                    if (arrayProps.length > 0) {
                        weeksArray = studyPlan[arrayProps[0]];
                        console.log(`Using array property: ${arrayProps[0]}`);
                    }
                    else {
                        if (studyPlan.weekNumber || studyPlan.title || studyPlan.objectives) {
                            console.log('Found single week object, wrapping in array');
                            weeksArray = [studyPlan];
                        }
                        else {
                            throw new common_1.BadRequestException('Study plan must be an array of weeks or contain a weeks array');
                        }
                    }
                }
            }
            else {
                throw new common_1.BadRequestException('Study plan must be an array of weeks');
            }
            if (weeksArray.length === 0) {
                throw new common_1.BadRequestException('Study plan cannot be empty');
            }
            for (let i = 0; i < weeksArray.length; i++) {
                const week = weeksArray[i];
                if (!week.weekNumber) {
                    week.weekNumber = i + 1;
                    console.log(`Added weekNumber ${week.weekNumber} to week ${i + 1}`);
                }
                if (!week.title) {
                    week.title = `Week ${week.weekNumber}: Course Content`;
                    console.log(`Added default title to week ${week.weekNumber}`);
                }
                if (!week.objectives || !Array.isArray(week.objectives)) {
                    week.objectives = ['Complete assigned readings', 'Participate in discussions', 'Complete assignments'];
                    console.log(`Added default objectives to week ${week.weekNumber}`);
                }
                if (!week.topics || !Array.isArray(week.topics)) {
                    week.topics = [];
                }
                if (!week.readings || !Array.isArray(week.readings)) {
                    week.readings = [];
                }
                if (!week.activities || !Array.isArray(week.activities)) {
                    week.activities = [];
                }
                if (!week.assessments || !Array.isArray(week.assessments)) {
                    week.assessments = [];
                }
                if (!week.outcomes || !Array.isArray(week.outcomes)) {
                    week.outcomes = [];
                }
            }
            console.log(`Study plan generated successfully for course ${courseId}: ${weeksArray.length} weeks`);
            await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    studyPlan: weeksArray,
                    updatedAt: new Date(),
                },
            });
            return {
                studyPlan: weeksArray,
                metadata: {
                    generatedAt: new Date(),
                    totalWeeks: weeksDiff,
                    currentWeek: currentWeek,
                }
            };
        }
        catch (error) {
            console.error('AI generation failed, creating fallback study plan:', error.message);
            const fallbackStudyPlan = [];
            for (let i = 1; i <= weeksDiff; i++) {
                fallbackStudyPlan.push({
                    weekNumber: i,
                    title: `Week ${i}: Course Content`,
                    objectives: [
                        'Complete assigned readings',
                        'Participate in discussions',
                        'Complete assignments'
                    ],
                    topics: [],
                    readings: [],
                    activities: [],
                    assessments: [],
                    outcomes: []
                });
            }
            console.log(`Created fallback study plan with ${fallbackStudyPlan.length} weeks`);
            await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    studyPlan: fallbackStudyPlan,
                    updatedAt: new Date(),
                },
            });
            return {
                studyPlan: fallbackStudyPlan,
                metadata: {
                    generatedAt: new Date(),
                    totalWeeks: weeksDiff,
                    currentWeek: currentWeek,
                    note: 'Fallback study plan generated due to AI processing issues'
                }
            };
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map