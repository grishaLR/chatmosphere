import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'error' | 'neutral';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'badge',
  error: 'badge badge-error text-error-content',
  neutral: 'badge badge-ghost',
} as const;

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>;
}
