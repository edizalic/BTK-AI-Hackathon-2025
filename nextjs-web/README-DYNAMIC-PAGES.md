# Dynamic Page Generation System

This system allows you to create and manage pages dynamically through JSON configurations and API calls. Pages are defined as JSON objects that describe the layout, components, and content, which are then rendered as React components.

## Overview

The dynamic page system consists of several key components:

1. **Page Configuration Types** (`src/types/page-config.ts`) - TypeScript interfaces for page structure
2. **Component Registry** (`src/components/ComponentRegistry.tsx`) - Maps JSON component types to React components
3. **Dynamic Renderer** (`src/components/DynamicRenderer.tsx`) - Renders pages from JSON configurations
4. **Mock Data** (`src/data/mock-pages.json`) - Example page configurations
5. **API Endpoints** (`src/app/api/pages/`) - REST API for managing page configurations
6. **API Utils** (`src/lib/pageApi.ts`) - Helper functions for API interactions

## Quick Start

### 1. Define a Page Configuration

Create a JSON configuration that describes your page:

```json
{
  "id": "my-page",
  "title": "My Custom Page",
  "userType": "student",
  "layout": {
    "type": "dashboard",
    "className": "min-h-screen bg-gray-50"
  },
  "sections": [
    {
      "id": "header",
      "type": "header",
      "components": [
        {
          "type": "h1",
          "props": {
            "children": "Welcome, {{user.name}}!"
          }
        }
      ]
    }
  ]
}
```

### 2. Create a Page Component

```tsx
"use client"

import { DynamicRenderer, usePageConfig } from "@/components/DynamicRenderer"

export default function MyPage() {
  const userData = { name: "John Doe", email: "john@example.com" }
  const { pageConfig, loading, error } = usePageConfig('my-page')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!pageConfig) return <div>Page not found</div>

  return <DynamicRenderer pageConfig={pageConfig} userData={userData} />
}
```

## Available Components

### Layout Components
- `div` - Basic container
- `container` - Max-width container with auto margins
- `grid` - CSS Grid layout with configurable columns and gap

### UI Components
- `card`, `card-header`, `card-title`, `card-description`, `card-content` - Card components
- `button` - Button component

### Custom Components
- `info-card` - Display key-value information with styling variants
- `activity-item` - Activity feed item with status indicator
- `action-card` - Action cards with buttons and links
- `help-section` - Help/info sections with contact details

### Typography
- `h1`, `h2` - Headings with default styling
- `p` - Paragraphs with default styling
- `text` - Raw text with custom content

## Template Variables

Use template variables in your JSON to inject user data:

```json
{
  "type": "text",
  "props": {
    "content": "Welcome back, {{user.name}}!"
  }
}
```

Available variables:
- `{{user.name}}` - User's name
- `{{user.email}}` - User's email
- Any property from the userData object

## Component Props

### InfoCard
```json
{
  "type": "info-card",
  "props": {
    "title": "Field Name",
    "value": "Display Value",
    "description": "Helper text",
    "variant": "primary" // default, primary, secondary, success, warning, danger
  }
}
```

### ActivityItem
```json
{
  "type": "activity-item",
  "props": {
    "title": "Activity title",
    "description": "Activity description",
    "timestamp": "2 hours ago",
    "status": "success" // success, info, warning, error
  }
}
```

### ActionCard
```json
{
  "type": "action-card",
  "props": {
    "title": "Card Title",
    "description": "Card description",
    "icon": "📚",
    "link": "/courses",
    "buttonText": "View Courses",
    "variant": "outline" // default, outline
  }
}
```

## Local JSON Data

Currently the system uses placeholder JSON files for page configurations. These will be replaced with API calls to your NestJS backend.

### Current Structure
- `src/data/mock-pages.json` - Contains all page configurations
- Pages are loaded from local imports
- No API routes in the Next.js app

### Using Local Data

### Fetch Page Configuration
```typescript
import { fetchPageConfig } from '@/lib/pageApi'

// Currently loads from local JSON, will be replaced with NestJS API
const config = await fetchPageConfig('student-portal')
```

### Get Available Pages
```typescript
import { getAvailablePages } from '@/lib/pageApi'

// Currently filters local data, will be replaced with NestJS API
const pages = await getAvailablePages('student', ['read'])
```

## Integration with NestJS Backend

When your NestJS backend is ready, you'll need to:

1. **Replace placeholder functions** in `src/lib/pageApi.ts`
2. **Update API endpoints** to point to your NestJS server
3. **Add authentication** headers as needed
4. **Handle CORS** configuration

### Example NestJS Integration
```typescript
// Future implementation example
export const fetchPageConfig = async (pageId: string): Promise<PageConfig> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch page configuration')
  }
  
  return await response.json()
}
```

## Creating Custom Components

### 1. Define the Component
```tsx
export const MyCustomComponent: React.FC<MyCustomProps> = ({ title, content }) => {
  return (
    <div className="my-custom-component">
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  )
}
```

### 2. Register the Component
```tsx
// In ComponentRegistry.tsx
export const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  // ... existing components
  'my-custom-component': MyCustomComponent,
}
```

### 3. Use in JSON Configuration
```json
{
  "type": "my-custom-component",
  "props": {
    "title": "Custom Title",
    "content": "Custom content here"
  }
}
```

## Best Practices

1. **Type Safety**: Always define TypeScript interfaces for custom component props
2. **Validation**: Validate page configurations before rendering
3. **Error Handling**: Implement proper error boundaries and fallbacks
4. **Performance**: Use React.memo for custom components when appropriate
5. **Accessibility**: Ensure all custom components follow accessibility guidelines
6. **Testing**: Write tests for custom components and page configurations

## Migration from Static Pages

To convert existing static pages to dynamic pages:

1. Analyze the current component structure
2. Break down the page into sections and components
3. Create JSON configuration matching the structure
4. Replace static imports with DynamicRenderer
5. Test thoroughly with different user data

## Adding New Pages

### 1. Create Page Configuration
Add your page configuration to `src/data/mock-pages.json`:

```json
{
  "pages": {
    "my-new-page": {
      "id": "my-new-page",
      "title": "My New Page",
      "userType": "student",
      "layout": {
        "type": "dashboard",
        "className": "min-h-screen bg-gray-50"
      },
      "sections": [
        {
          "id": "header",
          "type": "header",
          "components": [
            {
              "type": "h1",
              "props": {
                "children": "My New Page"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### 2. Create Page Component
Create the page component file:

```tsx
// src/app/my-new-page/page.tsx
"use client"

import { DynamicRenderer, usePageConfig } from "@/components/DynamicRenderer"

export default function MyNewPage() {
  const userData = { name: "User Name", email: "user@example.com" }
  const { pageConfig, loading, error } = usePageConfig('my-new-page')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!pageConfig) return <div>Page not found</div>

  return <DynamicRenderer pageConfig={pageConfig} userData={userData} />
}
```

### 3. Add to Navigation
Update your navigation to include the new page.

## Examples

See the following files for complete examples:
- `src/data/mock-pages.json` - Active page configurations
- `src/data/page-templates.json` - Template examples for new pages
- `src/app/student-portal/page.tsx` - Student portal implementation
- `src/app/teacher-portal/page.tsx` - Teacher portal implementation

## Future Enhancements

Potential improvements to the system:
- Visual page builder interface
- Component variation support
- Advanced template features
- Real-time page updates
- A/B testing integration
- Analytics integration
- Caching strategies
- Database integration