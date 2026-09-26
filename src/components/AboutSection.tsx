import { SITE_CONFIG } from '@/config/site';
import { homePage } from '@/data/corePages';

export default function AboutSection() {
  const aboutSectionData = homePage.sections[0];

  return (
    <section id="about" className="py-14 sm:py-20 lg:py-24 bg-[#0a0d14] relative overflow-hidden">
      {/* Background subtle radial ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="glass-card max-w-4xl mx-auto p-5 sm:p-10 md:p-14 text-center border border-[#d4af37]/30 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] text-xs sm:text-sm font-bold tracking-widest uppercase mb-5">
            <i className="fa-solid fa-shield-halved"></i>
            <span>TRUSTED • FAST PAYOUTS • 100% SAFE</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white mb-5">
            Fairplay | <span className="text-[#d4af37]">Your Trusted Betting ID Provider</span>
          </h2>

          {/* Body paragraphs from homePage.sections[0] */}
          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto mb-10">
            {aboutSectionData.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={SITE_CONFIG.whatsappDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp text-sm sm:text-base px-8 py-4 font-bold shadow-xl flex items-center gap-3"
            >
              <i className="fa-brands fa-whatsapp text-2xl"></i>
              <span>Get Your Instant Demo ID Now</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
