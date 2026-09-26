import { useState, useRef, useEffect, useCallback } from 'react';

export interface UsePinchZoomPanOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  doubleTapZoom?: number;
  enableMouseDrag?: boolean;
  enableWheel?: boolean;
}

export interface UsePinchZoomPanReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  pan: { x: number; y: number };
  isPanning: boolean;
  isZoomed: boolean;
  scalePercent: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  hasDragged: () => boolean;
  transformStyle: React.CSSProperties;
}

export function usePinchZoomPan(options: UsePinchZoomPanOptions = {}): UsePinchZoomPanReturn {
  const {
    minScale = 1.0,
    maxScale = 4.0,
    initialScale = 1.0,
    doubleTapZoom = 2.2,
    enableMouseDrag = true,
    enableWheel = true,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Active transform state
  const [scale, setScale] = useState<number>(initialScale);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // Mutable refs to prevent stale closure inside event listeners
  const stateRef = useRef({
    scale: initialScale,
    pan: { x: 0, y: 0 },
    isInteracting: false,
    hasDragged: false,
  });
  stateRef.current.scale = scale;
  stateRef.current.pan = pan;

  // Touch tracking refs
  const touchStateRef = useRef<{
    startTouches: Array<{ clientX: number; clientY: number }>;
    startDistance: number;
    startMidpoint: { x: number; y: number };
    startScale: number;
    startPan: { x: number; y: number };
    lastTouchTime: number;
    lastTouchPos: { x: number; y: number };
    movedDistance: number;
  }>({
    startTouches: [],
    startDistance: 0,
    startMidpoint: { x: 0, y: 0 },
    startScale: 1,
    startPan: { x: 0, y: 0 },
    lastTouchTime: 0,
    lastTouchPos: { x: 0, y: 0 },
    movedDistance: 0,
  });

  // Clamp pan based on container dimensions and scale
  const clampPan = useCallback((newPan: { x: number; y: number }, targetScale: number) => {
    if (!containerRef.current) return newPan;
    const rect = containerRef.current.getBoundingClientRect();
    if (targetScale <= 1.01) {
      return { x: 0, y: 0 };
    }
    
    // Calculate maximum pan bounds with slight margin
    const maxPanX = (rect.width * (targetScale - 1)) / 2 + 20;
    const maxPanY = (rect.height * (targetScale - 1)) / 2 + 20;

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newPan.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newPan.y)),
    };
  }, []);

  // Programmatic Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prevScale) => {
      const nextScale = Math.min(maxScale, Number((prevScale + 0.4).toFixed(2)));
      stateRef.current.scale = nextScale;
      return nextScale;
    });
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setScale((prevScale) => {
      const nextScale = Math.max(minScale, Number((prevScale - 0.4).toFixed(2)));
      if (nextScale <= 1.05) {
        setPan({ x: 0, y: 0 });
        stateRef.current.pan = { x: 0, y: 0 };
        stateRef.current.scale = 1.0;
        return 1.0;
      }
      setPan((prevPan) => {
        const clamped = clampPan(prevPan, nextScale);
        stateRef.current.pan = clamped;
        return clamped;
      });
      stateRef.current.scale = nextScale;
      return nextScale;
    });
  }, [minScale, clampPan]);

  const resetZoom = useCallback(() => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    stateRef.current.scale = 1.0;
    stateRef.current.pan = { x: 0, y: 0 };
    setIsPanning(false);
  }, []);

  const hasDragged = useCallback(() => {
    return stateRef.current.hasDragged;
  }, []);

  // Setup Touch and Mouse listeners with non-passive options
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Helper to calculate distance between 2 points
    const getDistance = (t1: Touch, t2: Touch) => {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    };

    // Helper to calculate midpoint between 2 points
    const getMidpoint = (t1: Touch, t2: Touch) => {
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    };

    // TOUCH START
    const onTouchStart = (e: TouchEvent) => {
      const ts = touchStateRef.current;
      ts.movedDistance = 0;
      stateRef.current.hasDragged = false;

      if (e.touches.length === 2) {
        // Multi-touch pinch start
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        ts.startDistance = getDistance(t1, t2);
        ts.startMidpoint = getMidpoint(t1, t2);
        ts.startScale = stateRef.current.scale;
        ts.startPan = { ...stateRef.current.pan };
        stateRef.current.isInteracting = true;
        setIsPanning(true);
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        ts.startTouches = [{ clientX: t.clientX, clientY: t.clientY }];
        ts.startPan = { ...stateRef.current.pan };
        ts.startScale = stateRef.current.scale;
        stateRef.current.isInteracting = true;
      }
    };

    // TOUCH MOVE
    const onTouchMove = (e: TouchEvent) => {
      const ts = touchStateRef.current;

      if (e.touches.length === 2) {
        // Multi-touch pinch-to-zoom & two-finger pan
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = getDistance(t1, t2);
        const currentMid = getMidpoint(t1, t2);

        if (ts.startDistance > 0 && el) {
          const rect = el.getBoundingClientRect();
          const distRatio = currentDist / ts.startDistance;
          let newScale = Math.max(minScale * 0.85, Math.min(maxScale * 1.15, ts.startScale * distRatio));

          // Calculate pan delta considering zoom midpoint
          const midDeltaX = currentMid.x - ts.startMidpoint.x;
          const midDeltaY = currentMid.y - ts.startMidpoint.y;

          // Focal point offset relative to container center
          const containerCenterX = rect.left + rect.width / 2;
          const containerCenterY = rect.top + rect.height / 2;
          const focalX = ts.startMidpoint.x - containerCenterX;
          const focalY = ts.startMidpoint.y - containerCenterY;

          // Scale focal delta
          const scaleFactor = newScale / ts.startScale;
          const focalDeltaX = focalX * (1 - scaleFactor);
          const focalDeltaY = focalY * (1 - scaleFactor);

          const rawPan = {
            x: ts.startPan.x + midDeltaX + focalDeltaX,
            y: ts.startPan.y + midDeltaY + focalDeltaY,
          };

          const clamped = clampPan(rawPan, newScale);
          setScale(newScale);
          setPan(clamped);
          stateRef.current.scale = newScale;
          stateRef.current.pan = clamped;

          ts.movedDistance += Math.abs(currentDist - ts.startDistance);
          if (ts.movedDistance > 8) {
            stateRef.current.hasDragged = true;
          }
        }
      } else if (e.touches.length === 1 && stateRef.current.scale > 1.05) {
        // Single finger pan when zoomed in
        const t = e.touches[0];
        const start = ts.startTouches[0];
        if (start) {
          const dx = t.clientX - start.clientX;
          const dy = t.clientY - start.clientY;
          const dist = Math.hypot(dx, dy);

          if (dist > 6) {
            e.preventDefault(); // Prevent page scroll during intentional chart pan
            stateRef.current.hasDragged = true;
            setIsPanning(true);

            const rawPan = {
              x: ts.startPan.x + dx,
              y: ts.startPan.y + dy,
            };
            const clamped = clampPan(rawPan, stateRef.current.scale);
            setPan(clamped);
            stateRef.current.pan = clamped;
          }
        }
      }
    };

    // TOUCH END
    const onTouchEnd = (e: TouchEvent) => {
      const ts = touchStateRef.current;
      stateRef.current.isInteracting = false;
      setIsPanning(false);

      // Snap back if scaled below minScale or slightly above maxScale
      if (stateRef.current.scale < 1.05) {
        setScale(1.0);
        setPan({ x: 0, y: 0 });
        stateRef.current.scale = 1.0;
        stateRef.current.pan = { x: 0, y: 0 };
      } else if (stateRef.current.scale > maxScale) {
        setScale(maxScale);
        stateRef.current.scale = maxScale;
        const clamped = clampPan(stateRef.current.pan, maxScale);
        setPan(clamped);
        stateRef.current.pan = clamped;
      }

      // Check for Double-tap gesture on mobile
      if (e.touches.length === 0 && e.changedTouches.length === 1 && !stateRef.current.hasDragged) {
        const touch = e.changedTouches[0];
        const now = Date.now();
        const timeDiff = now - ts.lastTouchTime;
        const posDiff = Math.hypot(touch.clientX - ts.lastTouchPos.x, touch.clientY - ts.lastTouchPos.y);

        if (timeDiff < 320 && posDiff < 25) {
          // Double Tap Triggered!
          if (stateRef.current.scale > 1.2) {
            // Reset to default 1x
            resetZoom();
          } else {
            // Zoom in centered around tap point
            const rect = el.getBoundingClientRect();
            const tapX = touch.clientX - (rect.left + rect.width / 2);
            const tapY = touch.clientY - (rect.top + rect.height / 2);
            const targetScale = doubleTapZoom;
            const targetPan = clampPan(
              {
                x: -tapX * (targetScale - 1),
                y: -tapY * (targetScale - 1),
              },
              targetScale
            );

            setScale(targetScale);
            setPan(targetPan);
            stateRef.current.scale = targetScale;
            stateRef.current.pan = targetPan;
          }
          ts.lastTouchTime = 0;
          return;
        }

        ts.lastTouchTime = now;
        ts.lastTouchPos = { x: touch.clientX, y: touch.clientY };
      }
    };

    // MOUSE DRAG SUPPORT (WHEN ZOOMED)
    let isMouseDown = false;
    let mouseStartPos = { x: 0, y: 0 };
    let mouseStartPan = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (!enableMouseDrag || stateRef.current.scale <= 1.05) return;
      isMouseDown = true;
      stateRef.current.hasDragged = false;
      mouseStartPos = { x: e.clientX, y: e.clientY };
      mouseStartPan = { ...stateRef.current.pan };
      setIsPanning(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseStartPos.x;
      const dy = e.clientY - mouseStartPos.y;
      if (Math.hypot(dx, dy) > 5) {
        stateRef.current.hasDragged = true;
        const rawPan = {
          x: mouseStartPan.x + dx,
          y: mouseStartPan.y + dy,
        };
        const clamped = clampPan(rawPan, stateRef.current.scale);
        setPan(clamped);
        stateRef.current.pan = clamped;
      }
    };

    const onMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        setIsPanning(false);
      }
    };

    // WHEEL / TRACKPAD ZOOM SUPPORT
    const onWheel = (e: WheelEvent) => {
      if (!enableWheel) return;
      // Allow wheel zoom if ctrlKey is pressed (trackpad pinch) or when hovering with mouse
      if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.003;
        const targetScale = Math.max(minScale, Math.min(maxScale, Number((stateRef.current.scale + zoomDelta).toFixed(2))));

        if (targetScale <= 1.02) {
          setScale(1.0);
          setPan({ x: 0, y: 0 });
          stateRef.current.scale = 1.0;
          stateRef.current.pan = { x: 0, y: 0 };
          return;
        }

        const rect = el.getBoundingClientRect();
        const cursorX = e.clientX - (rect.left + rect.width / 2);
        const cursorY = e.clientY - (rect.top + rect.height / 2);

        const scaleRatio = targetScale / stateRef.current.scale;
        const rawPan = {
          x: cursorX - (cursorX - stateRef.current.pan.x) * scaleRatio,
          y: cursorY - (cursorY - stateRef.current.pan.y) * scaleRatio,
        };

        const clamped = clampPan(rawPan, targetScale);
        setScale(targetScale);
        setPan(clamped);
        stateRef.current.scale = targetScale;
        stateRef.current.pan = clamped;
      }
    };

    // Attach native DOM listeners with { passive: false } for smooth cancellation of page scrolling
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);

      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      el.removeEventListener('wheel', onWheel);
    };
  }, [minScale, maxScale, doubleTapZoom, enableMouseDrag, enableWheel, clampPan, resetZoom]);

  const transformStyle: React.CSSProperties = {
    transform: `translate3d(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
    transformOrigin: 'center center',
    willChange: 'transform',
    transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
    touchAction: scale > 1.05 ? 'none' : 'manipulation',
    cursor: scale > 1.05 ? (isPanning ? 'grabbing' : 'grab') : 'default',
  };

  return {
    containerRef,
    scale,
    pan,
    isPanning,
    isZoomed: scale > 1.05,
    scalePercent: Math.round(scale * 100),
    zoomIn,
    zoomOut,
    resetZoom,
    hasDragged,
    transformStyle,
  };
}
