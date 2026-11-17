import iconSrc from '../../assets/KLYRO BRAND PACK/ICON.svg';
import logoSrc from '../../assets/KLYRO BRAND PACK/logo-h.svg';

export interface KlyroIconProps {
  size?: number;
  className?: string;
}

/** Standalone Klyro "K" mark — square, for avatars and tight spots. */
export function KlyroIcon({ size = 28, className }: KlyroIconProps) {
  return (
    <img
      src={iconSrc}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export interface KlyroLogoProps {
  /** Full lockup (mark + wordmark) or the mark only. */
  variant?: 'full' | 'mark';
  height?: number;
  className?: string;
}

/** Klyro brand lockup. `full` uses the official horizontal lockup; `mark` uses the icon. */
export function KlyroLogo({ variant = 'full', height = 28, className }: KlyroLogoProps) {
  if (variant === 'mark') {
    return <KlyroIcon size={height} className={className} />;
  }

  return (
    <img
      src={logoSrc}
      alt="Klyro"
      height={height}
      className={className}
      style={{ height, width: 'auto' }}
    />
  );
}
