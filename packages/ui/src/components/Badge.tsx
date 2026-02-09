import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'default' | 'error' | 'neutral';
  children: ReactNode;
  className?: string;
}

const variantClass = {
  default: styles.default,
  error: styles.error,
  neutral: styles.neutral,
} as const;

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variantClass[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}
