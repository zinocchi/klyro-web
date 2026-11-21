import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-monday-violet text-snow hover:opacity-90',
  secondary: 'border border-slate bg-transparent text-ink hover:bg-cloud',
  ghost: 'bg-transparent text-slate hover:bg-cloud',
  danger: 'bg-[#e2445c] text-snow hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-caption',
  md: 'min-h-[44px] px-6 py-[13px] text-body-sm',
  lg: 'min-h-[48px] px-8 py-[15px] text-body',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading = false, fullWidth, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-opacity',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-monday-violet',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
