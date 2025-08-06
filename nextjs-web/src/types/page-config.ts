// Page configuration types for dynamic component generation

export interface ComponentConfig {
  type: string
  props?: Record<string, any>
  children?: ComponentConfig[]
  className?: string
  style?: Record<string, any>
}

export interface PageSection {
  id: string
  type: 'header' | 'card' | 'grid' | 'container' | 'custom'
  title?: string
  description?: string
  components: ComponentConfig[]
  layout?: {
    cols?: number
    gap?: string
    className?: string
  }
}

export interface PageConfig {
  id: string
  title: string
  description?: string
  userType?: 'student' | 'teacher' | 'admin' | 'public'
  layout: {
    type: 'standard' | 'dashboard' | 'full-width'
    className?: string
  }
  sections: PageSection[]
  metadata?: {
    requiresAuth?: boolean
    permissions?: string[]
    [key: string]: any
  }
}

export interface UserData {
  name: string
  email: string
  role?: string
  [key: string]: any
}

// Component prop interfaces
export interface InfoCardProps {
  title: string
  value: string
  description?: string
  icon?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export interface ActivityItemProps {
  title: string
  description: string
  timestamp: string
  status?: 'success' | 'info' | 'warning' | 'error'
}

export interface ActionCardProps {
  title: string
  description: string
  icon?: string
  link?: string
  buttonText?: string
  variant?: 'default' | 'outline'
}

export interface HelpSectionProps {
  title: string
  description: string
  contacts: {
    type: 'email' | 'phone' | 'hours'
    label: string
    value: string
  }[]
  variant?: 'warning' | 'info' | 'default'
}