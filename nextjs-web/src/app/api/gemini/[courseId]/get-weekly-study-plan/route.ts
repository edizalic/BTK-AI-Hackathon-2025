import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    
    console.log('🔍 Weekly Study Plan API Debug:')
    console.log('Course ID:', courseId)
    console.log('Course ID type:', typeof courseId)
    console.log('Course ID length:', courseId?.length)
    console.log('Is courseId valid UUID format?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId))
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header missing or invalid')
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('✅ Authorization token found (length:', token.length, ')')
    console.log('Token starts with:', token.substring(0, 20))
    
    // Log all incoming request headers for debugging
    console.log('📋 All incoming request headers:')
    request.headers.forEach((value, key) => {
      console.log(`${key}:`, key === 'authorization' ? `${value.substring(0, 20)}...` : value)
    })
    
    // Forward the request to the backend Gemini endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const fullUrl = `${backendUrl}/gemini/${courseId}/get-weekly-study-plan`
    
    console.log('🌐 Making request to backend:')
    console.log('URL:', fullUrl)
    console.log('Method: GET')
    console.log('Backend URL from env:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    console.log('Headers being sent:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    })
    
    // Try the request with additional headers that might be expected
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0'
      }
    })

    console.log('📡 Backend response:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      console.log('❌ Backend request failed with status:', response.status)
      
      // Try to get the response text first to see what the backend is actually returning
      const responseText = await response.text()
      console.log('Raw response text:', responseText)
      
      let errorData: any = {}
      try {
        errorData = JSON.parse(responseText)
        console.log('Parsed error data:', errorData)
      } catch (parseError) {
        console.log('Could not parse response as JSON:', parseError)
        errorData = { message: responseText || 'Unknown error' }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || `Backend request failed: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Backend request successful:')
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      studyPlan: data.studyPlan || data.weeks || data,
      message: data.message || 'Study plan generated successfully'
    })

  } catch (error) {
    console.error('💥 Error in weekly study plan API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 