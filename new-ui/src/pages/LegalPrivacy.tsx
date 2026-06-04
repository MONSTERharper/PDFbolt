import React from 'react';
import { ChevronRight } from 'lucide-react';

export function LegalPrivacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 font-sans text-sm text-gray-700 leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest border-b border-[#141414] py-1"
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
        <h2 className="text-lg font-bold text-[#141414]">Cookies and analytics</h2>
        <p>
          We use <strong>Google Analytics</strong> to understand how the site is used, and <strong>Google AdSense</strong>{' '}
          may show ads. These services may set cookies or similar technologies. You can control cookies in your browser
          settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Contact form</h2>
        <p>
          If you contact us, we receive the name, email, subject, and message you send so we can reply. Do not send
          sensitive personal data unless necessary.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, or delete personal data we hold. Contact
          us via the Contact page and we will respond within a reasonable time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#141414]">Changes</h2>
        <p>We may update this policy. The date above shows when it was last revised.</p>
      </section>
    </div>
  );
}
