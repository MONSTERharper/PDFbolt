import React, { useEffect, useRef } from 'react';
import {
  ADSENSE_CLIENT,
  ADSENSE_TEST_MODE,
  loadAdSenseScript,
  pushAdSense,
} from '../adsenseConfig';

type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

interface AdSenseUnitProps {
  slot: string;
  client?: string;
  format?: AdFormat;
  className?: string;
  minHeight?: number;
  /** Called when no ad fills the slot within the wait period. */
  onUnfilled?: () => void;
  unfilledAfterMs?: number;
}

function isAdFilled(container: HTMLElement | null): boolean {
  if (!container) return false;
  const ins = container.querySelector('ins.adsbygoogle');
  if (!ins) return false;
  if (ins.querySelector('iframe')) return true;
  return (ins.getBoundingClientRect().height ?? 0) > 48;
}

export function AdSenseUnit({
  slot,
  client = ADSENSE_CLIENT,
  format = 'auto',
  className = '',
  minHeight = 90,
  onUnfilled,
  unfilledAfterMs = 5000,
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!slot) return;

    let cancelled = false;
    let unfilledTimer: number | undefined;

    void loadAdSenseScript(client)
      .then(() => {
        if (cancelled || pushedRef.current) return;
        pushedRef.current = true;
        pushAdSense();
      })
      .catch(() => {
        onUnfilled?.();
      });

    unfilledTimer = window.setTimeout(() => {
      if (!cancelled && !isAdFilled(containerRef.current)) {
        onUnfilled?.();
      }
    }, unfilledAfterMs);

    return () => {
      cancelled = true;
      if (unfilledTimer !== undefined) {
        window.clearTimeout(unfilledTimer);
      }
    };
  }, [slot, client, onUnfilled, unfilledAfterMs]);

  if (!slot) return null;

  return (
    <div ref={containerRef} className={className} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-adtest={ADSENSE_TEST_MODE ? 'on' : undefined}
        data-full-width-responsive={format === 'auto' || format === 'horizontal' ? 'true' : undefined}
      />
    </div>
  );
}
