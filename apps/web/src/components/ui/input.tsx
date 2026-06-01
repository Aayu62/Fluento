'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          className={cn(
            'h-11 w-full rounded-card border bg-paper px-4 font-mono text-sm text-navy placeholder:text-navy/40',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20',
            error ? 'border-error focus:ring-error/20' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="font-mono text-xs text-error">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
