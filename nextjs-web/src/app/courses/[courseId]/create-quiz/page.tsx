'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ResponsiveDrawer } from '@/components/ui/drawer'
import { AppDrawerContent } from '@/components/AppDrawer'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/AuthGuard'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  points: number
  explanation: string
}

interface QuizForm {
  title: string
  description: string
  duration: string
  dueDate: string
  isTimed: boolean
  attemptsAllowed: number
  questions: Question[]
}

export default function CreateQuizPage() {
  const params = useParams()
  const { courseId } = params
  const { user } = useAuth()
  
  const [quizForm, setQuizForm] = useState<QuizForm>({
    title: '',
    description: '',
    duration: '30 minutes',
    dueDate: '',
    isTimed: true,
    attemptsAllowed: 1,
    questions: []
  })
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)



  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      explanation: ''
    }
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const removeQuestion = (questionId: string) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      })
    }))
  }

  const calculateTotalPoints = () => {
    return quizForm.questions.reduce((total, question) => total + question.points, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (quizForm.questions.length === 0) {
      setError('Please add at least one question')
      return
    }

    if (!quizForm.title.trim()) {
      setError('Please enter a quiz title')
      return
    }

    if (!quizForm.dueDate) {
      setError('Please set a due date')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const formattedDueDate = quizForm.dueDate ? new Date(quizForm.dueDate + ':00').toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const requestBody = {
        courseId: courseId,
        title: quizForm.title,
        description: quizForm.description,
        duration: quizForm.duration,
        dueDate: formattedDueDate,
        isTimed: quizForm.isTimed,
        attemptsAllowed: quizForm.attemptsAllowed,
        questions: quizForm.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          explanation: q.explanation
        }))
      }
      console.log('Due date from form:', quizForm.dueDate)
      console.log('Due date converted:', formattedDueDate)
      console.log('Sending quiz data:', requestBody)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/quizzes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Quiz creation error response:', errorData)
        throw new Error(`Failed to create quiz: ${response.status} ${response.statusText} - ${errorData}`)
      }

      // Redirect back to course details
      window.location.href = `/courses/${courseId}`
    } catch (err) {
      console.error('Error creating quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to create quiz')
    } finally {
      setSaving(false)
    }
  }

  const drawerContent = (
    <AppDrawerContent 
      userType="teacher"
    />
  )

  return (
    <AuthGuard requiredRoles={['TEACHER', 'SUPERVISOR_TEACHER']}>
      <ResponsiveDrawer drawerContent={drawerContent}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
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
                <h1 className="text-3xl font-bold text-foreground">Create Quiz</h1>
                <p className="text-muted-foreground">Create a new quiz for your course</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Details */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter quiz title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 60 minutes"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={quizForm.dueDate}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="attemptsAllowed">Attempts Allowed</Label>
                    <Input
                      id="attemptsAllowed"
                      type="number"
                      value={quizForm.attemptsAllowed}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, attemptsAllowed: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTimed"
                    checked={quizForm.isTimed}
                    onCheckedChange={(checked) => setQuizForm(prev => ({ ...prev, isTimed: checked as boolean }))}
                  />
                  <Label htmlFor="isTimed">Timed Quiz</Label>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter quiz description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Questions ({quizForm.questions.length})</CardTitle>
                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent>
                {quizForm.questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions added yet.</p>
                    <p className="text-sm">Click "Add Question" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizForm.questions.map((question, questionIndex) => (
                      <Card key={question.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Question {questionIndex + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Question Text *</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                              placeholder="Enter your question"
                              rows={2}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label>Options</Label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                                    className="mt-1"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                                                     <div>
                             <Label htmlFor={`points-${question.id}`}>Points</Label>
                             <Input
                               id={`points-${question.id}`}
                               type="number"
                               value={question.points}
                               onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 10)}
                               min="1"
                               max="100"
                             />
                           </div>
                           <div>
                             <Label htmlFor={`explanation-${question.id}`}>Explanation (Optional)</Label>
                             <Textarea
                               id={`explanation-${question.id}`}
                               value={question.explanation}
                               onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                               placeholder="Explain why this answer is correct..."
                               rows={2}
                             />
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Questions:</span>
                    <p className="font-semibold">{quizForm.questions.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Points:</span>
                    <p className="font-semibold">{calculateTotalPoints()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-semibold">{quizForm.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-semibold">{quizForm.dueDate ? new Date(quizForm.dueDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                  <div>
                    <span className="text-muted-foreground">Timed:</span>
                    <p className="font-semibold">{quizForm.isTimed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attempts:</span>
                    <p className="font-semibold">{quizForm.attemptsAllowed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-semibold text-green-600">Ready to Create</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Link href={`/courses/${courseId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving || quizForm.questions.length === 0}>
                {saving ? 'Creating Quiz...' : 'Create Quiz'}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
} 