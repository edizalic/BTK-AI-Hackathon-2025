import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import {
  GetWeeklyStudyPlanDto,
  GetQuizDto,
  GetAssignmentDto,
  AskQuizQuestionDto,
  GetPersonalReportDto,
  WeeklyStudyPlanResponseDto,
  QuizResponseDto,
  AssignmentResponseDto,
  QuizQuestionResponseDto,
  PersonalReportResponseDto,
} from './dto/gemini.dto';

@ApiTags('Gemini AI')
@Controller('gemini')
@ApiBearerAuth()
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get(':courseId/get-weekly-study-plan')
  @ApiOperation({ 
    summary: 'Generate weekly study plan for a course',
    description: 'Gets course information and generates a comprehensive weekly study plan using AI'
  })
  @ApiParam({ 
    name: 'courseId', 
    description: 'Course ID',
    example: 'course_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Study plan generated successfully',
    type: WeeklyStudyPlanResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - failed to generate study plan' 
  })
  @HttpCode(HttpStatus.OK)
  async getWeeklyStudyPlan(@Param('courseId') courseId: string) {
    return await this.geminiService.getWeeklyStudyPlan(courseId);
  }

  @Post(':courseId/get-quiz')
  @ApiOperation({ 
    summary: 'Generate quiz for a course',
    description: 'Creates a comprehensive quiz based on course content and study plan for specified weeks'
  })
  @ApiParam({ 
    name: 'courseId', 
    description: 'Course ID',
    example: 'course_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quiz generated successfully',
    type: QuizResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - study plan not found or failed to generate quiz' 
  })
  @HttpCode(HttpStatus.OK)
  async getQuiz(
    @Param('courseId') courseId: string,
    @Body() getQuizDto: GetQuizDto
  ) {
    return await this.geminiService.getQuiz(courseId, getQuizDto.weeksToCover);
  }

  @Post(':courseId/get-assignment')
  @ApiOperation({ 
    summary: 'Generate assignment for a course',
    description: 'Creates a comprehensive assignment based on course content and study plan for specified weeks'
  })
  @ApiParam({ 
    name: 'courseId', 
    description: 'Course ID',
    example: 'course_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Assignment generated successfully',
    type: AssignmentResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - study plan not found or failed to generate assignment' 
  })
  @HttpCode(HttpStatus.OK)
  async getAssignment(
    @Param('courseId') courseId: string,
    @Body() getAssignmentDto: GetAssignmentDto
  ) {
    return await this.geminiService.getAssignment(courseId, getAssignmentDto.weeksToCover);
  }

  @Post(':courseId/ask-quiz-question')
  @ApiOperation({ 
    summary: 'Ask question about quiz logic and answers',
    description: 'Gets detailed explanation about quiz questions, logic, and correct answers'
  })
  @ApiParam({ 
    name: 'courseId', 
    description: 'Course ID',
    example: 'course_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Question answered successfully',
    type: QuizQuestionResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - failed to answer question' 
  })
  @HttpCode(HttpStatus.OK)
  async askQuizQuestion(
    @Param('courseId') courseId: string,
    @Body() askQuizQuestionDto: AskQuizQuestionDto
  ) {
    return await this.geminiService.askQuizQuestion(courseId, askQuizQuestionDto.question);
  }

  @Post(':courseId/get-personal-report')
  @ApiOperation({ 
    summary: 'Generate personal report for student',
    description: 'Analyzes student quiz performance and generates detailed report on knowledge gaps and recommendations'
  })
  @ApiParam({ 
    name: 'courseId', 
    description: 'Course ID',
    example: 'course_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personal report generated successfully',
    type: PersonalReportResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Course not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - no quiz attempts found or failed to generate report' 
  })
  @HttpCode(HttpStatus.OK)
  async getPersonalReport(
    @Param('courseId') courseId: string,
    @Body() getPersonalReportDto: GetPersonalReportDto
  ) {
    return await this.geminiService.getPersonalReport(courseId, getPersonalReportDto.studentId);
  }
} 