import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Info, ShieldAlert, Sparkles, LayoutGrid, Terminal, Share2 } from 'lucide-react';
import { AdSenseUnit } from './AdSenseUnit';
import {
  shouldShowLiveAd,
  slotForResolvedConfig,
  useAdsenseConfig,
} from '../useAdsenseConfig';

interface AdPreset {
  id: string;
  sponsor: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  badge?: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const AD_PRESETS: AdPreset[] = [
  {
    id: 'pdf-bolt-sponsor',
    sponsor: 'Sponsor PDFbolt',
    title: 'Acquire This Dedicated Developer Placement',
    description:
      'Reach technical authors and document designers searching for secure PDF utilities daily.',
    cta: 'Inquire Ad Placement',
    link: '#contact',
    badge: 'SPONSOR SLOT AVAILABLE',
    bgColor: 'bg-gradient-to-r from-red-50 to-orange-50/50',
    textColor: 'text-red-950',
    borderColor: 'border-red-100',
    accentColor: '#FF3300',
    icon: Terminal,
  },
  {
    id: 'google-ai-studio',
    sponsor: 'Google AI Studio',
    title: 'Build with the Gemini API',
    description: 'Integrate generative AI for summaries, parsing, and document workflows.',
    cta: 'Get API Key',
    link: 'https://ai.google.dev/',
    badge: 'PARTNER',
    bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50/50',
    textColor: 'text-indigo-950',
    borderColor: 'border-indigo-100',
    accentColor: '#4F46E5',
    icon: Sparkles,
  },
  {
    id: 'cloud-run',
    sponsor: 'Google Cloud Run',
    title: 'Deploy containers that scale on demand',
    description: 'HTTP-triggered autoscaling with managed TLS and secrets.',
    cta: 'Deploy on Cloud Run',
    link: 'https://cloud.google.com/run',
    bgColor: 'bg-[#F8FAFC]',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-200',
    accentColor: '#0EA5E9',
    icon: LayoutGrid,
  },
  {
    id: 'tailwind-ui',
    sponsor: 'Tailwind Labs',
    title: 'Production-ready UI patterns',
    description: 'Component kits built with Tailwind CSS utilities.',
    cta: 'Explore Templates',
    link: 'https://tailwindcss.com',
    badge: 'RECOMMENDED',
    bgColor: 'bg-gradient-to-r from-[#0F172A] to-[#1E293B]',
    textColor: 'text-slate-100',
    borderColor: 'border-slate-800',
    accentColor: '#38BDF8',
    icon: Share2,
  },
];

function AdChrome({
  label,
  className,
  onDismiss,
  showInfo,
  onToggleInfo,
  children,
}: {
  label: string;
  className?: string;
  onDismiss: () => void;
  showInfo: boolean;
  onToggleInfo: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`w-full ${className ?? ''}`}>
      <div className="relative border border-[#141414]/10 bg-white p-3 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2 text-[9px] font-mono tracking-widest uppercase text-gray-500">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-[8px] bg-black/10 px-1 py-0.5 rounded font-black text-gray-700">
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
            <button
              type="button"
              onClick={onDismiss}
              title="Hide ad"
              aria-label="Dismiss advertisement"
              className="opacity-60 hover:opacity-100 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <X size={11} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function PresetAdBody({
  ad,
  onInquire,
  layout,
}: {
  ad: AdPreset;
  onInquire?: () => void;
  layout: 'banner' | 'sidebar';
}) {
  const Icon = ad.icon;

  const handleCtaClick = (e: React.MouseEvent) => {
    if (ad.link === '#contact') {
      e.preventDefault();
      onInquire?.();
    } else {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (layout === 'sidebar') {
    return (
      <div
        className={`border ${ad.borderColor} ${ad.bgColor} ${ad.textColor} p-4 rounded-xl flex flex-col justify-between min-h-[200px]`}
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white/60 border border-black/[0.04]">
              <Icon size={12} style={{ color: ad.accentColor }} />
            </div>
            <span className="font-bold text-[10px] tracking-tight uppercase">{ad.sponsor}</span>
          </div>
          <h4 className="font-black text-xs leading-snug">{ad.title}</h4>
          <p className="text-[10px] opacity-75 font-sans leading-relaxed line-clamp-3">{ad.description}</p>
        </div>
        <button
          type="button"
          onClick={handleCtaClick}
          className="w-full mt-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest rounded-md border-2 border-current"
        >
          {ad.cta}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border ${ad.borderColor} ${ad.bgColor} ${ad.textColor} p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="shrink-0 p-2 rounded-lg bg-white/60 border border-black/[0.04]">
          <Icon size={16} style={{ color: ad.accentColor }} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <h4 className="font-bold text-xs md:text-sm tracking-tight leading-snug">{ad.title}</h4>
          <p className="text-[11px] opacity-85 font-sans line-clamp-2">{ad.description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCtaClick}
        className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border-2 border-current flex items-center gap-1.5"
      >
        {ad.cta}
        <ExternalLink size={12} />
      </button>
    </div>
  );
}

function AdInfoPanel({ onReport, onClose }: { onReport: () => void; onClose: () => void }) {
  return (
    <div className="py-2 text-xs font-sans space-y-3" role="dialog" aria-labelledby="why-ads-title">
      <p id="why-ads-title" className="font-bold text-[11px] font-mono uppercase text-[#FF3300]">
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
          className="bg-red-600 text-white rounded px-2.5 py-1 text-[10px] font-mono font-bold hover:bg-red-700"
        >
          Report ad
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-black/10 text-gray-900 rounded px-2.5 py-1 text-[10px] font-mono font-bold hover:bg-black/20"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

export function BannerAd({ className = '', onInquire }: { className?: string; onInquire?: () => void }) {
  const adsConfig = useAdsenseConfig();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [reported, setReported] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);
  const [liveUnfilled, setLiveUnfilled] = useState(false);
  const bannerSlot = slotForResolvedConfig(adsConfig, 'banner');
  const tryLiveAd = shouldShowLiveAd(adsConfig, 'banner') && !liveUnfilled;

  useEffect(() => {
    if (tryLiveAd || reported || showInfo) return;
    const interval = setInterval(() => {
      setPresetIdx((prev) => (prev + 1) % AD_PRESETS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [tryLiveAd, reported, showInfo]);

  if (isDismissed) return null;

  const ad = AD_PRESETS[presetIdx];

  return (
    <AdChrome
      className={className}
      label={tryLiveAd ? 'Google AdSense' : ad.sponsor}
      onDismiss={() => setIsDismissed(true)}
      showInfo={showInfo}
      onToggleInfo={() => setShowInfo((v) => !v)}
    >
      {reported ? (
        <div className="py-4 text-center space-y-2" role="alert">
          <ShieldAlert size={18} className="mx-auto text-orange-500" />
          <p className="text-[10px] font-mono uppercase font-bold">Feedback received</p>
          <p className="text-xs text-gray-600">This ad is hidden for this session.</p>
        </div>
      ) : showInfo ? (
        <AdInfoPanel onReport={() => setReported(true)} onClose={() => setShowInfo(false)} />
      ) : tryLiveAd ? (
        <AdSenseUnit
          slot={bannerSlot}
          client={adsConfig.client}
          format="auto"
          minHeight={90}
          onUnfilled={() => setLiveUnfilled(true)}
        />
      ) : (
        <PresetAdBody ad={ad} onInquire={onInquire} layout="banner" />
      )}
    </AdChrome>
  );
}

export function SidebarAd({ className = '', onInquire }: { className?: string; onInquire?: () => void }) {
  const adsConfig = useAdsenseConfig();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [reported, setReported] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);
  const slot = slotForResolvedConfig(adsConfig, 'sidebar');
  const [liveUnfilled, setLiveUnfilled] = useState(false);
  const tryLiveAd = shouldShowLiveAd(adsConfig, 'sidebar') && !liveUnfilled;

  useEffect(() => {
    if (tryLiveAd || reported || showInfo) return;
    const interval = setInterval(() => {
      setPresetIdx((prev) => (prev + 1) % AD_PRESETS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [tryLiveAd, reported, showInfo]);

  if (isDismissed) return null;

  const ad = AD_PRESETS[presetIdx];

  return (
    <AdChrome
      className={`max-w-sm ${className}`}
      label={tryLiveAd ? 'Google AdSense' : ad.sponsor}
      onDismiss={() => setIsDismissed(true)}
      showInfo={showInfo}
      onToggleInfo={() => setShowInfo((v) => !v)}
    >
      {reported ? (
        <div className="py-6 text-center space-y-2">
          <ShieldAlert size={16} className="mx-auto text-orange-500" />
          <p className="text-[10px] font-mono uppercase font-bold">Ad hidden</p>
        </div>
      ) : showInfo ? (
        <AdInfoPanel onReport={() => setReported(true)} onClose={() => setShowInfo(false)} />
      ) : tryLiveAd ? (
        <AdSenseUnit
          slot={slot}
          client={adsConfig.client}
          format="rectangle"
          minHeight={250}
          onUnfilled={() => setLiveUnfilled(true)}
        />
      ) : (
        <PresetAdBody ad={ad} onInquire={onInquire} layout="sidebar" />
      )}
    </AdChrome>
  );
}
