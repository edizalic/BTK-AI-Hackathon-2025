import React from 'react'
import { PageConfig } from '@/types/page-config'

/**
 * Fetch page configuration from local JSON files
 * This will be replaced with actual API calls to your NestJS backend
 */
export const fetchPageConfig = async (pageId: string): Promise<PageConfig> => {
  try {
    // Load from local JSON file (placeholder for NestJS API)
    const mockData = await import('@/data/mock-pages.json')
    const config = mockData.pages[pageId as keyof typeof mockData.pages]
    
    if (!config) {
      throw new Error(`Page configuration not found for: ${pageId}`)
    }
    
    return config as PageConfig
  } catch (error) {
    console.error('Error fetching page configuration:', error)
    throw error
  }
}

/**
 * Get available pages for a user from local JSON files
 * This will be replaced with actual API calls to your NestJS backend
 */
export const getAvailablePages = async (userType?: string, permissions?: string[]): Promise<Array<{
  id: string
  title: string
  description?: string
  userType?: string
}>> => {
  try {
    // Load from local JSON file (placeholder for NestJS API)
    const mockData = await import('@/data/mock-pages.json')
    
    // Filter pages based on user type and permissions
    const availablePages = Object.values(mockData.pages).filter((page) => {
      if (userType && page.userType && page.userType !== userType) {
        return false
      }
      
      if (permissions && page.metadata?.permissions) {
        return page.metadata.permissions.some(permission => 
          permissions.includes(permission)
        )
      }
      
      return true
    })
    
    return availablePages.map(page => ({
      id: page.id,
      title: page.title,
      description: page.description,
      userType: page.userType
    }))
  } catch (error) {
    console.error('Error fetching available pages:', error)
    throw error
  }
}

/**
 * Hook for loading page configuration from local JSON
 * This is a placeholder implementation until your NestJS backend is ready
 */
export const usePageConfigLocal = (pageId: string) => {
  const [pageConfig, setPageConfig] = React.useState<PageConfig | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    const loadPageConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const config = await fetchPageConfig(pageId)
        setPageConfig(config)
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

// Placeholder functions for future NestJS backend integration
// These will be implemented when your backend is ready

/**
 * Update page configuration (placeholder for NestJS API)
 * TODO: Implement with your NestJS backend
 */
export const updatePageConfig = async (pageId: string, config: PageConfig): Promise<PageConfig> => {
  console.warn('updatePageConfig is a placeholder - implement with NestJS backend')
  // For now, just return the config as-is
  return config
}

/**
 * Create new page configuration (placeholder for NestJS API)
 * TODO: Implement with your NestJS backend
 */
export const createPageConfig = async (config: PageConfig): Promise<PageConfig> => {
  console.warn('createPageConfig is a placeholder - implement with NestJS backend')
  // For now, just return the config as-is
  return config
}

/**
 * Delete page configuration (placeholder for NestJS API)
 * TODO: Implement with your NestJS backend
 */
export const deletePageConfig = async (pageId: string): Promise<boolean> => {
  console.warn('deletePageConfig is a placeholder - implement with NestJS backend')
  // For now, just return true
  return true
}