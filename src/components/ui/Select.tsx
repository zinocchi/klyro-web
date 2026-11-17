import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-[6px] border border-pebble bg-snow px-4 py-[13px] text-body-sm text-ink',
            'focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet',
            error && 'border-[#e05c5c]',
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-caption text-[#e05c5c]">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
