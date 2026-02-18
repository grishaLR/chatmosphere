import { useCallback, useEffect, useRef, useState } from 'react';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { UserIdentity } from '../chat/UserIdentity';
import styles from './VideoCallOverlay.module.css';

export function VideoCallOverlay() {
  const { activeCall, acceptCall, rejectCall, hangUp } = useVideoCall();

  // Position: top-left corner of the container (null = use CSS default)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // Drag state (refs to avoid re-renders during drag)
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const resizing = useRef<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset position/size when call ends and restarts
  const prevCallId = useRef<string | null>(null);
  if (activeCall?.conversationId !== prevCallId.current) {
    prevCallId.current = activeCall?.conversationId ?? null;
    if (activeCall && !prevCallId.current) {
      setPos(null);
      setSize(null);
    }
  }

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

  // --- Drag handlers ---
  const onDragStart = useCallback((e: React.PointerEvent) => {
    // Only left mouse / primary touch
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragging.current = true;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging.current) {
      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 40));
      setPos({ x, y });
      return;
    }
    if (resizing.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const edge = resizing.current;

      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newLeft = resizeStart.current.left;
      let newTop = resizeStart.current.top;

      if (edge.includes('e')) newW = Math.max(240, resizeStart.current.w + dx);
      if (edge.includes('w')) {
        newW = Math.max(240, resizeStart.current.w - dx);
        newLeft = resizeStart.current.left + (resizeStart.current.w - newW);
      }
      if (edge.includes('s')) newH = Math.max(180, resizeStart.current.h + dy);
      if (edge.includes('n')) {
        newH = Math.max(180, resizeStart.current.h - dy);
        newTop = resizeStart.current.top + (resizeStart.current.h - newH);
      }

      setSize({ w: newW, h: newH });
      setPos({ x: newLeft, y: newTop });
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragging.current) {
      dragging.current = false;
      containerRef.current?.releasePointerCapture(e.pointerId);
    }
    if (resizing.current) {
      resizing.current = null;
      containerRef.current?.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onResizeStart = useCallback((edge: string, e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    resizing.current = edge;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
      left: rect.left,
      top: rect.top,
    };
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Clamp position if window resizes
  useEffect(() => {
    const onResize = () => {
      setPos((prev) => {
        if (!prev) return prev;
        return {
          x: Math.min(prev.x, window.innerWidth - 100),
          y: Math.min(prev.y, window.innerHeight - 40),
        };
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (!activeCall) return null;

  // Incoming call — top-center banner
  if (activeCall.status === 'incoming') {
    return (
      <div className={styles.incomingBanner} role="alert" aria-label="Incoming video call">
        <span className={styles.bannerIdentity}>
          <UserIdentity did={activeCall.recipientDid} showAvatar size="sm" />
        </span>
        <span className={styles.bannerLabel}>Incoming call...</span>
        <div className={styles.bannerActions}>
          <button
            className={styles.acceptBtn}
            onClick={() => {
              void acceptCall();
            }}
            title="Accept call"
            aria-label="Accept incoming call"
          >
            {'\uD83D\uDFE2'}
          </button>
          <button
            className={styles.rejectBtn}
            onClick={rejectCall}
            title="Reject call"
            aria-label="Reject incoming call"
          >
            {'\uD83D\uDEAB'}
          </button>
        </div>
      </div>
    );
  }

  const posStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {};

  const sizeStyle: React.CSSProperties = size ? { width: size.w, height: size.h } : {};

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
          <span className={styles.headerStatus}>Calling...</span>
        )}
        <button
          className={styles.headerHangUp}
          onClick={hangUp}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          title="End call"
          aria-label="End call"
        >
          {'\u2715'}
        </button>
      </div>

      {activeCall.status === 'outgoing' && (
        <div className={styles.ringing}>
          <p>Ringing...</p>
        </div>
      )}

      {activeCall.status === 'active' && (
        <div className={styles.videosContainer}>
          <video
            className={styles.remoteVideo}
            aria-label="Remote video stream"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />
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
