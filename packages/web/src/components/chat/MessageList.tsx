import { useEffect, useRef, useCallback } from 'react';
import { MessageItem } from './MessageItem';
import { UserIdentity } from './UserIdentity';
import type { MessageView } from '../../types';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageView[];
  loading: boolean;
  typingUsers?: string[];
}

const SCROLL_THRESHOLD = 80;

export function MessageList({ messages, loading, typingUsers = [] }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const checkIsNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, typingUsers.length]);

  return (
    <div className={styles.container} ref={containerRef} onScroll={checkIsNearBottom}>
      {loading && <p className={styles.loading}>Loading messages...</p>}
      {!loading && messages.length === 0 && (
        <p className={styles.empty}>No messages yet. Start the conversation!</p>
      )}
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {typingUsers.length > 0 && (
        <div className={styles.typing} role="status" aria-live="polite">
          {typingUsers.length === 1 && typingUsers[0] ? (
            <>
              <UserIdentity did={typingUsers[0]} size="sm" /> is typing...
            </>
          ) : typingUsers.length === 2 && typingUsers[0] && typingUsers[1] ? (
            <>
              <UserIdentity did={typingUsers[0]} size="sm" /> and{' '}
              <UserIdentity did={typingUsers[1]} size="sm" /> are typing...
            </>
          ) : (
            <>{String(typingUsers.length)} people are typing...</>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
