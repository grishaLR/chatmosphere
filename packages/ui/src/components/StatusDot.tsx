import type { PresenceStatus } from '@chatmosphere/shared';

interface StatusDotProps {
  status: PresenceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
} as const;

const statusClasses: Record<PresenceStatus, string> = {
  online: 'bg-success',
  away: 'bg-warning',
  idle: 'bg-[var(--cm-status-idle)]',
  offline: 'bg-[var(--cm-status-offline)]',
  invisible: 'bg-[var(--cm-status-offline)]',
};

export function StatusDot({ status, size = 'sm', className = '' }: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${sizeClasses[size]} ${statusClasses[status]} ${className}`}
      role="img"
      aria-label={status}
    />
  );
}
