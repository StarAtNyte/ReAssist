import React from 'react'
import { cn } from "../../lib/utils"

const Separator = React.forwardRef(({ 
  className, 
  orientation = "horizontal", 
  decorative = true, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    role={decorative ? "presentation" : "separator"}
    aria-orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" 
        ? "h-[1px] w-full" 
        : "w-[1px] h-full",
      className
    )}
    {...props}
  />
))

Separator.displayName = 'Separator'

export { Separator }
