import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseDragResizeOptions {
  initialPos?: { x: number; y: number } | null;
  minWidth?: number;
  minHeight?: number;
  enabled?: boolean;
}

export interface UseDragResizeReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pos: { x: number; y: number } | null;
  size: { w: number; h: number } | null;
  posStyle: React.CSSProperties;
  sizeStyle: React.CSSProperties;
  onDragStart: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onResizeStart: (edge: string, e: React.PointerEvent) => void;
  reset: () => void;
}

export function useDragResize(options: UseDragResizeOptions = {}): UseDragResizeReturn {
  const { initialPos = null, minWidth = 240, minHeight = 180, enabled = true } = options;

  const [pos, setPos] = useState<{ x: number; y: number } | null>(initialPos);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pos when initialPos changes (e.g. window resize recalculates stagger)
  useEffect(() => {
    if (initialPos && !dragging.current && !resizing.current) {
      setPos((prev) => {
        // Only update if we're still at the initial position (not user-dragged)
        if (!prev || (prev.x === initialPos.x && prev.y === initialPos.y)) return initialPos;
        return prev;
      });
    }
  }, [initialPos?.x, initialPos?.y]);

  const reset = useCallback(() => {
    setPos(initialPos);
    setSize(null);
  }, [initialPos]);

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      dragging.current = true;
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (dragging.current) {
        const el = containerRef.current;
        const elW = el?.offsetWidth ?? minWidth;
        const elH = el?.offsetHeight ?? minHeight;
        const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - elW));
        const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - elH));
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

        if (edge.includes('e')) newW = Math.max(minWidth, resizeStart.current.w + dx);
        if (edge.includes('w')) {
          newW = Math.max(minWidth, resizeStart.current.w - dx);
          newLeft = resizeStart.current.left + (resizeStart.current.w - newW);
        }
        if (edge.includes('s')) newH = Math.max(minHeight, resizeStart.current.h + dy);
        if (edge.includes('n')) {
          newH = Math.max(minHeight, resizeStart.current.h - dy);
          newTop = resizeStart.current.top + (resizeStart.current.h - newH);
        }

        setSize({ w: newW, h: newH });
        setPos({ x: newLeft, y: newTop });
      }
    },
    [enabled, minWidth, minHeight],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (dragging.current) {
        dragging.current = false;
        containerRef.current?.releasePointerCapture(e.pointerId);
      }
      if (resizing.current) {
        resizing.current = null;
        containerRef.current?.releasePointerCapture(e.pointerId);
      }
    },
    [enabled],
  );

  const onResizeStart = useCallback(
    (edge: string, e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) return;
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
    },
    [enabled],
  );

  // Clamp position if window resizes
  useEffect(() => {
    const onResize = () => {
      setPos((prev) => {
        if (!prev) return prev;
        const el = containerRef.current;
        const elW = el?.offsetWidth ?? minWidth;
        const elH = el?.offsetHeight ?? minHeight;
        return {
          x: Math.max(0, Math.min(prev.x, window.innerWidth - elW)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - elH)),
        };
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [minWidth, minHeight]);

  const posStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {};

  const sizeStyle: React.CSSProperties = size ? { width: size.w, height: size.h } : {};

  return {
    containerRef,
    pos,
    size,
    posStyle,
    sizeStyle,
    onDragStart,
    onPointerMove,
    onPointerUp,
    onResizeStart,
    reset,
  };
}
