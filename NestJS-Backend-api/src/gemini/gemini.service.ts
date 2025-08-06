import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class GeminiService {
  private geminiModel: ChatGoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_GENAI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY is not configured');
    }
    
    this.geminiModel = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      maxOutputTokens: 2048,
      temperature: 0.7,
      apiKey,
    });
  }

  private parseAIResponse(result: string, context: string): any {
    console.log(`\n=== Parsing ${context} response ===`);
    console.log('Raw response length:', result.length);
    console.log('Raw response (first 1000 chars):', result.substring(0, 1000));
    console.log('Raw response (last 500 chars):', result.substring(Math.max(0, result.length - 500)));
    
    try {
      // First, try to parse the result directly
      console.log('Attempting direct JSON parse...');
      const parsed = JSON.parse(result);
      console.log('✅ Direct parse successful');
      return parsed;
    } catch (parseError) {
      console.log('❌ Direct parse failed:', parseError.message);
      
      // If direct parsing fails, try to extract JSON from the response
      try {
        // Look for JSON content between ```json and ``` markers
        console.log('Looking for markdown JSON blocks...');
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          console.log('✅ Found markdown JSON block');
          return JSON.parse(jsonMatch[1]);
        }
        
        // Look for JSON content between [ and ] markers (arrays)
        console.log('Looking for JSON arrays...');
        const arrayMatch = result.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          console.log('✅ Found JSON array');
          return JSON.parse(arrayMatch[0]);
        }
        
        // Look for JSON content between { and } markers (objects)
        console.log('Looking for JSON objects...');
        const braceMatch = result.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          console.log('✅ Found JSON object');
          return JSON.parse(braceMatch[0]);
        }
        
        // Try to find the first valid JSON array in the response
        console.log('Looking for array brackets...');
        const arrayStart = result.indexOf('[');
        const arrayEnd = result.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
          const arrayString = result.substring(arrayStart, arrayEnd + 1);
          console.log('✅ Found array brackets, attempting parse...');
          return JSON.parse(arrayString);
        }
        
        // Try to find the first valid JSON object in the response
        console.log('Looking for object braces...');
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = result.substring(jsonStart, jsonEnd + 1);
          console.log('✅ Found object braces, attempting parse...');
          return JSON.parse(jsonString);
        }
        
        // If all else fails, try to clean up the response and parse again
        console.log('Attempting cleanup and re-parse...');
        const cleanedResult = result
          .replace(/```/g, '') // Remove markdown code blocks
          .replace(/^[^[{]*/, '') // Remove text before first [ or {
          .replace(/[^}\]]*$/, '') // Remove text after last } or ]
          .trim();
        
        console.log('Cleaned result:', cleanedResult.substring(0, 200));
        
        if ((cleanedResult.startsWith('{') && cleanedResult.endsWith('}')) || 
            (cleanedResult.startsWith('[') && cleanedResult.endsWith(']'))) {
          console.log('✅ Cleaned result looks valid, attempting parse...');
          return JSON.parse(cleanedResult);
        }
        
        console.log('❌ No valid JSON found in response');
        
        // Check if the response contains error indicators
        const errorIndicators = [
          'I apologize',
          'cannot generate',
          'try again',
          'error',
          'sorry',
          'unable to',
          'not available'
        ];
        
        const hasErrorIndicator = errorIndicators.some(indicator => 
          result.toLowerCase().includes(indicator.toLowerCase())
        );
        
        if (hasErrorIndicator) {
          console.log('⚠️ AI returned an error message, will use fallback');
          throw new Error('AI returned error message: ' + result.substring(0, 100));
        }
        
        throw new Error('No valid JSON found in response');
      } catch (extractError) {
        console.error(`❌ Failed to parse ${context} response`);
        console.error('Original response:', result);
        console.error('Parse error:', parseError);
        console.error('Extract error:', extractError);
        
        // If it's an AI error message, throw a more specific error
        if (extractError.message.includes('AI returned error message')) {
          throw new BadRequestException(`AI model is currently unavailable. Please try again later.`);
        }
        
        throw new BadRequestException(`Invalid JSON response from AI model for ${context}. Please try again.`);
      }
    }
  }

  async getWeeklyStudyPlan(courseId: string) {
    // Get course information with enhanced data
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
      throw new NotFoundException('Course not found');
    }

    // Calculate number of weeks based on course duration
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const weeksDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    // Calculate current progress if course has started
    const now = new Date();
    const currentWeek = now >= startDate ? Math.min(Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)), weeksDiff) : 0;

    const prompt = PromptTemplate.fromTemplate(`
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

    const chain = prompt.pipe(this.geminiModel).pipe(new StringOutputParser());

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
      
      // Parse and validate the JSON response
      const studyPlan = this.parseAIResponse(result, 'study plan');
      
      console.log('Parsed study plan structure:', typeof studyPlan, Array.isArray(studyPlan));
      console.log('Study plan keys:', studyPlan && typeof studyPlan === 'object' ? Object.keys(studyPlan) : 'Not an object');
      
      // Handle different possible response structures
      let weeksArray;
      if (Array.isArray(studyPlan)) {
        weeksArray = studyPlan;
      } else if (studyPlan && typeof studyPlan === 'object') {
        // Check if the response has a 'weeks' property
        if (studyPlan.weeks && Array.isArray(studyPlan.weeks)) {
          weeksArray = studyPlan.weeks;
        } else if (studyPlan.studyPlan && Array.isArray(studyPlan.studyPlan)) {
          weeksArray = studyPlan.studyPlan;
        } else if (studyPlan.plan && Array.isArray(studyPlan.plan)) {
          weeksArray = studyPlan.plan;
        } else {
          // Try to find any array property that might contain weeks
          const arrayProps = Object.keys(studyPlan).filter(key => Array.isArray(studyPlan[key]));
          if (arrayProps.length > 0) {
            weeksArray = studyPlan[arrayProps[0]];
            console.log(`Using array property: ${arrayProps[0]}`);
          } else {
            // Check if it's a single week object that we can wrap in an array
            if (studyPlan.weekNumber || studyPlan.title || studyPlan.objectives) {
              console.log('Found single week object, wrapping in array');
              weeksArray = [studyPlan];
            } else {
              throw new BadRequestException('Study plan must be an array of weeks or contain a weeks array');
            }
          }
        }
      } else {
        throw new BadRequestException('Study plan must be an array of weeks');
      }
      
      if (weeksArray.length === 0) {
        throw new BadRequestException('Study plan cannot be empty');
      }
      
      // Validate each week has required fields
      for (let i = 0; i < weeksArray.length; i++) {
        const week = weeksArray[i];
        
        // Ensure weekNumber exists, if not, use array index + 1
        if (!week.weekNumber) {
          week.weekNumber = i + 1;
          console.log(`Added weekNumber ${week.weekNumber} to week ${i + 1}`);
        }
        
        // Ensure title exists, if not, create a default one
        if (!week.title) {
          week.title = `Week ${week.weekNumber}: Course Content`;
          console.log(`Added default title to week ${week.weekNumber}`);
        }
        
        // Ensure objectives exists, if not, create an empty array
        if (!week.objectives || !Array.isArray(week.objectives)) {
          week.objectives = ['Complete assigned readings', 'Participate in discussions', 'Complete assignments'];
          console.log(`Added default objectives to week ${week.weekNumber}`);
        }
        
        // Ensure other required fields exist
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
      
      // Update the course with the generated study plan
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          studyPlan: weeksArray as any,
          updatedAt: new Date(),
        } as any,
      });

      return { 
        studyPlan: weeksArray, 
        metadata: {
          generatedAt: new Date(),
          totalWeeks: weeksDiff,
          currentWeek: currentWeek,
        }
      };
    } catch (error) {
      console.error('AI generation failed, creating fallback study plan:', error.message);
      
      // Create a fallback study plan if AI generation fails
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
      
      // Update the course with the fallback study plan
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          studyPlan: fallbackStudyPlan as any,
          updatedAt: new Date(),
        } as any,
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

  // Add other methods here as needed...
  
  async getQuiz(courseId: string, weeksToCover: number[]) {
    // Get course information with study plan
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        instructor: {
          include: { profile: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const courseWithStudyPlan = course as any;
    if (!courseWithStudyPlan.studyPlan || !Array.isArray(courseWithStudyPlan.studyPlan)) {
      throw new BadRequestException('Study plan not found');
    }

    // Filter study plan to only include requested weeks
    const relevantWeeks = courseWithStudyPlan.studyPlan.filter((week: any) => 
      weeksToCover.includes(week.weekNumber)
    );

    if (relevantWeeks.length === 0) {
      throw new BadRequestException('No study plan found for specified weeks');
    }

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educational content creator specializing in {department} courses. Create a comprehensive quiz for the following course based on the study plan:

      COURSE INFORMATION:
      - Course Name: {courseName}
      - Course Code: {courseCode}
      - Description: {courseDescription}
      - Academic Level: {courseLevel}
      - Department: {department}
      - Instructor: {instructor}

      STUDY PLAN FOR QUIZ:
      {studyPlan}

      REQUIREMENTS:
      Create a comprehensive quiz that covers the specified weeks. The quiz should include:
      1. Multiple choice questions (40% of total)
      2. True/False questions (20% of total)
      3. Short answer questions (25% of total)
      4. Essay questions (15% of total)
      
      Each question should:
      - Be clearly written and unambiguous
      - Test understanding of key concepts
      - Include appropriate difficulty levels
      - Have correct answers and explanations
      - Be relevant to the course material

      FORMATTING:
      You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.
      
      The JSON response should be:
      {{
        "quizTitle": "Quiz Title",
        "description": "Quiz description",
        "totalPoints": number,
        "timeLimit": "estimated time in minutes",
        "questions": [
          {{
            "id": "question_id",
            "type": "multiple_choice|true_false|short_answer|essay",
            "question": "Question text",
            "points": number,
            "difficulty": "easy|medium|hard",
            "options": ["option1", "option2", "option3", "option4"], // for multiple choice
            "correctAnswer": "correct answer or option index",
            "explanation": "Explanation of the correct answer",
            "tags": ["tag1", "tag2"] // topics covered
          }}
        ]
      }}

      CRITICAL: You must respond with ONLY a valid JSON object.
      - Do NOT include any markdown formatting (code blocks, etc.)
      - Do NOT include any explanatory text before or after the JSON
      - Do NOT include any code block markers
      - Do NOT include any additional comments or notes
      - The response must start with { and end with }
      - The response must be parseable by JSON.parse()
    `);

    const chain = prompt.pipe(this.geminiModel).pipe(new StringOutputParser());

    try {
      console.log(`Generating quiz for course: ${course.name} (${courseId}) for weeks: ${weeksToCover.join(', ')}`);
      const result = await chain.invoke({
        courseName: course.name,
        courseCode: course.code || 'N/A',
        courseDescription: course.description,
        courseLevel: course.level,
        department: course.department?.name || 'General',
        instructor: course.instructor?.profile?.firstName && course.instructor?.profile?.lastName 
          ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
          : 'TBA',
        studyPlan: JSON.stringify(relevantWeeks, null, 2),
      });
      
      console.log(`AI response received for quiz generation, length: ${result.length}`);
      
      // Parse and validate the JSON response
      const quiz = this.parseAIResponse(result, 'quiz');
      
      // Validate quiz structure
      if (!quiz.quizTitle || !quiz.questions || !Array.isArray(quiz.questions)) {
        throw new BadRequestException('Invalid quiz structure generated');
      }
      
      console.log(`Quiz generated successfully for course ${courseId}: ${quiz.questions.length} questions`);
      
      return quiz;
    } catch (error) {
      console.error('AI quiz generation failed:', error.message);
      throw new BadRequestException('Failed to generate quiz. Please try again later.');
    }
  }

  async getAssignment(courseId: string, weeksToCover: number[]) {
    // Get course information with study plan
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        instructor: {
          include: { profile: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const courseWithStudyPlan = course as any;
    if (!courseWithStudyPlan.studyPlan || !Array.isArray(courseWithStudyPlan.studyPlan)) {
      throw new BadRequestException('Study plan not found');
    }

    // Filter study plan to only include requested weeks
    const relevantWeeks = courseWithStudyPlan.studyPlan.filter((week: any) => 
      weeksToCover.includes(week.weekNumber)
    );

    if (relevantWeeks.length === 0) {
      throw new BadRequestException('No study plan found for specified weeks');
    }

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educational content creator specializing in {department} courses. Create a comprehensive assignment for the following course based on the study plan:

      COURSE INFORMATION:
      - Course Name: {courseName}
      - Course Code: {courseCode}
      - Description: {courseDescription}
      - Academic Level: {courseLevel}
      - Department: {department}
      - Instructor: {instructor}

      STUDY PLAN FOR ASSIGNMENT:
      {studyPlan}

      REQUIREMENTS:
      Create a comprehensive assignment that covers the specified weeks. The assignment should include:
      1. Clear objectives and learning outcomes
      2. Detailed instructions and requirements
      3. Assessment criteria and rubrics
      4. Expected deliverables
      5. Submission guidelines
      6. Time estimates and deadlines
      
      The assignment should:
      - Be appropriate for {courseLevel} level students
      - Build upon the course material
      - Encourage critical thinking and application
      - Be realistic in scope and difficulty
      - Include both individual and collaborative elements if appropriate

      FORMATTING:
      You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.
      
      The JSON response should be:
      {{
        "assignmentTitle": "Assignment Title",
        "description": "Detailed assignment description",
        "objectives": ["objective1", "objective2", ...],
        "totalPoints": number,
        "estimatedTime": "estimated time in hours",
        "dueDate": "YYYY-MM-DD",
        "instructions": [
          {{
            "step": number,
            "title": "Step Title",
            "description": "Detailed step description",
            "requirements": ["requirement1", "requirement2", ...]
          }}
        ],
        "deliverables": [
          {{
            "type": "document|presentation|code|report|other",
            "description": "Deliverable description",
            "format": "file format or submission method",
            "weight": "percentage of total grade"
          }}
        ],
        "rubric": [
          {{
            "criterion": "Criterion name",
            "excellent": "Description of excellent performance",
            "good": "Description of good performance",
            "satisfactory": "Description of satisfactory performance",
            "needsImprovement": "Description of needs improvement",
            "points": number
          }}
        ],
        "resources": [
          {{
            "title": "Resource title",
            "type": "reading|video|tool|website",
            "url": "resource URL if applicable",
            "description": "Resource description"
          }}
        ]
      }}

      CRITICAL: You must respond with ONLY a valid JSON object.
      - Do NOT include any markdown formatting (code blocks, etc.)
      - Do NOT include any explanatory text before or after the JSON
      - Do NOT include any code block markers
      - Do NOT include any additional comments or notes
      - The response must start with { and end with }
      - The response must be parseable by JSON.parse()
    `);

    const chain = prompt.pipe(this.geminiModel).pipe(new StringOutputParser());

    try {
      console.log(`Generating assignment for course: ${course.name} (${courseId}) for weeks: ${weeksToCover.join(', ')}`);
      const result = await chain.invoke({
        courseName: course.name,
        courseCode: course.code || 'N/A',
        courseDescription: course.description,
        courseLevel: course.level,
        department: course.department?.name || 'General',
        instructor: course.instructor?.profile?.firstName && course.instructor?.profile?.lastName 
          ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
          : 'TBA',
        studyPlan: JSON.stringify(relevantWeeks, null, 2),
      });
      
      console.log(`AI response received for assignment generation, length: ${result.length}`);
      
      // Parse and validate the JSON response
      const assignment = this.parseAIResponse(result, 'assignment');
      
      // Validate assignment structure
      if (!assignment.assignmentTitle || !assignment.description) {
        throw new BadRequestException('Invalid assignment structure generated');
      }
      
      console.log(`Assignment generated successfully for course ${courseId}`);
      
      return assignment;
    } catch (error) {
      console.error('AI assignment generation failed:', error.message);
      throw new BadRequestException('Failed to generate assignment. Please try again later.');
    }
  }

  async askQuizQuestion(courseId: string, question: string) {
    // Get course information
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        instructor: {
          include: { profile: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educational content creator specializing in {department} courses. Answer the following question about quiz logic and answers for this course:

      COURSE INFORMATION:
      - Course Name: {courseName}
      - Course Code: {courseCode}
      - Description: {courseDescription}
      - Academic Level: {courseLevel}
      - Department: {department}
      - Instructor: {instructor}

      STUDENT QUESTION:
      {question}

      REQUIREMENTS:
      Provide a comprehensive answer that includes:
      1. Clear explanation of the concept or logic
      2. Step-by-step reasoning if applicable
      3. Examples or analogies to illustrate the point
      4. Common misconceptions to avoid
      5. Additional resources for further study
      
      The answer should be:
      - Educational and informative
      - Appropriate for {courseLevel} level students
      - Clear and well-structured
      - Helpful for understanding the course material

      FORMATTING:
      You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.
      
      The JSON response should be:
      {{
        "answer": "Detailed answer to the question",
        "explanation": "Step-by-step explanation if applicable",
        "examples": ["example1", "example2", ...],
        "commonMisconceptions": ["misconception1", "misconception2", ...],
        "additionalResources": [
          {{
            "title": "Resource title",
            "type": "reading|video|website",
            "description": "Resource description"
          }}
        ],
        "relatedTopics": ["topic1", "topic2", ...]
      }}

      CRITICAL: You must respond with ONLY a valid JSON object.
      - Do NOT include any markdown formatting (code blocks, etc.)
      - Do NOT include any explanatory text before or after the JSON
      - Do NOT include any code block markers
      - Do NOT include any additional comments or notes
      - The response must start with { and end with }
      - The response must be parseable by JSON.parse()
    `);

    const chain = prompt.pipe(this.geminiModel).pipe(new StringOutputParser());

    try {
      console.log(`Answering quiz question for course: ${course.name} (${courseId})`);
      const result = await chain.invoke({
        courseName: course.name,
        courseCode: course.code || 'N/A',
        courseDescription: course.description,
        courseLevel: course.level,
        department: course.department?.name || 'General',
        instructor: course.instructor?.profile?.firstName && course.instructor?.profile?.lastName 
          ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
          : 'TBA',
        question: question,
      });
      
      console.log(`AI response received for quiz question, length: ${result.length}`);
      
      // Parse and validate the JSON response
      const answer = this.parseAIResponse(result, 'quiz question answer');
      
      // Validate answer structure
      if (!answer.answer) {
        throw new BadRequestException('Invalid answer structure generated');
      }
      
      console.log(`Quiz question answered successfully for course ${courseId}`);
      
      return answer;
    } catch (error) {
      console.error('AI quiz question answer failed:', error.message);
      throw new BadRequestException('Failed to answer quiz question. Please try again later.');
    }
  }

  async getPersonalReport(courseId: string, studentId: string) {
    // Get course information
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
        instructor: {
          include: { profile: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get student's quiz attempts for this course
    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        quiz: {
          courseId: courseId,
        },
        studentId: studentId,
      },
      include: {
        quiz: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (quizAttempts.length === 0) {
      throw new BadRequestException('No quiz attempts found');
    }

    const prompt = PromptTemplate.fromTemplate(`
      You are an expert educational content creator specializing in {department} courses. Generate a detailed personal report for a student based on their quiz performance:

      COURSE INFORMATION:
      - Course Name: {courseName}
      - Course Code: {courseCode}
      - Description: {courseDescription}
      - Academic Level: {courseLevel}
      - Department: {department}
      - Instructor: {instructor}

      STUDENT QUIZ PERFORMANCE:
      {quizAttempts}

      REQUIREMENTS:
      Analyze the student's quiz performance and provide:
      1. Overall performance summary
      2. Strengths and areas of improvement
      3. Knowledge gaps identification
      4. Specific recommendations for improvement
      5. Study strategies and resources
      6. Progress tracking suggestions
      
      The report should be:
      - Encouraging and constructive
      - Specific to the student's performance
      - Actionable with clear next steps
      - Educational and informative

      FORMATTING:
      You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.
      
      The JSON response should be:
      {{
        "studentId": "{studentId}",
        "courseId": "{courseId}",
        "overallScore": "percentage or grade",
        "totalAttempts": number,
        "performanceSummary": "Overall performance summary",
        "strengths": ["strength1", "strength2", ...],
        "areasForImprovement": ["area1", "area2", ...],
        "knowledgeGaps": [
          {{
            "topic": "Topic name",
            "description": "Description of the gap",
            "severity": "low|medium|high",
            "recommendations": ["rec1", "rec2", ...]
          }}
        ],
        "recommendations": [
          {{
            "category": "study|practice|resources|time_management",
            "title": "Recommendation title",
            "description": "Detailed recommendation",
            "priority": "high|medium|low",
            "estimatedTime": "time estimate"
          }}
        ],
        "studyPlan": [
          {{
            "week": number,
            "focus": "What to focus on",
            "activities": ["activity1", "activity2", ...],
            "resources": ["resource1", "resource2", ...]
          }}
        ],
        "nextSteps": ["step1", "step2", ...],
        "estimatedImprovement": "Expected improvement with recommendations"
      }}

      CRITICAL: You must respond with ONLY a valid JSON object.
      - Do NOT include any markdown formatting (code blocks, etc.)
      - Do NOT include any explanatory text before or after the JSON
      - Do NOT include any code block markers
      - Do NOT include any additional comments or notes
      - The response must start with { and end with }
      - The response must be parseable by JSON.parse()
    `);

    const chain = prompt.pipe(this.geminiModel).pipe(new StringOutputParser());

    try {
      console.log(`Generating personal report for student: ${studentId} in course: ${course.name} (${courseId})`);
      const result = await chain.invoke({
        courseName: course.name,
        courseCode: course.code || 'N/A',
        courseDescription: course.description,
        courseLevel: course.level,
        department: course.department?.name || 'General',
        instructor: course.instructor?.profile?.firstName && course.instructor?.profile?.lastName 
          ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
          : 'TBA',
        studentId: studentId,
        courseId: courseId,
        quizAttempts: JSON.stringify(quizAttempts, null, 2),
      });
      
      console.log(`AI response received for personal report, length: ${result.length}`);
      
      // Parse and validate the JSON response
      const report = this.parseAIResponse(result, 'personal report');
      
      // Validate report structure
      if (!report.performanceSummary || !report.recommendations) {
        throw new BadRequestException('Invalid report structure generated');
      }
      
      console.log(`Personal report generated successfully for student ${studentId} in course ${courseId}`);
      
      return report;
    } catch (error) {
      console.error('AI personal report generation failed:', error.message);
      throw new BadRequestException('Failed to generate personal report. Please try again later.');
    }
  }
} 