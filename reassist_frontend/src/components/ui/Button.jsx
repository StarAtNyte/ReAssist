import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    outline:
      'border border-blue-600 text-blue-600 hover:bg-blue-100 focus-visible:ring-blue-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  const sizeStyles = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export {Button};