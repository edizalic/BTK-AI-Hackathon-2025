'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveDrawer } from '@/components/ui/drawer'
import { AppDrawerContent } from '@/components/AppDrawer'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/AuthGuard'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Timer } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  points: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  duration: string
  dueDate: string
  isTimed: boolean
  attemptsAllowed: number
  questions: QuizQuestion[]
  totalQuestions: number
  maxPoints: number
}

interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  startedAt: string
  submittedAt?: string
  score?: number
  maxPoints?: number
  answers: Record<string, any>
  data?: {
    score: number
    maxPoints: number
    results: Array<{
      questionId: string
      studentAnswer: number
      correctAnswer: number
      isCorrect: boolean
      pointsEarned: number
    }>
  }
}

export default function SolveQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { courseId, quizId } = params
  const { user } = useAuth()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (quiz?.isTimed && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quiz?.isTimed, timeRemaining])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)

      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/quiz-attempts/start/${quizId}`
      const requestHeaders = {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }

      // Start quiz attempt - this returns the quiz with questions
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response Error Body:', errorText)
        throw new Error(`Failed to start quiz: ${response.status} - ${errorText}`)
      }

      const quizData = await response.json()
      console.log('📥 Quiz Attempt Response:', quizData)

      // Handle nested data structure - the actual data is under data.data
      const attemptData = quizData.data?.data || quizData.data || quizData
      
      // Extract quiz info from the attempt response
      const quizInfo = {
        id: attemptData.quizId || quizId,
        title: attemptData.quiz?.title || 'Quiz',
        description: attemptData.quiz?.description || '',
        duration: attemptData.quiz?.duration || '60 minutes',
        dueDate: attemptData.quiz?.dueDate || '',
        isTimed: attemptData.quiz?.isTimed || false,
        attemptsAllowed: attemptData.quiz?.attemptsAllowed || 1,
        totalQuestions: attemptData.quiz?.questions?.length || attemptData.questions?.length || 0,
        maxPoints: attemptData.quiz?.maxPoints || 100,
        questions: attemptData.quiz?.questions || attemptData.questions || []
      }
      
      // Ensure questions array exists and has proper structure
      if (!quizInfo.questions || !Array.isArray(quizInfo.questions)) {
        console.warn('⚠️ No questions found in quiz data, using empty array')
        quizInfo.questions = []
      }

      // Ensure each question has options array
      quizInfo.questions = quizInfo.questions.map((question: any) => ({
        ...question,
        options: question.options || []
      }))

      setQuiz(quizInfo)
      setAttempt(attemptData)

      // Initialize timer if quiz is timed
      if (quizInfo.isTimed) {
        const durationMinutes = parseInt(quizInfo.duration) || 60
        setTimeRemaining(durationMinutes * 60) // Convert to seconds
      }
    } catch (err) {
      console.error('❌ Error loading quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = async () => {
    if (!quiz || !attempt) return

    try {
      setSubmitting(true)
      setError(null)

             // Use the original answers with question IDs
       const requestBody = {
         answers: answers
       }

       console.log('📤 Quiz Submission Request Body:', requestBody)
       console.log('📤 Quiz Submission URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/quizzes/${quizId}/submit`)

       const requestUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/quizzes/${quizId}/submit`
      const requestHeaders = {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Quiz submission error:', errorData)
        throw new Error(`Failed to submit quiz: ${response.status} ${response.statusText} - ${errorData}`)
      }

      const result = await response.json()
      console.log('📥 Quiz Submission Response:', result)
      
      setQuizCompleted(true)
      setAttempt(result.data || result)
    } catch (err) {
      console.error('❌ Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!quiz) return 0
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Quiz</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href={`/courses/${courseId}`}>
                  <Button>Back to Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  if (!quiz) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quiz Not Found</h3>
                <p className="text-muted-foreground mb-4">The quiz you're looking for doesn't exist or you don't have access to it.</p>
                <Link href={`/courses/${courseId}`}>
                  <Button>Back to Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  // Safety check for questions array
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
                <p className="text-muted-foreground mb-4">This quiz doesn't have any questions yet.</p>
                <Link href={`/courses/${courseId}`}>
                  <Button>Back to Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  if (quizCompleted && attempt) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </Link>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                <p className="text-muted-foreground">Your quiz has been submitted successfully.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                                 <div className="grid grid-cols-2 gap-4 text-center">
                   <div>
                     <p className="text-sm text-muted-foreground">Score</p>
                     <p className="text-2xl font-bold text-green-600">
                       {attempt.data?.score || attempt.score || 0} / {attempt.data?.maxPoints || attempt.maxPoints || quiz.maxPoints}
                     </p>
                   </div>
                   <div>
                     <p className="text-sm text-muted-foreground">Percentage</p>
                     <p className="text-2xl font-bold">
                       {attempt.data?.score && attempt.data?.maxPoints 
                         ? Math.round((attempt.data.score / attempt.data.maxPoints) * 100)
                         : attempt.score && attempt.maxPoints 
                         ? Math.round((attempt.score / attempt.maxPoints) * 100)
                         : 0}%
                     </p>
                   </div>
                 </div>
                
                <div className="text-center">
                  <Link href={`/courses/${courseId}`}>
                    <Button>Return to Course</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  // Safety check for current question
  if (!currentQuestion) {
    return (
      <AuthGuard requiredRoles={['STUDENT']}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Question Not Found</h3>
                <p className="text-muted-foreground mb-4">The requested question could not be found.</p>
                <Link href={`/courses/${courseId}`}>
                  <Button>Back to Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  const drawerContent = (
    <AppDrawerContent 
      userType="student"
    />
  )

  return (
    <AuthGuard requiredRoles={['STUDENT']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
                  <p className="text-muted-foreground">{quiz.description}</p>
                </div>
              </div>
              
              {/* Timer */}
              {quiz.isTimed && timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-red-500" />
                  <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-foreground'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getAnsweredCount()} of {quiz.questions.length} answered
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Question Navigation */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {quiz.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="w-10 h-10 p-0"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Question */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentQuestion.points} points
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {currentQuestion.options.length} options
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-lg mb-4">{currentQuestion.question}</p>
                  
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {!isLastQuestion && (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  >
                    Next
                  </Button>
                )}
                
                {isLastQuestion && (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length === 0}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </Button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="mt-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
} 