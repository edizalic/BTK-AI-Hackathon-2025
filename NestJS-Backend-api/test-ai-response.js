// Test script to simulate AI responses and test parsing logic
const testCases = [
  // Case 1: Perfect JSON array
  '[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]}]',
  
  // Case 2: JSON with markdown
  '```json\n[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]}]\n```',
  
  // Case 3: JSON object with weeks property
  '{"weeks":[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]}]}',
  
  // Case 4: Text with JSON embedded
  'Here is your study plan:\n[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]}]',
  
  // Case 5: Invalid JSON (what might be causing the issue)
  'I apologize, but I cannot generate a study plan at this time. Please try again later.',
  
  // Case 6: Empty response
  '',
  
  // Case 7: Non-JSON text
  'This is not a JSON response',
  
  // Case 8: Malformed JSON
  '[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]',
  
  // Case 9: JSON with extra text
  'Study plan generated:\n[{"weekNumber":1,"title":"Week 1: Introduction","objectives":["Learn basics"]}]\nEnd of response'
];

function parseAIResponse(result, context) {
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
      throw new Error('No valid JSON found in response');
    } catch (extractError) {
      console.error(`❌ Failed to parse ${context} response`);
      console.error('Original response:', result);
      console.error('Parse error:', parseError);
      console.error('Extract error:', extractError);
      throw new Error(`Invalid JSON response from AI model for ${context}. Please try again.`);
    }
  }
}

// Test each case
testCases.forEach((testCase, index) => {
  console.log(`\n\n=== TEST CASE ${index + 1} ===`);
  try {
    const result = parseAIResponse(testCase, 'test');
    console.log('✅ SUCCESS:', typeof result, Array.isArray(result) ? 'Array' : 'Object');
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
}); 