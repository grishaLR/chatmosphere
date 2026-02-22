import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDm } from '../../contexts/DmContext';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentPiP, documentPiPSupported } from '../../hooks/useDocumentPiP';
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
    retryConnection,
    dismissNotification,
    openFromNotification,
  } = useDm();
  const { videoCall } = useVideoCall();
  const { did } = useAuth();
  const windowSize = useWindowSize();
  const { pipWindow, open: openPiP, close: closePiP } = useDocumentPiP();
  const [pipConvoId, setPipConvoId] = useState<string | null>(null);

  const handlePopOut = useCallback(
    async (conversationId: string) => {
      const pip = await openPiP({ width: 320, height: 420 });
      if (pip) setPipConvoId(conversationId);
    },
    [openPiP],
  );

  // Clear pipConvoId when PiP window closes
  useEffect(() => {
    if (!pipWindow) setPipConvoId(null);
  }, [pipWindow]);

  // Close PiP when the conversation it's showing gets closed
  useEffect(() => {
    if (pipConvoId && !conversations.some((c) => c.conversationId === pipConvoId)) {
      closePiP();
    }
  }, [conversations, pipConvoId, closePiP]);

  // Only calculate positions for in-page conversations
  const inPageConvos = useMemo(
    () => conversations.filter((c) => c.conversationId !== pipConvoId),
    [conversations, pipConvoId],
  );

  const pipConvo = pipConvoId ? conversations.find((c) => c.conversationId === pipConvoId) : null;

  // Calculate staggered initial positions from bottom-right
  const positions = useMemo(() => {
    const vw = windowSize.width;
    const vh = windowSize.height;
    return inPageConvos.map((_, i) => ({
      x: vw - PANEL_WIDTH - RIGHT_MARGIN - i * (PANEL_WIDTH + GAP),
      y: vh - POPOVER_HEIGHT,
    }));
  }, [inPageConvos.length, windowSize.width, windowSize.height]);

  if (!did) return null;

  // In Tauri mode, DMs open as separate OS windows — skip popover rendering
  if (IS_TAURI) return null;

  return (
    <div className={styles.container}>
      {inPageConvos.map((convo, i) => (
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
          onRetry={() => {
            retryConnection(convo.conversationId);
          }}
          onVideoCall={() => {
            videoCall(convo.recipientDid);
          }}
          onPopOut={
            documentPiPSupported
              ? () => {
                  void handlePopOut(convo.conversationId);
                }
              : undefined
          }
        />
      ))}
      {pipWindow &&
        pipConvo &&
        createPortal(
          <DmPopover
            key={pipConvo.conversationId}
            conversation={pipConvo}
            currentDid={did}
            isPiP
            onClose={() => {
              closePiP();
              closeDm(pipConvo.conversationId);
            }}
            onToggleMinimize={() => {
              toggleMinimize(pipConvo.conversationId);
            }}
            onSend={(text, facets) => {
              sendDm(pipConvo.conversationId, text, facets);
            }}
            onSendWithEmbed={(text, embed) => {
              sendDm(pipConvo.conversationId, text, undefined, embed);
            }}
            onTyping={() => {
              sendTyping(pipConvo.conversationId);
            }}
            onRetry={() => {
              retryConnection(pipConvo.conversationId);
            }}
            onVideoCall={() => {
              videoCall(pipConvo.recipientDid);
            }}
          />,
          pipWindow.document.body,
        )}
      <div aria-live="polite" aria-label={t('popoverContainer.ariaLabel')}>
        {notifications.map((n) => (
          <DmNotificationBadge
            key={n.conversationId}
            notification={n}
            onOpen={() => {
              openFromNotification(n);
            }}
            onDismiss={() => {
              dismissNotification(n.conversationId, true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
