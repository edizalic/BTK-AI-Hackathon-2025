"use client"

import React from 'react'
import { ComponentRegistry } from './ComponentRegistry'
import { ComponentConfig, PageConfig, PageSection, UserData } from '@/types/page-config'

interface DynamicRendererProps {
  pageConfig: PageConfig
  userData?: UserData
}

interface DynamicComponentProps {
  config: ComponentConfig
  userData?: UserData
}

// Template replacement function
const replaceTemplate = (content: string, userData?: UserData): string => {
  if (!userData || typeof content !== 'string') return content
  
  return content.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, obj, prop) => {
    if (obj === 'user' && userData[prop]) {
      return userData[prop]
    }
    return match
  })
}

// Process props to replace template variables
const processProps = (props: Record<string, any>, userData?: UserData): Record<string, any> => {
  if (!props) return {}
  
  const processed: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      processed[key] = replaceTemplate(value, userData)
    } else if (Array.isArray(value)) {
      // Handle arrays - process each item if it's an object, otherwise keep as is
      processed[key] = value.map(item => {
        if (typeof item === 'object' && item !== null && !React.isValidElement(item)) {
          return processProps(item, userData)
        }
        return typeof item === 'string' ? replaceTemplate(item, userData) : item
      })
    } else if (typeof value === 'object' && value !== null && !React.isValidElement(value)) {
      processed[key] = processProps(value, userData)
    } else {
      processed[key] = value
    }
  }
  
  return processed
}

// Dynamic component renderer
const DynamicComponent: React.FC<DynamicComponentProps> = ({ config, userData }) => {
  const { type, props = {}, children = [], className, style } = config
  
  // Get component from registry
  const Component = ComponentRegistry[type]
  
  if (!Component) {
    console.warn(`Component type "${type}" not found in registry`)
    return <div>Unknown component: {type}</div>
  }
  
  // Process props to replace template variables
  const processedProps = processProps(props, userData)
  
  // Add className and style if provided
  if (className) processedProps.className = className
  if (style) processedProps.style = style
  
  // Render children
  const renderedChildren = children.map((childConfig, index) => (
    <DynamicComponent 
      key={`${type}-child-${index}`} 
      config={childConfig} 
      userData={userData} 
    />
  ))
  
  // If children exist, pass them to the component
  if (renderedChildren.length > 0) {
    processedProps.children = renderedChildren
  }
  
  return <Component {...processedProps} />
}

// Section renderer
interface SectionRendererProps {
  section: PageSection
  userData?: UserData
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, userData }) => {
  const { type, components, layout } = section
  
  if (type === 'grid' && layout) {
    const { cols = 1, gap = '6', className = '' } = layout
    
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-${gap} ${className}`}>
        {components.map((component, index) => (
          <DynamicComponent 
            key={`${section.id}-${index}`} 
            config={component} 
            userData={userData} 
          />
        ))}
      </div>
    )
  }
  
  // Default section rendering
  return (
    <div className={layout?.className || ''}>
      {components.map((component, index) => (
        <DynamicComponent 
          key={`${section.id}-${index}`} 
          config={component} 
          userData={userData} 
        />
      ))}
    </div>
  )
}

// Main dynamic page renderer
export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ pageConfig, userData }) => {
  const { layout, sections } = pageConfig
  
  return (
    <div className={layout.className || ''}>
      <div className="max-w-4xl mx-auto">
        {sections.map((section) => (
          <SectionRenderer 
            key={section.id} 
            section={section} 
            userData={userData} 
          />
        ))}
      </div>
    </div>
  )
}

// Hook for loading page configuration from local JSON
export const usePageConfig = (pageId: string) => {
  const [pageConfig, setPageConfig] = React.useState<PageConfig | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    const loadPageConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load from local JSON file
        const mockData = await import('@/data/mock-pages.json')
        const config = mockData.pages[pageId as keyof typeof mockData.pages]
        
        if (!config) {
          throw new Error(`Page configuration not found for: ${pageId}`)
        }
        
        setPageConfig(config as PageConfig)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page configuration')
      } finally {
        setLoading(false)
      }
    }
    
    loadPageConfig()
  }, [pageId])
  
  return { pageConfig, loading, error }
}

// Higher-order component for dynamic pages
export const withDynamicRendering = (pageId: string) => {
  return function DynamicPage({ userData }: { userData?: UserData }) {
    const { pageConfig, loading, error } = usePageConfig(pageId)
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading page...</p>
          </div>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      )
    }
    
    if (!pageConfig) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-2">Page Not Found</h1>
            <p className="text-gray-600">The requested page configuration could not be loaded.</p>
          </div>
        </div>
      )
    }
    
    return <DynamicRenderer pageConfig={pageConfig} userData={userData} />
  }
}

export default DynamicRenderer