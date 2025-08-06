'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ResponsiveDrawer } from '@/components/ui/drawer'
import { AppDrawerContent } from '@/components/AppDrawer'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/AuthGuard'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'

interface AssignmentForm {
  title: string
  description: string
  type: 'PROJECT' | 'HOMEWORK' | 'LAB' | 'EXAM'
  dueDate: string
  maxPoints: number
  isGroupWork: boolean
}

export default function CreateAssignmentPage() {
  const params = useParams()
  const { courseId } = params
  const { user } = useAuth()
  
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    title: '',
    description: '',
    type: 'HOMEWORK',
    dueDate: '',
    maxPoints: 100,
    isGroupWork: false
  })
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignmentForm.title.trim()) {
      setError('Please enter an assignment title')
      return
    }

    if (!assignmentForm.dueDate) {
      setError('Please set a due date')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const formattedDueDate = assignmentForm.dueDate ? new Date(assignmentForm.dueDate + ':00').toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const requestBody = {
        courseId: courseId,
        title: assignmentForm.title,
        description: assignmentForm.description,
        type: assignmentForm.type,
        dueDate: formattedDueDate,
        maxPoints: assignmentForm.maxPoints,
        isGroupWork: assignmentForm.isGroupWork
      }

      console.log('Sending assignment data:', requestBody)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Assignment creation error response:', errorData)
        throw new Error(`Failed to create assignment: ${response.status} ${response.statusText} - ${errorData}`)
      }

      // Redirect back to course details
      window.location.href = `/courses/${courseId}`
    } catch (err) {
      console.error('Error creating assignment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
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
    <AuthGuard allowedRoles={['TEACHER', 'SUPERVISOR_TEACHER']}>
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
                  <h1 className="text-3xl font-bold text-foreground">Create Assignment</h1>
                  <p className="text-muted-foreground">Create a new assignment for your course</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Assignment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Assignment Title *</Label>
                      <Input
                        id="title"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter assignment title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Assignment Type</Label>
                      <select
                        id="type"
                        value={assignmentForm.type}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="HOMEWORK">Homework</option>
                        <option value="PROJECT">Project</option>
                        <option value="LAB">Lab</option>
                        <option value="EXAM">Exam</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={assignmentForm.dueDate}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPoints">Maximum Points</Label>
                      <Input
                        id="maxPoints"
                        type="number"
                        value={assignmentForm.maxPoints}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                        min="1"
                        max="1000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter assignment description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

                             {/* Assignment Settings */}
               <Card>
                 <CardHeader>
                   <CardTitle>Assignment Settings</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex items-center space-x-2">
                     <Checkbox
                       id="isGroupWork"
                       checked={assignmentForm.isGroupWork}
                       onCheckedChange={(checked) => setAssignmentForm(prev => ({ ...prev, isGroupWork: checked as boolean }))}
                     />
                     <Label htmlFor="isGroupWork">Group Assignment</Label>
                   </div>
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
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-semibold capitalize">{assignmentForm.type.toLowerCase()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points:</span>
                      <p className="font-semibold">{assignmentForm.maxPoints}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <p className="font-semibold">{assignmentForm.dueDate ? new Date(assignmentForm.dueDate).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Group Work:</span>
                      <p className="font-semibold">{assignmentForm.isGroupWork ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
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
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating Assignment...' : 'Create Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ResponsiveDrawer>
    </AuthGuard>
  )
} 