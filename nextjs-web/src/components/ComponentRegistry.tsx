import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { 
  InfoCardProps, 
  ActivityItemProps, 
  ActionCardProps, 
  HelpSectionProps 
} from '@/types/page-config'

// Basic HTML Components
const H1 = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("text-3xl font-bold tracking-tight", className)} {...props}>
    {children}
  </h1>
)

const H2 = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-2xl font-semibold", className)} {...props}>
    {children}
  </h2>
)

const H3 = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-medium", className)} {...props}>
    {children}
  </h3>
)

const P = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-muted-foreground", className)} {...props}>
    {children}
  </p>
)

const Div = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props}>
    {children}
  </div>
)

const Text = ({ content, children, className, ...props }: { content?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={className} {...props}>
    {content || children}
  </span>
)

// Layout Components
const Container = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("container mx-auto px-4", className)} {...props}>
    {children}
  </div>
)

const Grid = ({ children, cols = 1, gap = "6", className, ...props }: { 
  children: React.ReactNode; 
  cols?: number; 
  gap?: string;
  className?: string;
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[cols] || "grid-cols-1"

  return (
    <div className={cn(`grid ${gridCols} gap-${gap}`, className)} {...props}>
      {children}
    </div>
  )
}

// Custom Components
const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: "bg-white dark:bg-slate-800 border-border",
    primary: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800",
    secondary: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-700",
    success: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800",
    warning: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800",
    danger: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800"
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {icon && <span className="text-3xl">{icon}</span>}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  title, 
  description, 
  timestamp, 
  status = 'info' 
}) => {
  const statusStyles = {
    success: "bg-green-500 dark:bg-green-600",
    info: "bg-blue-500 dark:bg-blue-600",
    warning: "bg-yellow-500 dark:bg-yellow-600",
    error: "bg-red-500 dark:bg-red-600"
  }

  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200 border border-border">
      <div className="flex-shrink-0 pt-1">
        <div className={cn("w-3 h-3 rounded-full", statusStyles[status])}></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
      </div>
    </div>
  )
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  link, 
  buttonText = "Learn More", 
  variant = 'default' 
}) => {
  const CardComponent = (
    <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-2">
          {icon && <span className="text-3xl">{icon}</span>}
          <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant={variant} className="w-full font-semibold">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )

  if (link) {
    return (
      <Link href={link} className="block">
        {CardComponent}
      </Link>
    )
  }

  return CardComponent
}

const HelpSection: React.FC<HelpSectionProps> = ({ 
  title, 
  description, 
  contacts, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: "bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-border",
    warning: "bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800",
    info: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", variantStyles[variant])}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-border/50">
              <p className="font-semibold text-sm text-foreground mb-2">
                {contact.label.replace(/📧|📞|🕐|📩|☎️|⏰|🔗|💬|📱/g, '').trim()}
              </p>
              <p className="text-sm text-muted-foreground font-medium">{contact.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Component Registry - maps component type strings to actual components
export const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  // Basic HTML Elements
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  div: Div,
  text: Text,
  
  // Layout Components
  container: Container,
  grid: Grid,
  
  // Card Components
  card: Card,
  'card-header': CardHeader,
  'card-title': CardTitle,
  'card-description': CardDescription,
  'card-content': CardContent,
  
  // Custom Components
  'info-card': InfoCard,
  'activity-item': ActivityItem,
  'action-card': ActionCard,
  'help-section': HelpSection,
  
  // UI Components
  button: Button,
}

export default ComponentRegistry