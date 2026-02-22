import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, ChevronUp, Minus, X, PictureInPicture2 } from 'lucide-react';
import type { DmConversation } from '../../contexts/DmContext';
import { useDragResize } from '../../hooks/useDragResize';
import { UserIdentity } from '../chat/UserIdentity';
import { DmMessageList } from './DmMessageList';
import { DmInput } from './DmInput';
import styles from './DmPopover.module.css';

const DRAG_THRESHOLD = 4;

interface DmPopoverProps {
  conversation: DmConversation;
  currentDid: string;
  initialPos?: { x: number; y: number } | null;
  onClose: () => void;
  onToggleMinimize: () => void;
  onSend: (text: string, facets?: unknown[]) => void;
  onSendWithEmbed: (text: string, embed: Record<string, unknown>) => void;
  onTyping: () => void;
  onVideoCall: () => void;
  /** Retry a failed peer connection. */
  onRetry?: () => void;
  /** Show a "pop out" button (Document PiP). */
  onPopOut?: () => void;
  /** Render in PiP mode (no drag/resize, fills window). */
  isPiP?: boolean;
}

export function DmPopover({
  conversation,
  currentDid,
  initialPos,
  onClose,
  onToggleMinimize,
  onSend,
  onSendWithEmbed,
  onTyping,
  onVideoCall,
  onRetry,
  onPopOut,
  isPiP,
}: DmPopoverProps) {
  const { t } = useTranslation('dm');
  const { recipientDid, messages, minimized, typing, unreadCount, peerState, closingIn } =
    conversation;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const expanded = !minimized;
  const {
    containerRef,
    posStyle,
    sizeStyle,
    onDragStart,
    onPointerMove,
    onPointerUp,
    onResizeStart,
    reset,
  } = useDragResize({
    initialPos,
    minWidth: 240,
    minHeight: 180,
    enabled: expanded && !isPiP,
  });

  // Reset position/size when minimized
  useEffect(() => {
    if (minimized) {
      reset();
    }
  }, [minimized, reset]);

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

  // Drag/click disambiguation: track pointer movement on header
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    // Let button clicks through
    if ((e.target as HTMLElement).closest('button')) return;

    if (expanded) {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      didDrag.current = false;
      onDragStart(e);
    }
  };

  const handleHeaderPointerUp = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (dragStartPos.current) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const moved = Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;
      dragStartPos.current = null;

      // If we didn't drag, treat as a click to toggle minimize
      if (!moved) {
        onToggleMinimize();
      }
    } else if (minimized) {
      // When minimized, header click always toggles
      onToggleMinimize();
    }
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleMinimize();
    }
  };

  const displayUnread = unreadCount > 99 ? t('popover.unreadOverflow') : String(unreadCount);

  return (
    <div
      ref={containerRef}
      className={`${styles.popover} ${minimized ? styles.minimized : ''} ${isPiP ? styles.pipMode : ''}`}
      style={isPiP ? undefined : { ...posStyle, ...sizeStyle }}
      role="log"
      aria-label={t('popover.ariaLabel', { recipientDid })}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Resize handles — only when expanded and not in PiP */}
      {expanded && !isPiP && (
        <>
          <div
            className={`${styles.resizeHandle} ${styles.resizeN}`}
            onPointerDown={(e) => {
              onResizeStart('n', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeS}`}
            onPointerDown={(e) => {
              onResizeStart('s', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeE}`}
            onPointerDown={(e) => {
              onResizeStart('e', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeW}`}
            onPointerDown={(e) => {
              onResizeStart('w', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeNE}`}
            onPointerDown={(e) => {
              onResizeStart('ne', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeNW}`}
            onPointerDown={(e) => {
              onResizeStart('nw', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeSE}`}
            onPointerDown={(e) => {
              onResizeStart('se', e);
            }}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeSW}`}
            onPointerDown={(e) => {
              onResizeStart('sw', e);
            }}
          />
        </>
      )}

      <div
        className={styles.header}
        onPointerDown={handleHeaderPointerDown}
        onPointerUp={handleHeaderPointerUp}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={
          minimized
            ? t('popover.header.ariaLabel.expand', { recipientDid })
            : t('popover.header.ariaLabel.minimize', { recipientDid })
        }
        onKeyDown={handleHeaderKeyDown}
      >
        <span className={styles.headerIdentity}>
          <UserIdentity did={recipientDid} showAvatar size="sm" />
        </span>
        {minimized && unreadCount > 0 && (
          <span
            className={styles.unreadBadge}
            aria-label={t('popover.unreadAriaLabel', { count: unreadCount })}
          >
            {displayUnread}
          </span>
        )}
        {peerState === 'connecting' && (
          <span className={styles.connectionState}>{t('popover.connecting')}</span>
        )}
        {peerState === 'failed' && (
          <span className={styles.connectionFailed}>
            {t('popover.connectionFailed')}
            {onRetry && (
              <>
                {' · '}
                <button
                  className={styles.retryBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('popover.retry')}
                </button>
              </>
            )}
          </span>
        )}
        {peerState === 'closed' && closingIn !== null && (
          <span className={styles.connectionFailed}>
            {t('popover.closingCountdown', { seconds: closingIn })}
          </span>
        )}
        {peerState === 'closed' && closingIn === null && (
          <span className={styles.connectionFailed}>{t('popover.peerClosed')}</span>
        )}
        <div className={styles.headerActions}>
          {onPopOut && (
            <button
              className={styles.headerBtn}
              onClick={(e) => {
                e.stopPropagation();
                onPopOut();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              title="Pop out"
              aria-label="Pop out conversation to picture-in-picture"
            >
              <PictureInPicture2 size={14} />
            </button>
          )}
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onVideoCall();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            title={'Start video call'}
            aria-label={'Start video call'}
          >
            <Video size={14} />
          </button>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            title={
              minimized ? t('popover.minimize.titleExpand') : t('popover.minimize.titleMinimize')
            }
            aria-label={
              minimized
                ? t('popover.minimize.ariaLabel.expand')
                : t('popover.minimize.ariaLabel.minimize')
            }
          >
            {minimized ? <ChevronUp size={14} /> : <Minus size={14} />}
          </button>
          <button
            className={styles.headerBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            title={t('popover.close.title')}
            aria-label={t('popover.close.ariaLabel')}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {/* L4/M3: Use CSS class instead of unmounting to preserve draft text and scroll */}
      <div className={minimized ? `${styles.body} ${styles.bodyHidden}` : styles.body}>
        <DmMessageList messages={messages} currentDid={currentDid} typing={typing} />
        <DmInput
          onSend={onSend}
          onSendWithEmbed={onSendWithEmbed}
          onTyping={onTyping}
          ref={inputRef}
        />
      </div>
    </div>
  );
}
