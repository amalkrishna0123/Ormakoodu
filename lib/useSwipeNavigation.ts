/**
 * useSwipeNavigation
 *
 * Attaches Pointer Events (which unify mouse, touch, and pen) to a given
 * element ref and calls onNext / onPrev when the user completes a horizontal
 * swipe gesture.
 *
 * Rules:
 *  – Minimum horizontal travel before the gesture is recognised (px).
 *  – Gesture is cancelled if vertical travel exceeds a threshold (prevents
 *    accidental month changes while the user is scrolling the page).
 *  – Only one navigation event fires per pointer-down/up cycle (guards
 *    against repeat firings).
 *  – Event listeners are cleaned up on unmount.
 */

import { useEffect, useRef } from 'react';

interface SwipeOptions {
  /** Minimum horizontal px before gesture counts (default 50) */
  minDistance?: number;
  /** Max vertical px allowed before gesture is cancelled (default 60) */
  maxVertical?: number;
  /** Whether the hook is currently enabled (default true) */
  enabled?: boolean;
}

export function useSwipeNavigation(
  ref: React.RefObject<HTMLElement | null>,
  onNext: () => void,
  onPrev: () => void,
  { minDistance = 50, maxVertical = 60, enabled = true }: SwipeOptions = {},
) {
  // Use a ref for gesture state so we never cause re-renders mid-gesture.
  const gesture = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    fired: boolean;
  } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    function onPointerDown(e: PointerEvent) {
      // Only track primary pointer (finger 0 or mouse left-button)
      if (!e.isPrimary) return;
      gesture.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        fired: false,
      };
      // Capture so we receive pointermove/pointerup even if the pointer leaves
      // the element (important for fast mouse swipes).
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!gesture.current || e.pointerId !== gesture.current.pointerId) return;
      const dx = e.clientX - gesture.current.startX;
      const dy = e.clientY - gesture.current.startY;

      // Cancel gesture if vertical movement is too large (user is scrolling)
      if (Math.abs(dy) > maxVertical) {
        gesture.current = null;
        return;
      }

      // Prevent page scroll only once we know this is a horizontal gesture
      if (Math.abs(dx) > 10) {
        e.preventDefault();
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!gesture.current || e.pointerId !== gesture.current.pointerId) return;
      if (gesture.current.fired) {
        gesture.current = null;
        return;
      }

      const dx = e.clientX - gesture.current.startX;
      const dy = e.clientY - gesture.current.startY;

      // Guard: gesture must still be more horizontal than vertical
      if (Math.abs(dy) <= maxVertical && Math.abs(dx) >= minDistance) {
        gesture.current.fired = true;
        if (dx < 0) {
          onNext(); // swipe left → next month
        } else {
          onPrev(); // swipe right → prev month
        }
      }

      gesture.current = null;
    }

    function onPointerCancel(e: PointerEvent) {
      if (gesture.current && e.pointerId === gesture.current.pointerId) {
        gesture.current = null;
      }
    }

    // `touch-action: pan-y` is set via CSS so the browser handles vertical
    // scrolling natively; we only intercept horizontal swipes.
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove, { passive: false });
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [ref, onNext, onPrev, minDistance, maxVertical, enabled]);
}

