import type { ReactNode } from 'react';
import styles from './ChatBubble.module.css';

interface ChatBubbleProps {
  position: 'start' | 'end';
  pending?: boolean;
  timestamp?: string;
  children: ReactNode;
}

export function ChatBubble({ position, pending = false, timestamp, children }: ChatBubbleProps) {
  const isOwn = position === 'end';

  return (
    <div className={`${styles.wrapper} ${isOwn ? styles.wrapperOwn : styles.wrapperOther}`.trim()}>
      <div
        className={`${styles.bubble} ${
          isOwn ? styles.bubbleOwn : styles.bubbleOther
        } ${pending ? styles.pending : ''}`.trim()}
      >
        {children}
      </div>
      {timestamp && (
        <time className={`${styles.timestamp} ${isOwn ? styles.timestampOwn : ''}`.trim()}>
          {timestamp}
        </time>
      )}
    </div>
  );
}
