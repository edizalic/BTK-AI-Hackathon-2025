"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeeklyStudyPlanProps {
  courseId: string
  courseName: string
  existingStudyPlan?: any
}

interface StudyPlanWeek {
  week: string
  description: string
  topics?: string[]
  assignments?: string[]
  readings?: string[]
}

interface StudyPlan {
  weeks: StudyPlanWeek[]
  generatedAt?: string
  aiGenerated?: boolean
}

export const WeeklyStudyPlan: React.FC<WeeklyStudyPlanProps> = ({
  courseId,
  courseName,
  existingStudyPlan
}) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(existingStudyPlan || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [showPlan, setShowPlan] = useState(false)

  const toggleWeek = (week: string) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(week)) {
      newExpanded.delete(week)
    } else {
      newExpanded.add(week)
    }
    setExpandedWeeks(newExpanded)
  }

  const generateWeeklyStudyPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/gemini/${courseId}/get-weekly-study-plan`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to generate study plan: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.studyPlan) {
        setStudyPlan({
          weeks: data.studyPlan.weeks || [],
          generatedAt: new Date().toISOString(),
          aiGenerated: true
        })
        setShowPlan(true)
      } else {
        throw new Error(data.message || 'Failed to generate study plan')
      }
    } catch (err) {
      console.error('Error generating study plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate study plan')
    } finally {
      setLoading(false)
    }
  }

  const getWeekColor = (weekNumber: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-cyan-500',
      'bg-lime-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-rose-500'
    ]
    const index = (parseInt(weekNumber) - 1) % colors.length
    return colors[index]
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <div className="flex items-center space-x-3 flex-1">
          <button
            className="flex items-center space-x-2 text-left hover:text-foreground transition-colors"
            onClick={() => setShowPlan(!showPlan)}
          >
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>AI Weekly Study Plan</span>
            </CardTitle>
            {showPlan ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {studyPlan && studyPlan.weeks && studyPlan.weeks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {studyPlan.weeks.length} weeks
            </Badge>
          )}
          {studyPlan?.aiGenerated && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              AI Generated
            </Badge>
          )}
        </div>
        <Button 
          variant="default" 
          size="sm"
          onClick={generateWeeklyStudyPlan}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Ask to AI</span>
            </>
          )}
        </Button>
      </CardHeader>
      
      {showPlan && (
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                <p className="text-muted-foreground text-sm">
                  AI is generating your personalized weekly study plan for {courseName}...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 text-sm mb-2">Failed to generate study plan</p>
                <p className="text-muted-foreground text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateWeeklyStudyPlan}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            ) : studyPlan && studyPlan.weeks && studyPlan.weeks.length > 0 ? (
              <div className="space-y-3">
                {studyPlan.weeks.map((week) => (
                  <div key={week.week} className="border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                      onClick={() => toggleWeek(week.week)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                          getWeekColor(week.week)
                        )}>
                          {week.week}
                        </div>
                        <span className="font-medium">Week {week.week}</span>
                        {week.topics && week.topics.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {week.topics.length} topics
                          </Badge>
                        )}
                      </div>
                      {expandedWeeks.has(week.week) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedWeeks.has(week.week) && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="prose prose-sm max-w-none">
                          <div className="mb-3">
                            <h4 className="font-semibold text-foreground mb-2">Description</h4>
                            <p className="text-muted-foreground">{week.description}</p>
                          </div>
                          
                          {week.topics && week.topics.length > 0 && (
                            <div className="mb-3">
                              <h4 className="font-semibold text-foreground mb-2">Topics</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {week.topics.map((topic, index) => (
                                  <li key={index} className="text-muted-foreground">{topic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {week.assignments && week.assignments.length > 0 && (
                            <div className="mb-3">
                              <h4 className="font-semibold text-foreground mb-2">Assignments</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {week.assignments.map((assignment, index) => (
                                  <li key={index} className="text-muted-foreground">{assignment}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {week.readings && week.readings.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Readings</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {week.readings.map((reading, index) => (
                                  <li key={index} className="text-muted-foreground">{reading}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {studyPlan.generatedAt && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Generated on {new Date(studyPlan.generatedAt).toLocaleDateString()} at {new Date(studyPlan.generatedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Get a personalized weekly study plan for {courseName} generated by AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Ask to AI" to generate a comprehensive study plan tailored to your course
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 