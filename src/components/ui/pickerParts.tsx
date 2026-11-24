import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/* Shared chrome for the custom date / time pickers (DESIGN.md: 6px trigger,
   24px popover, #6161ff active state). */

export interface PickerPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  align?: 'start' | 'end';
  label: string;
  /** Extra classes for the panel, e.g. a different width or `p-0`. */
  panelClassName?: string;
  children: ReactNode;
}

/**
 * Renders into a portal with fixed positioning so the panel is never clipped by
 * an ancestor with `overflow` (form modals) and flips above the trigger when
 * there is not enough room below.
 */
export function PickerPopover({
  open,
  onClose,
  anchorRef,
  align = 'start',
  label,
  panelClassName,
  children,
}: PickerPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Keep the latest callback without re-running the effect (which would blank the
  // panel for a frame every time the parent re-renders).
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const menu = ref.current?.getBoundingClientRect();
      if (!anchor || !menu) return;

      const margin = 8;
      const roomBelow = window.innerHeight - anchor.bottom;
      const flip = roomBelow < menu.height + margin && anchor.top > menu.height + margin;
      const top = flip ? anchor.top - menu.height - margin : anchor.bottom + margin;
      const preferredLeft = align === 'end' ? anchor.right - menu.width : anchor.left;
      const maxLeft = window.innerWidth - menu.width - margin;
      const left = Math.min(Math.max(margin, preferredLeft), Math.max(margin, maxLeft));

      const nextTop = Math.max(margin, top);
      // Scrolling inside the panel fires this too — bail out when nothing moved so
      // the wheel is not re-rendered on every scroll frame.
      setPos((prev) =>
        prev && prev.top === nextTop && prev.left === left ? prev : { top: nextTop, left },
      );
    };

    const frame = requestAnimationFrame(place);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !anchorRef.current?.contains(target)) {
        closeRef.current();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };

    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      setPos(null);
    };
  }, [open, align, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={cn(
        'z-[60] w-[19rem] max-w-[calc(100vw-2rem)] rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-elevated)]',
        panelClassName,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

export interface PickerTriggerProps {
  id: string;
  text: string;
  placeholder: string;
  icon: ReactNode;
  error?: string;
  hasValue: boolean;
  disabled?: boolean;
  clearable?: boolean;
  /** Accessible label for the clear button; defaults to the date wording. */
  clearLabel?: string;
  onClick: () => void;
  onClear: () => void;
}

export function PickerTrigger({
  id,
  text,
  placeholder,
  icon,
  error,
  hasValue,
  disabled,
  clearable,
  clearLabel,
  onClick,
  onClear,
}: PickerTriggerProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        onClick={onClick}
        disabled={disabled}
        aria-haspopup="dialog"
        className={cn(
          'flex min-h-[44px] w-full items-center gap-2 rounded-[6px] border border-pebble bg-snow px-4 py-3 text-left text-body-sm transition-colors',
          'focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasValue ? 'text-ink' : 'text-iron',
          error && 'border-[#e2445c]',
          clearable && hasValue && 'pr-10',
        )}
      >
        <span aria-hidden="true" className="shrink-0 text-slate">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{hasValue ? text : placeholder}</span>
      </button>

      {clearable && hasValue && !disabled && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel ?? t('common.clearDate')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate transition-colors hover:bg-cloud hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function PickerLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-body-sm font-medium text-ink">
      {children}
    </label>
  );
}

export function PickerError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-caption text-[#e2445c]">
      {error}
    </p>
  );
}
