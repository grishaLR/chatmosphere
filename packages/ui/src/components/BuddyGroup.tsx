import { useState, type ReactNode } from 'react';

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
        className="flex items-center gap-1 w-full px-3 py-1.5 text-xs font-semibold text-base-content/70 hover:bg-base-200 transition-colors"
        onClick={() => {
          setOpen(!open);
        }}
        type="button"
        aria-expanded={open}
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4.5 2l4 4-4 4" />
        </svg>
        <span>{label}</span>
        <span className="text-base-content/35 ml-auto">{count}</span>
      </button>
      {open && children}
    </div>
  );
}
