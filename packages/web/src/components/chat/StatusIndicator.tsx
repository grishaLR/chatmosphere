import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusIndicator({ status, size = 'sm' }: StatusIndicatorProps) {
  const className = [
    styles.dot,
    size === 'md' ? styles.md : styles.sm,
    status === 'online' ? styles.online : '',
    status === 'away' ? styles.away : '',
    status === 'idle' ? styles.idle : '',
    status === 'offline' ? styles.offline : '',
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={className} title={status} />;
}
