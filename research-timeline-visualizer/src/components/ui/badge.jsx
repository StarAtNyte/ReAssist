import React from 'react'
import { cn } from "../../lib/utils"
import { cva } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "text-foreground",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn(badgeVariants({ variant }), className)} 
    {...props}
  >
    {children}
  </div>
))

Badge.displayName = 'Badge'

export { Badge }