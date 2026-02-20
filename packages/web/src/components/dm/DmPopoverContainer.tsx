import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDm } from '../../contexts/DmContext';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useAuth } from '../../hooks/useAuth';
import { useWindowSize } from '../../hooks/useWindowSize';
import { IS_TAURI } from '../../lib/config';
import { DmPopover } from './DmPopover';
import { DmNotificationBadge } from './DmNotificationBadge';
import styles from './DmPopoverContainer.module.css';

/** Pixel constants matching CSS custom properties */
const PANEL_WIDTH = 320;
const POPOVER_HEIGHT = 400;
const GAP = 8;
const RIGHT_MARGIN = 32; // --cm-space-8

export function DmPopoverContainer() {
  const { t } = useTranslation('dm');
  const {
    conversations,
    notifications,
    closeDm,
    toggleMinimize,
    sendDm,
    sendTyping,
    dismissNotification,
    openFromNotification,
  } = useDm();
  const { videoCall } = useVideoCall();
  const { did } = useAuth();
  const windowSize = useWindowSize();

  // Calculate staggered initial positions from bottom-right
  const positions = useMemo(() => {
    const vw = windowSize.width;
    const vh = windowSize.height;
    return conversations.map((_, i) => ({
      x: vw - PANEL_WIDTH - RIGHT_MARGIN - i * (PANEL_WIDTH + GAP),
      y: vh - POPOVER_HEIGHT,
    }));
  }, [conversations.length, windowSize.width, windowSize.height]);

  if (!did) return null;

  // In Tauri mode, DMs open as separate OS windows — skip popover rendering
  if (IS_TAURI) return null;

  return (
    <div className={styles.container}>
      {conversations.map((convo, i) => (
        <DmPopover
          key={convo.conversationId}
          conversation={convo}
          currentDid={did}
          initialPos={positions[i]}
          onClose={() => {
            closeDm(convo.conversationId);
          }}
          onToggleMinimize={() => {
            toggleMinimize(convo.conversationId);
          }}
          onSend={(text, facets) => {
            sendDm(convo.conversationId, text, facets);
          }}
          onSendWithEmbed={(text, embed) => {
            sendDm(convo.conversationId, text, undefined, embed);
          }}
          onTyping={() => {
            sendTyping(convo.conversationId);
          }}
          onVideoCall={() => {
            videoCall(convo.recipientDid);
          }}
        />
      ))}
      <div aria-live="polite" aria-label={t('popoverContainer.ariaLabel')}>
        {notifications.map((n) => (
          <DmNotificationBadge
            key={n.conversationId}
            notification={n}
            onOpen={() => {
              openFromNotification(n);
            }}
            onDismiss={() => {
              dismissNotification(n.conversationId);
            }}
          />
        ))}
      </div>
    </div>
  );
}
