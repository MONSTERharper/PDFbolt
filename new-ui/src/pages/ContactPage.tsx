import React from 'react';

export function ContactPage({
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactSubject,
  setContactSubject,
  contactMessage,
  setContactMessage,
  contactStatus,
  contactSending,
  onSubmit,
}: {
  contactName: string;
  setContactName: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  contactSubject: string;
  setContactSubject: (value: string) => void;
  contactMessage: string;
  setContactMessage: (value: string) => void;
  contactStatus: { msg: string; type: 'ok' | 'error' } | null;
  contactSending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-6">
        <h2 className="text-5xl font-black tracking-tighter italic">Contact Us</h2>
        <p className="font-sans text-sm text-gray-700 leading-relaxed">
          For questions, feature requests, or support, contact us using the form below.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-1 gap-12">
        <div className="space-y-6 max-w-2xl">
          <div className="bg-[#FF3300]/5 border border-[#FF3300]/10 rounded-xl p-5 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-widest font-black text-[#FF3300]">Sponsorship Opportunities</h4>
            <p className="text-sm text-gray-600 font-sans leading-relaxed">
              Interested in advertising on PDFbolt? Tell us about your product or service. Use the subject{' '}
              <strong className="text-black font-semibold">Sponsorship Inquiry</strong> so we can find your message quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label id="lbl-name" className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">
                Your Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
                aria-labelledby="lbl-name"
                className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30"
              />
            </div>
            <div className="space-y-1">
              <label id="lbl-email" className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">
                Your Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                aria-labelledby="lbl-email"
                className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label id="lbl-subj" className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">
              Subject
            </label>
            <input
              type="text"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="What is this about?"
              aria-labelledby="lbl-subj"
              className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30"
            />
          </div>
          <div className="space-y-1">
            <label id="lbl-msg" className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest pl-1">
              Message
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={6}
              placeholder="Your message"
              aria-labelledby="lbl-msg"
              className="w-full bg-white border border-[#141414] p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-[#FF3300]/30 resize-none"
            />
          </div>
          {contactStatus && (
            <p
              className={`text-xs font-mono ${contactStatus.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}
              role="status"
            >
              {contactStatus.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={contactSending}
            className="bg-[#141414] text-[#E4E3E0] px-12 py-4 font-black tracking-widest uppercase hover:bg-[#FF3300] transition-colors shadow-[6px_6px_0px_#FF3300]/20 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3300] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {contactSending ? 'Sending...' : 'Send Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}
