import type { ReactNode } from 'react';

interface WindowChromeProps {
  title: ReactNode;
  actions?: ReactNode;
  onTitleClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function WindowChrome({
  title,
  actions,
  onTitleClick,
  children,
  className = '',
}: WindowChromeProps) {
  return (
    <div
      className={`flex flex-col bg-base-100 border border-base-300 rounded-t-lg overflow-hidden shadow-[0_-2px_12px_oklch(0_0_0/0.12)] ${className}`}
    >
      <div
        className="flex items-center gap-2 px-2.5 py-2 bg-primary text-primary-content cursor-pointer shrink-0 min-h-9"
        onClick={onTitleClick}
        role={onTitleClick ? 'button' : undefined}
        tabIndex={onTitleClick ? 0 : undefined}
        onKeyDown={
          onTitleClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') onTitleClick();
              }
            : undefined
        }
      >
        <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-semibold">
          {title}
        </span>
        {actions && <span className="flex items-center gap-1 shrink-0">{actions}</span>}
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
