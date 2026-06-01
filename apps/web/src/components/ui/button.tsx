'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 disabled:pointer-events-none disabled:opacity-50',
          // Size
          size === 'sm' && 'h-8 px-4 text-sm',
          size === 'md' && 'h-11 px-6 text-sm',
          size === 'lg' && 'h-13 px-8 text-base',
          // Variant — DESIGN.md §17
          variant === 'primary' &&
            'rounded-card bg-accent text-white hover:bg-accent/90',
          variant === 'secondary' &&
            'rounded-card border border-navy bg-transparent text-navy hover:bg-navy/5',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
