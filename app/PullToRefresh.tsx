'use client';

import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 110;

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [armed, setArmed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const direction = useRef<'none' | 'vertical' | 'horizontal'>('none');
  const pullRef = useRef(0);
  const vibrated = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (refreshing) return;
      direction.current = 'none';
      if (window.scrollY > 0) { startY.current = null; pulling.current = false; return; }
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
      vibrated.current = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || startY.current === null || startX.current === null || refreshing) return;
      const deltaY = e.touches[0].clientY - startY.current;
      const deltaX = e.touches[0].clientX - startX.current;

      if (direction.current === 'none') {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
        direction.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
        if (direction.current === 'horizontal') { pulling.current = false; return; }
      }
      if (direction.current === 'horizontal') return;

      if (deltaY <= 0) { pullRef.current = 0; setPull(0); setArmed(false); return; }
      if (window.scrollY > 0) { pulling.current = false; pullRef.current = 0; setPull(0); setArmed(false); return; }
      if (e.cancelable) e.preventDefault();
      const next = Math.min(deltaY * 0.5, MAX_PULL);
      pullRef.current = next;
      setPull(next);
      const crossed = next >= THRESHOLD;
      setArmed(crossed);
      if (crossed && !vibrated.current) {
        vibrated.current = true;
        navigator.vibrate?.(15);
      } else if (!crossed) {
        vibrated.current = false;
      }
    }

    function onTouchEnd() {
      if (!pulling.current || refreshing) { startX.current = null; startY.current = null; return; }
      pulling.current = false;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        navigator.vibrate?.(20);
        window.dispatchEvent(new CustomEvent('app:refresh'));
        setTimeout(() => {
          setRefreshing(false);
          setPull(0);
          setArmed(false);
        }, 700);
      } else {
        setPull(0);
        setArmed(false);
      }
      startX.current = null;
      startY.current = null;
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [refreshing]);

  return (
    <div ref={wrapRef}>
      <div
        style={{
          height: pull,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          overflow: 'hidden',
          transition: refreshing ? 'none' : 'height .15s ease-out',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            borderRadius: '50%',
            border: '2.5px solid rgba(201,168,76,.25)',
            borderTopColor: '#c9a84c',
            transform: !refreshing ? `rotate(${Math.min(pull / THRESHOLD, 1) * 360}deg)` : 'none',
            animation: refreshing ? 'ptr-spin .7s linear infinite' : 'none',
            opacity: pull > 4 ? 1 : 0,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#c9a84c', opacity: pull > 4 ? 1 : 0, fontFamily: "'Outfit',sans-serif" }}>
          {refreshing ? 'Actualizando…' : armed ? 'Suelta para actualizar' : 'Estira para actualizar'}
        </span>
      </div>
      <style>{`@keyframes ptr-spin { to { transform: rotate(360deg); } }`}</style>
      {children}
    </div>
  );
}
