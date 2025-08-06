const axios = require('axios');

async function testGeminiEndpoint() {
  try {
    console.log('Testing Gemini endpoint...');
    
    const response = await axios.get('http://localhost:3000/gemini/cmdz7p6fl0001ahr1zxqsonjm/get-weekly-study-plan', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWR6N3A2ZmwwMDAxYWhyMXpxc29uam0iLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTczMzU5NzM1MywiZXhwIjoxNzMzNjgzNzUzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Success! Response status:', response.status);
    console.log('Response data structure:', {
      hasStudyPlan: !!response.data.studyPlan,
      studyPlanType: typeof response.data.studyPlan,
      isArray: Array.isArray(response.data.studyPlan),
      length: response.data.studyPlan?.length || 0,
      hasMetadata: !!response.data.metadata
    });
    
    if (response.data.studyPlan && Array.isArray(response.data.studyPlan)) {
      console.log('First week structure:', {
        weekNumber: response.data.studyPlan[0]?.weekNumber,
        title: response.data.studyPlan[0]?.title,
        hasObjectives: !!response.data.studyPlan[0]?.objectives,
        objectivesCount: response.data.studyPlan[0]?.objectives?.length || 0
      });
    }
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGeminiEndpoint(); 