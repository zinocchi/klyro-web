import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Overrides the default localized "Loading" screen-reader label. */
  label?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const { t } = useTranslation();

  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full',
          'bg-[conic-gradient(from_270deg,rgb(129,129,255)_15%,rgb(51,219,219)_40%,rgb(51,213,142)_55%,rgb(255,214,51)_65%,rgb(252,82,125)_85%,rgb(129,129,255)_100%)]',
          'mask-[radial-gradient(circle,transparent_55%,black_60%)]',
          sizes[size],
          className,
        )}
      />
      <span className="sr-only">{label ?? t('common.loading')}</span>
    </span>
  );
}
