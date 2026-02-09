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
      type="button"
      role="menuitem"
      className={`${styles.menuItem} ${danger ? styles.menuItemDanger : ''}`.trim()}
      onClick={onClick}
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
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
          role="menu"
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
