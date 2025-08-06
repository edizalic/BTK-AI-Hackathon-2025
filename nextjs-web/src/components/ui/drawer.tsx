"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  children: React.ReactNode
  className?: string
}

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
}

interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDrawerProps {
  children: React.ReactNode
  drawerContent: React.ReactNode
  className?: string
}

// Basic drawer components
const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  )
)
Drawer.displayName = "Drawer"

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-background border-r border-border h-full overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
)
DrawerDescription.displayName = "DrawerDescription"

// Responsive drawer that's always open on desktop, toggleable on mobile
const ResponsiveDrawer = React.forwardRef<HTMLDivElement, ResponsiveDrawerProps>(
  ({ children, drawerContent, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div ref={ref} className={cn("flex h-screen", className)} {...props}>
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        {/* Drawer */}
        <div
          className={cn(
            "fixed left-0 top-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <DrawerContent className="w-full h-full">
            {/* Close button for mobile */}
            <div className="lg:hidden p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="ml-auto"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
            {drawerContent}
          </DrawerContent>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden lg:ml-0">
          <main className="h-full overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
    )
  }
)
ResponsiveDrawer.displayName = "ResponsiveDrawer"

export { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  ResponsiveDrawer 
}