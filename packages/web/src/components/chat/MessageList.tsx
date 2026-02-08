import { useEffect, useRef, useCallback } from 'react';
import { useVirtualList } from 'virtualized-ui';
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
  const isNearBottomRef = useRef(true);

  const {
    virtualItems,
    totalSize,
    containerRef,
    measureElement,
    handleScroll,
    scrollToIndex,
    data,
  } = useVirtualList({
    data: messages,
    getItemId: (msg) => msg.id,
    estimatedItemHeight: 40,
  });

  const onScroll = useCallback(() => {
    handleScroll();
    const el = containerRef.current;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  }, [handleScroll, containerRef]);

  useEffect(() => {
    if (isNearBottomRef.current && messages.length > 0) {
      scrollToIndex(messages.length - 1);
    }
  }, [messages.length, scrollToIndex]);

  return (
    <div className={styles.container} ref={containerRef} onScroll={onScroll}>
      {loading && <p className={styles.loading}>Loading messages...</p>}
      {!loading && messages.length === 0 && (
        <p className={styles.empty}>No messages yet. Start the conversation!</p>
      )}
      <div className={styles.spacer} style={{ height: totalSize }}>
        {virtualItems.map((vi) => (
          <div
            key={vi.key}
            ref={measureElement}
            data-index={vi.index}
            className={styles.virtualItem}
            style={{ transform: `translateY(${vi.start}px)` }}
          >
            <MessageItem message={data[vi.index] as MessageView} />
          </div>
        ))}
      </div>
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
    </div>
  );
}
