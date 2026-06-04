import React from 'react';
import { ChevronRight } from 'lucide-react';

export function LegalPrivacy({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-xs uppercase font-bold tracking-widest border-b border-[#141414] py-1"
      >
        <ChevronRight size={14} className="rotate-180" /> Back
      </button>
      <h1 className="text-4xl font-black tracking-tighter text-[#141414]">Privacy policy</h1>
      <p className="text-xs text-gray-500">Last updated: June 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">What we do</h2>
        <p>
          PDFbolt (mypdfbolt.shop) provides online PDF tools. When you use a <strong>Live</strong> tool, you upload
          files to our server so we can process them and return a download.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Your files</h2>
        <p>
          Uploaded files are used only to run the tool you requested. We do not keep your files on disk after processing
          finishes. Do not upload content you are not allowed to share with us.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Cookies and similar technologies</h2>
        <p>
          Like most websites, we use cookies and similar technologies (such as local storage) to operate the site and
          understand how it is used. Cookies are small text files stored on your device.
        </p>
        <p>Cookies and related technologies on this site may be set by:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>PDFbolt</strong> — for example, to remember that you dismissed the cookie notice or onboarding
            banner (stored in your browser only).
          </li>
          <li>
            <strong>Google Analytics</strong> (Google LLC) — to measure traffic and how pages and tools are used. Google
            Analytics may set cookies such as <code className="text-xs bg-gray-100 px-1">_ga</code> and{' '}
            <code className="text-xs bg-gray-100 px-1">_gid</code>.
          </li>
          <li>
            <strong>Google AdSense</strong> (Google LLC) — to show advertisements and limit how often you see the same
            ad. AdSense and its partners may set cookies for ad delivery, measurement, and fraud prevention.
          </li>
        </ul>
        <p>
          You can block or delete cookies in your browser settings. Blocking cookies may affect site features or ad
          display.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Advertising</h2>
        <p>
          We use <strong>Google AdSense</strong> to display advertisements. Google and third-party advertising partners
          may use cookies to serve ads based on your prior visits to this or other websites, and to measure ad
          performance.
        </p>
        <p>
          You may opt out of personalised advertising by Google at{' '}
          <a
            href="https://www.google.com/settings/ads"
            className="text-[#FF3300] underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            google.com/settings/ads
          </a>
          . You can also visit{' '}
          <a
            href="https://www.aboutads.info/choices/"
            className="text-[#FF3300] underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info/choices
          </a>{' '}
          for industry opt-out options in some regions.
        </p>
        <p>
          For more on how Google uses data from sites that use its services, see{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className="text-[#FF3300] underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s partner sites policy
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Analytics</h2>
        <p>
          We use <strong>Google Analytics</strong> to collect aggregated statistics (for example, page views and general
          traffic sources). Google processes this data under its own privacy policy. You can opt out of Google
          Analytics in your browser using{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            className="text-[#FF3300] underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Analytics opt-out add-on
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Contact form</h2>
        <p>
          If you{' '}
          <button
            type="button"
            onClick={onContact}
            className="text-[#FF3300] underline font-semibold"
          >
            contact us
          </button>
          , we receive the name, email, subject, and message you send so we can reply. Do not send sensitive personal
          data unless necessary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Data retention</h2>
        <p>
          <strong>Uploaded files:</strong> removed from our server after your tool request completes; we do not use them
          for other purposes.
        </p>
        <p>
          <strong>Analytics:</strong> retained according to Google Analytics default settings (typically up to 26 months
          unless configured otherwise in our Google Analytics account).
        </p>
        <p>
          <strong>Contact form messages:</strong> kept only as long as needed to respond to your inquiry and handle any
          follow-up, then deleted or archived in routine mailbox cleanup.
        </p>
        <p>
          <strong>Server logs:</strong> short-term technical logs (for example, error and access logs) may be retained
          for security and troubleshooting for a limited period, then rotated or deleted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Children&apos;s privacy</h2>
        <p>
          This site is not directed at children under 13. We do not knowingly collect personal data from children under
          13. If you believe a child has provided us personal information, please{' '}
          <button
            type="button"
            onClick={onContact}
            className="text-[#FF3300] underline font-semibold"
          >
            contact us
          </button>{' '}
          and we will delete it promptly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, or delete personal data we hold. Please{' '}
          <button
            type="button"
            onClick={onContact}
            className="text-[#FF3300] underline font-semibold"
          >
            contact us
          </button>{' '}
          and we will respond within a reasonable time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Changes</h2>
        <p>We may update this policy. The date above shows when it was last revised.</p>
      </section>
    </div>
  );
}
