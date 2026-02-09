import type { ReactNode } from 'react';
import styles from './WindowChrome.module.css';

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
    <div className={`${styles.root} ${className}`.trim()}>
      <div
        className={styles.titlebar}
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
        <span className={styles.title}>{title}</span>
        {actions && <span className={styles.actions}>{actions}</span>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
