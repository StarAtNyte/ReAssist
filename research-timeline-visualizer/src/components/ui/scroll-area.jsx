import React from 'react'
import { cn } from "../../lib/utils"

const ScrollArea = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100", 
      className
    )} 
    {...props}
  >
    {children}
  </div>
))

ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }