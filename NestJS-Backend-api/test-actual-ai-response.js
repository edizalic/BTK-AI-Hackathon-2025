const axios = require('axios');

async function testActualAIResponse() {
  try {
    console.log('Testing actual AI response...');
    
    const response = await axios.get('http://localhost:3000/gemini/cmdz7p6fl0001ahr1zxqsonjm/get-weekly-study-plan', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWR6N3A2ZmwwMDAxYWhyMXpxc29uam0iLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTczMzU5NzM1MywiZXhwIjoxNzMzNjgzNzUzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });
    
    console.log('✅ Success! Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check if there are any console logs from the backend
    console.log('\n=== Checking for backend logs ===');
    console.log('The backend should have logged the AI response details.');
    console.log('Please check the backend console for the parsing logs.');
  }
}

testActualAIResponse(); 