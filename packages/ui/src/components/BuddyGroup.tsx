import { useState, type ReactNode } from 'react';
import styles from './BuddyGroup.module.css';

interface BuddyGroupProps {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function BuddyGroup({ label, count, defaultOpen = true, children }: BuddyGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        className={styles.trigger}
        onClick={() => {
          setOpen(!open);
        }}
        type="button"
        aria-expanded={open}
      >
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`.trim()}
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden
        >
          <path d="M4.5 2l4 4-4 4" />
        </svg>
        <span>{label}</span>
        <span className={styles.count}>{count}</span>
      </button>
      {open && children}
    </div>
  );
}
