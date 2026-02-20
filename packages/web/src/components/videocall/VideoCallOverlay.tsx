import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, PhoneOff, MicOff, Mic, MonitorUp, SwitchCamera, X } from 'lucide-react';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useDragResize } from '../../hooks/useDragResize';
import { UserIdentity } from '../chat/UserIdentity';
import styles from './VideoCallOverlay.module.css';

export function VideoCallOverlay() {
  const { t } = useTranslation('chat');
  const {
    activeCall,
    callError,
    isMuted,
    isScreenSharing,
    acceptCall,
    rejectCall,
    hangUp,
    toggleMute,
    flipCamera,
    startScreenShare,
    stopScreenShare,
  } = useVideoCall();

  const {
    containerRef,
    posStyle,
    sizeStyle,
    onDragStart,
    onPointerMove,
    onPointerUp,
    onResizeStart,
    reset,
  } = useDragResize({ minWidth: 240, minHeight: 180 });

  // Reset position/size when a new call starts
  useEffect(() => {
    if (activeCall) {
      reset();
    }
  }, [activeCall?.conversationId]);

  const localVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && activeCall?.localStream) {
        el.srcObject = activeCall.localStream;
        el.play().catch(() => {});
      }
    },
    [activeCall?.localStream],
  );

  const remoteVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && activeCall?.remoteStream) {
        el.srcObject = activeCall.remoteStream;
        el.play().catch(() => {});
      }
    },
    [activeCall?.remoteStream],
  );

  // Show error banner even without an active call (e.g. getUserMedia denied)
  if (!activeCall) {
    if (callError) {
      return (
        <div className={styles.errorBanner} role="alert">
          {t(callError, { defaultValue: callError })}
        </div>
      );
    }
    return null;
  }

  // Incoming call — top-center banner
  if (activeCall.status === 'incoming') {
    return (
      <div
        className={styles.incomingBanner}
        role="alert"
        aria-label={t('videoCall.incoming.ariaLabel')}
      >
        <span className={styles.bannerIdentity}>
          <UserIdentity did={activeCall.recipientDid} showAvatar size="sm" />
        </span>
        <span className={styles.bannerLabel}>{t('videoCall.incoming.label')}</span>
        <div className={styles.bannerActions}>
          <button
            className={styles.acceptBtn}
            onClick={() => {
              void acceptCall();
            }}
            title={t('videoCall.incoming.accept')}
            aria-label={t('videoCall.incoming.acceptAriaLabel')}
          >
            <Phone size={16} />
          </button>
          <button
            className={styles.rejectBtn}
            onClick={rejectCall}
            title={t('videoCall.incoming.reject')}
            aria-label={t('videoCall.incoming.rejectAriaLabel')}
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Outgoing (ringing) or active call — draggable, resizable floating panel
  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ ...posStyle, ...sizeStyle }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Resize handles — 8 edges/corners */}
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

      <div
        className={styles.header}
        onPointerDown={onDragStart}
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <span className={styles.headerIdentity}>
          <UserIdentity did={activeCall.recipientDid} showAvatar size="sm" />
        </span>
        {activeCall.status === 'outgoing' && (
          <span className={styles.headerStatus}>{t('videoCall.calling')}</span>
        )}
        {activeCall.status === 'reconnecting' && (
          <span className={styles.headerStatus}>{t('videoCall.reconnecting')}</span>
        )}
        <button
          className={styles.headerHangUp}
          onClick={hangUp}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          title={t('videoCall.endCall')}
          aria-label={t('videoCall.endCall')}
        >
          <X size={16} />
        </button>
      </div>

      {(activeCall.status === 'active' || activeCall.status === 'reconnecting') && (
        <div className={styles.controlBar}>
          <button
            className={`${styles.controlBtn} ${isMuted ? styles.controlBtnActive : ''}`}
            onClick={toggleMute}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            aria-pressed={isMuted}
            title={isMuted ? t('videoCall.unmute') : t('videoCall.mute')}
            aria-label={isMuted ? t('videoCall.unmute') : t('videoCall.mute')}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          {'getDisplayMedia' in navigator.mediaDevices && (
            <button
              className={`${styles.controlBtn} ${isScreenSharing ? styles.controlBtnActive : ''}`}
              onClick={() => {
                void (isScreenSharing ? stopScreenShare() : startScreenShare());
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              aria-pressed={isScreenSharing}
              title={isScreenSharing ? t('videoCall.stopSharing') : t('videoCall.shareScreen')}
              aria-label={isScreenSharing ? t('videoCall.stopSharing') : t('videoCall.shareScreen')}
            >
              <MonitorUp size={16} />
            </button>
          )}
          <button
            className={`${styles.controlBtn} ${styles.flipBtn}`}
            onClick={() => {
              void flipCamera();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            title={t('videoCall.flipCamera')}
            aria-label={t('videoCall.flipCamera')}
          >
            <SwitchCamera size={16} />
          </button>
        </div>
      )}

      {activeCall.status === 'outgoing' && (
        <div className={styles.ringing}>
          <p>{t('videoCall.ringing')}</p>
        </div>
      )}

      {(activeCall.status === 'active' || activeCall.status === 'reconnecting') && (
        <div className={styles.videosContainer}>
          <video
            className={styles.remoteVideo}
            aria-label="Remote video stream"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />
          {activeCall.status === 'reconnecting' && (
            <div className={styles.reconnectingOverlay}>{t('videoCall.reconnecting')}</div>
          )}
          <video
            className={styles.localVideo}
            aria-label="Local video stream"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
          />
        </div>
      )}
    </div>
  );
}
