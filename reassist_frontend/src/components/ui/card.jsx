import React from 'react'
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn("rounded-lg border bg-white shadow-sm", className)} 
    {...props}
  >
    {children}
  </div>
))

const CardHeader = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)} 
    {...props}
  >
    {children}
  </div>
))

const CardTitle = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <h3 
    ref={ref} 
    className={cn("text-lg font-semibold leading-none tracking-tight", className)} 
    {...props}
  >
    {children}
  </h3>
))

const CardContent = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }