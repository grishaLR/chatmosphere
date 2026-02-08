import { useEffect, useRef, useState, type ReactNode } from 'react';

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
      className={`block w-full px-3 py-1.5 text-left text-xs whitespace-nowrap bg-transparent border-none cursor-pointer ${
        danger ? 'text-error hover:bg-error/5' : 'text-base-content hover:bg-base-100'
      }`}
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
    <div ref={ref} className={`relative ${className}`}>
      <div
        onClick={() => {
          setOpen(!open);
        }}
      >
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute top-full mt-0.5 bg-base-100 border border-base-300 rounded-md shadow-[var(--cm-shadow-md)] min-w-[170px] z-50 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
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
