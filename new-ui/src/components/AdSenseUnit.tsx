import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, pushAdSense } from '../adsenseConfig';

type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

interface AdSenseUnitProps {
  slot: string;
  format?: AdFormat;
  className?: string;
  minHeight?: number;
}

export function AdSenseUnit({
  slot,
  format = 'auto',
  className = '',
  minHeight = 90,
}: AdSenseUnitProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (!slot || loaded.current) return;
    loaded.current = true;
    pushAdSense();
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={className} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
