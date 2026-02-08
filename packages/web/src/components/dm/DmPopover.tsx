import { useEffect, useRef } from 'react';
import type { DmConversation } from '../../contexts/DmContext';
import { UserIdentity } from '../chat/UserIdentity';
import { DmMessageList } from './DmMessageList';
import { DmInput } from './DmInput';
import styles from './DmPopover.module.css';

interface DmPopoverProps {
  conversation: DmConversation;
  currentDid: string;
  onClose: () => void;
  onToggleMinimize: () => void;
  onSend: (text: string) => void;
  onTyping: () => void;
  onTogglePersist: (persist: boolean) => void;
}

export function DmPopover({
  conversation,
  currentDid,
  onClose,
  onToggleMinimize,
  onSend,
  onTyping,
  onTogglePersist,
}: DmPopoverProps) {
  const { recipientDid, messages, persist, minimized, typing, unreadCount } = conversation;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // H7: Focus the input when popover expands
  useEffect(() => {
    if (!minimized) {
      // Slight delay to let DOM paint
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [minimized]);

  const displayUnread = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <div
      className={`${styles.popover} ${minimized ? styles.minimized : ''}`}
      role="log"
      aria-label={`DM conversation with ${recipientDid}`}
    >
      <div
        className={styles.header}
        onClick={onToggleMinimize}
        role="button"
        tabIndex={0}
        aria-expanded={!minimized}
        aria-label={`DM with ${recipientDid} — ${minimized ? 'click to expand' : 'click to minimize'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleMinimize();
          }
        }}
      >
        <span className={styles.headerIdentity}>
          <UserIdentity did={recipientDid} showAvatar size="sm" />
        </span>
        {minimized && unreadCount > 0 && (
          <span
            className={styles.unreadBadge}
            aria-label={`${String(unreadCount)} unread messages`}
          >
            {displayUnread}
          </span>
        )}
        <div className={styles.headerActions}>
          <button
            className={`${styles.persistBtn} ${persist ? styles.persistActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePersist(!persist);
            }}
            title={persist ? 'Messages saved (7 days)' : 'Messages ephemeral — click to save'}
            aria-label={persist ? 'Disable message saving' : 'Enable message saving'}
            aria-pressed={persist}
          >
            {persist ? '\uD83D\uDCBE' : '\u2601\uFE0F'}
          </button>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            title={minimized ? 'Expand' : 'Minimize'}
            aria-label={minimized ? 'Expand conversation' : 'Minimize conversation'}
          >
            {minimized ? '\u25B2' : '\u2013'}
          </button>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
            aria-label="Close conversation"
          >
            {'\u2715'}
          </button>
        </div>
      </div>

      {/* L4/M3: Use CSS visibility instead of unmounting to preserve draft text and scroll */}
      <div className={styles.body} style={{ display: minimized ? 'none' : undefined }}>
        <DmMessageList messages={messages} currentDid={currentDid} typing={typing} />
        <DmInput onSend={onSend} onTyping={onTyping} ref={inputRef} />
      </div>
    </div>
  );
}
