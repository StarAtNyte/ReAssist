import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="tabs">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  className = '',
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1
        text-sm font-medium transition-all focus-visible:outline-none
        disabled:pointer-events-none disabled:opacity-50
        hover:bg-white/50
        aria-selected:bg-white aria-selected:text-gray-900 aria-selected:shadow-sm
        ${className}
      `}
      aria-selected={value === value}
    >
      {children}
    </button>
  );
};