"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { GuestGuard } from "@/components/AuthGuard"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"teacher" | "student">("student")
  const [teacherData, setTeacherData] = useState({ email: "", password: "" })
  const [studentData, setStudentData] = useState({ email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  
  const { login, isLoading } = useAuth()



  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await login(teacherData.email, teacherData.password)
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    }
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await login(studentData.email, studentData.password)
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    }
  }

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-white">Education System Login</CardTitle>
            <CardDescription className="text-gray-300">
              Select your login type to access the system
            </CardDescription>
          </CardHeader>
          
          {/* Tab Selector */}
          <div className="px-6 pb-2">
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab("student")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "student"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                🎓 Student Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("teacher")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === "teacher"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                👩‍🏫 Teacher Login
              </button>
            </div>
          </div>
          
          {/* Teacher Login Form */}
          {activeTab === "teacher" && (
            <form onSubmit={handleTeacherSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email" className="text-white font-medium">
                    Teacher Email
                  </Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@school.edu"
                    value={teacherData.email}
                    onChange={(e) => setTeacherData({...teacherData, email: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teacher-password" className="text-white font-medium">
                    Password
                  </Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Enter your password"
                    value={teacherData.password}
                    onChange={(e) => setTeacherData({...teacherData, password: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/20" />
                    <span>Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-blue-300 hover:text-blue-200 underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Access Teacher Dashboard"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Student Login Form */}
          {activeTab === "student" && (
            <form onSubmit={handleStudentSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email" className="text-white font-medium">
                    Student Email
                  </Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@school.edu"
                    value={studentData.email}
                    onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="student-password" className="text-white font-medium">
                    Password
                  </Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={studentData.password}
                    onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/20" />
                    <span>Remember me</span>
                  </label>
                  <p className="text-gray-400 text-xs">
                    Contact your teacher if you forgot your password
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Access Student Portal"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
        
        <div className="text-center text-gray-300 mt-6 space-y-2">
          <p className="text-sm">
            🎓 <strong>Students:</strong> Use your student email and password provided by your teacher
          </p>
          <p className="text-sm">
            👨‍🏫 <strong>Teachers:</strong> Use your institutional email to access the dashboard
          </p>
        </div>
      </div>
    </div>
    </GuestGuard>
  )
}