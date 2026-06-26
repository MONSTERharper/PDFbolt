import React, { useState } from 'react';
import { Share2, Mail, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  /** Title used as the share text / email subject. */
  title: string;
  /** Absolute or relative URL to share. Defaults to the current page. */
  url?: string;
  /** Optional heading label shown before the buttons. */
  label?: string;
}

function resolveUrl(url?: string): string {
  if (url) {
    if (/^https?:\/\//i.test(url)) return url;
    if (typeof window !== 'undefined') return `${window.location.origin}${url}`;
    return `https://mypdfbolt.shop${url}`;
  }
  if (typeof window !== 'undefined') return window.location.href;
  return 'https://mypdfbolt.shop';
}

/**
 * Compact social-share row. Encourages visitors to share tool and guide pages,
 * which (together with per-tool OG images) renders rich previews and seeds
 * organic links over time.
 */
export function ShareButtons({ title, url, label = 'Share this page' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = resolveUrl(url);
  const u = encodeURIComponent(shareUrl);
  const t = encodeURIComponent(title);

  const networks: { name: string; href: string }[] = [
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
  ];

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (typeof window !== 'undefined') {
        window.prompt('Copy this link:', shareUrl);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      if (typeof window !== 'undefined') window.prompt('Copy this link:', shareUrl);
    }
  };

  const baseBtn =
    'inline-flex items-center gap-1.5 rounded-md border border-[#141414]/15 bg-white px-3 py-1.5 ' +
    'text-xs font-bold tracking-tight text-[#141414] transition-all hover:border-[#FF3300] ' +
    'hover:text-[#FF3300] hover:shadow-[2px_2px_0px_#141414]';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-gray-500">
        <Share2 size={14} className="text-[#FF3300]" aria-hidden /> {label}
      </span>
      {networks.map((network) => (
        <a
          key={network.name}
          href={network.href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseBtn}
          aria-label={`Share on ${network.name}`}
        >
          {network.name}
        </a>
      ))}
      <a
        href={`mailto:?subject=${t}&body=${t}%0A%0A${u}`}
        className={baseBtn}
        aria-label="Share by email"
      >
        <Mail size={14} aria-hidden /> Email
      </a>
      <button type="button" onClick={handleCopy} className={baseBtn} aria-label="Copy link">
        {copied ? (
          <>
            <Check size={14} aria-hidden /> Copied
          </>
        ) : (
          <>
            <Link2 size={14} aria-hidden /> Copy link
          </>
        )}
      </button>
    </div>
  );
}
