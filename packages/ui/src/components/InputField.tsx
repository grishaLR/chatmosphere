import type { InputHTMLAttributes } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'compact';
}

export function InputField({ variant = 'default', className = '', ...props }: InputFieldProps) {
  return (
    <input
      className={`${styles.input} ${variant === 'compact' ? styles.compact : ''} ${className}`.trim()}
      {...props}
    />
  );
}
