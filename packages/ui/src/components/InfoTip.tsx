import { useCallback, useRef, useState, type ReactNode } from 'react';
import styles from './InfoTip.module.css';

interface InfoTipProps {
  text: ReactNode;
}

export function InfoTip({ text }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
    setOpen(true);
  }, []);

  return (
    <span
      ref={ref}
      className={styles.trigger}
      onMouseEnter={show}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      ?
      {open && (
        <div className={styles.popover} style={{ top: pos.top, left: pos.left }}>
          {text}
        </div>
      )}
    </span>
  );
}
