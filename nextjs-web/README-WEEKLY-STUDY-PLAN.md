# AI Weekly Study Plan Feature

## Overview

The AI Weekly Study Plan feature allows students and teachers to generate personalized weekly study plans for courses using AI. This feature integrates with the Gemini API to create comprehensive study schedules.

## Components

### WeeklyStudyPlan Component

Located at `src/components/WeeklyStudyPlan.tsx`, this component provides:

- **"Ask to AI" button**: Generates personalized weekly study plans
- **Expandable weekly sections**: View detailed information for each week
- **Color-coded weeks**: Each week has a unique color for easy identification
- **Loading states**: Shows progress while AI generates the plan
- **Error handling**: Displays user-friendly error messages

### Features

1. **AI-Generated Content**: Each week includes:
   - Description of topics covered
   - List of assignments
   - Required readings
   - Learning objectives

2. **Interactive UI**:
   - Collapsible weekly sections
   - Visual indicators for AI-generated content
   - Responsive design for all devices

3. **Integration Points**:
   - Course detail pages (`/courses/[courseId]`)
   - Main courses page (`/courses`)
   - Backend Gemini API endpoint

## API Endpoint

### Frontend API Route
- **Path**: `/api/gemini/[courseId]/get-weekly-study-plan`
- **Method**: GET
- **Authentication**: Bearer token required
- **Purpose**: Proxies requests to backend Gemini service

### Backend Integration
- **Endpoint**: `/gemini/{courseId}/get-weekly-study-plan`
- **Expected Response Format**:
```json
{
  "success": true,
  "studyPlan": {
    "weeks": [
      {
        "week": "1",
        "description": "Introduction to course concepts",
        "topics": ["Topic 1", "Topic 2"],
        "assignments": ["Assignment 1"],
        "readings": ["Chapter 1", "Chapter 2"]
      }
    ]
  }
}
```

## Usage

### For Students
1. Navigate to any course detail page
2. Look for the "AI Weekly Study Plan" section
3. Click "Ask to AI" button
4. Wait for the AI to generate your personalized study plan
5. Expand weekly sections to view detailed information

### For Teachers
1. Access course detail pages
2. Use the AI study plan as a starting point for course planning
3. Customize the generated plan using the existing "Manage Study Plan" feature

## Implementation Details

### Component Props
```typescript
interface WeeklyStudyPlanProps {
  courseId: string
  courseName: string
  existingStudyPlan?: any
}
```

### State Management
- `studyPlan`: Current study plan data
- `loading`: Loading state for AI generation
- `error`: Error state and messages
- `expandedWeeks`: Tracks which weeks are expanded
- `showPlan`: Controls visibility of the plan section

### Styling
- Uses Tailwind CSS for responsive design
- Color-coded weeks with cycling color palette
- Consistent with existing UI components
- Dark mode support

## Error Handling

The component handles various error scenarios:
- Network failures
- Authentication issues
- Backend service errors
- Invalid response formats

Users can retry failed requests using the "Try Again" button.

## Future Enhancements

Potential improvements could include:
- Save generated plans to user profiles
- Export plans to PDF/calendar formats
- Integration with assignment due dates
- Progress tracking against study plans
- Collaborative study plan sharing 