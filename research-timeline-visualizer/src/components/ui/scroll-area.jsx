import * as React from "react"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative overflow-auto ${className}`}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  )
})
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }