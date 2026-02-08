import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'compact';
}

const variantClasses = {
  default: 'input input-bordered w-full text-sm',
  compact: 'input input-bordered input-sm w-full text-xs',
} as const;

export function InputField({ variant = 'default', className = '', ...props }: InputFieldProps) {
  return <input className={`${variantClasses[variant]} ${className}`} {...props} />;
}
