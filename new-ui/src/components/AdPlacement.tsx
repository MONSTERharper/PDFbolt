import React, { useState } from 'react';
import { X, Info, ShieldAlert } from 'lucide-react';
import { AdSenseUnit } from './AdSenseUnit';
import {
  shouldShowLiveAd,
  slotForResolvedConfig,
  useAdsenseConfig,
} from '../useAdsenseConfig';

function AdChrome({
  label,
  className,
  dismissible = true,
  onDismiss,
  showInfo,
  onToggleInfo,
  children,
}: {
  label: string;
  className?: string;
  dismissible?: boolean;
  onDismiss: () => void;
  showInfo: boolean;
  onToggleInfo: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`w-full ${className ?? ''}`}>
      <div className="relative border border-[#141414]/10 bg-white p-3 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2 text-xs font-mono tracking-widest uppercase text-gray-500">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-xs bg-black/10 px-1 py-0.5 rounded font-black text-gray-700">
              ADVERTISEMENT
            </span>
            <span>{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleInfo}
              title="Ad choices"
              aria-label="Ad choices information"
              aria-expanded={showInfo}
              className="opacity-60 hover:opacity-100 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300]/50"
            >
              <Info size={11} />
            </button>
            {dismissible && (
              <button
                type="button"
                onClick={onDismiss}
                title="Hide ad"
                aria-label="Dismiss advertisement"
                className="opacity-60 hover:opacity-100 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdInfoPanel({ onReport, onClose }: { onReport: () => void; onClose: () => void }) {
  return (
    <div className="py-2 text-xs font-sans space-y-3" role="dialog" aria-labelledby="why-ads-title">
      <p id="why-ads-title" className="font-bold text-sm font-mono uppercase text-[#FF3300]">
        Why am I seeing this?
      </p>
      <p className="leading-tight text-gray-700">
        Ads are served by Google AdSense to help cover hosting and development costs. PDF processing still
        runs on your device or our server only when you use server tools — not for ad targeting.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReport}
          className="bg-red-600 text-white rounded px-2.5 py-1 text-xs font-mono font-bold hover:bg-red-700"
        >
          Report ad
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-black/10 text-gray-900 rounded px-2.5 py-1 text-xs font-mono font-bold hover:bg-black/20"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

/**
 * Banner ad slot. Renders a real Google AdSense unit when one is available and
 * fills; otherwise it renders nothing (no house or placeholder ads).
 */
export function BannerAd({ className = '' }: { className?: string; onInquire?: () => void }) {
  const adsConfig = useAdsenseConfig();
  const [showInfo, setShowInfo] = useState(false);
  const [liveUnfilled, setLiveUnfilled] = useState(false);
  const bannerSlot = slotForResolvedConfig(adsConfig, 'banner');
  const tryLiveAd = shouldShowLiveAd(adsConfig, 'banner') && !liveUnfilled;

  if (!tryLiveAd) {
    return null;
  }

  return (
    <AdChrome
      className={className}
      label="Google AdSense"
      dismissible={false}
      onDismiss={() => {}}
      showInfo={showInfo}
      onToggleInfo={() => setShowInfo((v) => !v)}
    >
      {showInfo ? (
        <AdInfoPanel onReport={() => setShowInfo(false)} onClose={() => setShowInfo(false)} />
      ) : (
        <AdSenseUnit
          slot={bannerSlot}
          client={adsConfig.client}
          format="auto"
          minHeight={90}
          onUnfilled={() => setLiveUnfilled(true)}
        />
      )}
    </AdChrome>
  );
}

/**
 * Sidebar ad slot. Real Google AdSense only; renders nothing when no ad serves.
 */
export function SidebarAd({ className = '' }: { className?: string; onInquire?: () => void }) {
  const adsConfig = useAdsenseConfig();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [reported, setReported] = useState(false);
  const [liveUnfilled, setLiveUnfilled] = useState(false);
  const slot = slotForResolvedConfig(adsConfig, 'sidebar');
  const tryLiveAd = shouldShowLiveAd(adsConfig, 'sidebar') && !liveUnfilled;

  if (isDismissed || !tryLiveAd) {
    return null;
  }

  return (
    <AdChrome
      className={`max-w-sm ${className}`}
      label="Google AdSense"
      onDismiss={() => setIsDismissed(true)}
      showInfo={showInfo}
      onToggleInfo={() => setShowInfo((v) => !v)}
    >
      {reported ? (
        <div className="py-6 text-center space-y-2">
          <ShieldAlert size={16} className="mx-auto text-orange-500" />
          <p className="text-xs font-mono uppercase font-bold">Ad hidden</p>
        </div>
      ) : showInfo ? (
        <AdInfoPanel onReport={() => setReported(true)} onClose={() => setShowInfo(false)} />
      ) : (
        <AdSenseUnit
          slot={slot}
          client={adsConfig.client}
          format="rectangle"
          minHeight={250}
          onUnfilled={() => setLiveUnfilled(true)}
        />
      )}
    </AdChrome>
  );
}
