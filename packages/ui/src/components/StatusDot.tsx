import type { PresenceStatus } from '@chatmosphere/shared';
import styles from './StatusDot.module.css';

interface StatusDotProps {
  status: PresenceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

function getStatusClass(status: PresenceStatus): string {
  const c =
    status === 'online'
      ? styles.statusOnline
      : status === 'away'
        ? styles.statusAway
        : status === 'idle'
          ? styles.statusIdle
          : status === 'offline'
            ? styles.statusOffline
            : styles.statusInvisible;
  return c ?? '';
}

export function StatusDot({ status, size = 'sm', className = '' }: StatusDotProps) {
  const sizeClass = size === 'md' ? styles.dotMd : styles.dotSm;
  return (
    <span
      className={`${styles.dot} ${sizeClass} ${getStatusClass(status)} ${className}`.trim()}
      role="img"
      aria-label={status}
    />
  );
}
