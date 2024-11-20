import React from 'react'
import { cn } from "../../lib/utils"
import { ChevronDown } from 'lucide-react'

const Select = React.forwardRef(({
  value,
  onValueChange,
  children,
  multiple = false,
  className,
  open: controlledOpen,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef(null)
  const triggerRef = ref || selectRef

  // Allow both controlled and uncontrolled open state
  const openState = controlledOpen !== undefined ? controlledOpen : isOpen

  const handleToggle = () => {
    if (controlledOpen === undefined) {
      setIsOpen(prev => !prev)
    }
  }

  const handleValueChange = (newValue) => {
    if (multiple) {
      // Handle multiple selection logic
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(newValue)
        ? currentValues.filter(v => v !== newValue)
        : [...currentValues, newValue]
      onValueChange(newValues)
    } else {
      onValueChange(newValue)
      if (controlledOpen === undefined) {
        setIsOpen(false)
      }
    }
  }

  return (
    <div 
      ref={triggerRef} 
      className={cn("relative", className)}
      {...props}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: handleToggle,
            isOpen: openState
          })
        }
        if (child.type === SelectContent && openState) {
          return React.cloneElement(child, {
            onItemSelect: handleValueChange,
            currentValue: value
          })
        }
        return child
      })}
    </div>
  )
})

const SelectTrigger = React.forwardRef(({
  children, 
  className, 
  isOpen,
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      role="combobox"
      aria-expanded={isOpen}
      className={cn(
        "flex items-center justify-between w-full border rounded-md px-3 py-2 cursor-pointer",
        isOpen && "ring-2 ring-ring",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        "w-4 h-4 opacity-50 transition-transform", 
        isOpen && "rotate-180"
      )} />
    </div>
  )
})

const SelectValue = ({ children, placeholder, className, ...props }) => {
  return (
    <span 
      className={cn("text-sm", className)} 
      {...props}
    >
      {children || placeholder}
    </span>
  )
}

const SelectContent = React.forwardRef(({
  children,
  className,
  onItemSelect,
  currentValue,
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      role="listbox"
      className={cn(
        "absolute z-50 w-full mt-1 border rounded-md shadow-lg bg-white",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => 
        React.cloneElement(child, {
          onSelect: () => onItemSelect(child.props.value),
          isSelected: Array.isArray(currentValue) 
            ? currentValue.includes(child.props.value)
            : currentValue === child.props.value
        })
      )}
    </div>
  )
})

const SelectItem = React.forwardRef(({
  children, 
  value, 
  className,
  onSelect,
  isSelected,
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        "px-3 py-2 cursor-pointer hover:bg-gray-100",
        isSelected && "bg-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Select.displayName = 'Select'
SelectTrigger.displayName = 'SelectTrigger'
SelectValue.displayName = 'SelectValue'
SelectContent.displayName = 'SelectContent'
SelectItem.displayName = 'SelectItem'

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
}