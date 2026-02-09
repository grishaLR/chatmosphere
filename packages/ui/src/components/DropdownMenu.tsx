import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export interface MenuItemProps {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

export function MenuItem({ label, danger = false, onClick }: MenuItemProps) {
  return (
    <button
      className={`${styles.menuItem} ${danger ? styles.menuItemDanger : ''}`.trim()}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className = '',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <div ref={ref} className={`${styles.root} ${className}`.trim()}>
      <div
        onClick={() => {
          setOpen(!open);
        }}
      >
        {trigger}
      </div>
      {open && (
        <div
          className={`${styles.panel} ${align === 'right' ? styles.panelRight : styles.panelLeft}`}
          onClick={() => {
            setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
