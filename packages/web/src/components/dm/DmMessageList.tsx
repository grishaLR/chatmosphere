import { useEffect, useRef, useCallback } from 'react';
import type { DmMessageView } from '../../types';
import { RichText } from '../chat/RichText';
import styles from './DmMessageList.module.css';

interface DmMessageListProps {
  messages: DmMessageView[];
  currentDid: string;
  typing: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const SCROLL_THRESHOLD = 60;

export function DmMessageList({ messages, currentDid, typing }: DmMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const checkIsNearBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  }, []);

  // M2: Only auto-scroll when user is near the bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, typing]);

  if (messages.length === 0 && !typing) {
    return (
      <div className={styles.empty} role="status">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className={styles.messageList} ref={listRef} onScroll={checkIsNearBottom}>
      {messages.map((msg) => {
        const isOwn = msg.senderDid === currentDid;
        return (
          <div
            key={msg.id}
            className={`${styles.message} ${isOwn ? styles.own : styles.other} ${msg.pending ? styles.pending : ''}`}
          >
            <div className={styles.bubble}>
              <RichText text={msg.text} />
            </div>
            <span className={styles.time}>{formatTime(msg.createdAt)}</span>
          </div>
        );
      })}
      {typing && (
        <div className={styles.typingIndicator} role="status" aria-live="polite">
          typing...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
