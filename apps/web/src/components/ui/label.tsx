import { cn } from '@/lib/utils/cn';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-metadata block text-navy/70', className)}
      {...props}
    >
      {children}
    </label>
  );
}
