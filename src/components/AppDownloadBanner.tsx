import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';

export default function AppDownloadBanner() {
  return (
    <section id="app-download" className="py-14 sm:py-20 bg-[#080d17] border-t border-b border-white/5 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-5 sm:p-10 md:p-14 border border-[#d4af37]/30 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#1e6091]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] text-xs font-bold uppercase tracking-wider">
                <i className="fa-brands fa-android text-sm"></i>
                <span>Official Fairplay Android App</span>
              </div>

              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-white leading-tight">
                Download the <span className="text-[#d4af37]">Fairplay Mobile App</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                Take India's favorite betting app everywhere you go. Enjoy lightning-fast odds, ball-by-ball match updates, fingerprint login, and instant WhatsApp withdrawals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                  <i className="fa-solid fa-bolt text-[#d4af37]"></i>
                  <span>Zero Delay In-Play</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                  <i className="fa-solid fa-fingerprint text-[#25d366]"></i>
                  <span>Fingerprint Login</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                  <i className="fa-solid fa-bell text-[#ff9040]"></i>
                  <span>Live Match Alerts</span>
                </div>
              </div>

              {/* Action Buttons (Responsive Stack on Mobile) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-3">
                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold text-xs sm:text-sm px-5 py-3 font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Download Fairplay APK</span>
                </a>
                <Link
                  to="/fairplay-apk-installation/"
                  className="btn btn-outline text-xs sm:text-sm px-5 py-3 font-bold flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-book-open text-xs"></i>
                  <span>Installation Guide</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 p-3 bg-gradient-to-b from-[#1e293b] to-[#0a0d14] rounded-[40px] border-2 border-[#d4af37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {/* Speaker notch */}
                <div className="w-20 h-4 bg-black/60 rounded-full mx-auto mb-3 border border-white/10" />

                {/* Inner Screen */}
                <div className="rounded-[30px] overflow-hidden bg-[#0a0d14] border border-white/10 p-4 text-center space-y-3">
                  <img src="/images/logo.png" alt="Fairplay App" className="h-8 mx-auto object-contain" />
                  <div className="text-xs font-bold text-[#f3e5ab] font-serif">IPL 2026 LIVE MATCH</div>

                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-left text-[11px] space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>RCB vs KKR</span>
                      <span className="text-[#00f2fe]">LIVE</span>
                    </div>
                    <div className="text-slate-400">142/3 (16.2 ov) • RR: 8.7</div>
                    <div className="flex justify-between text-[10px] text-[#d4af37] pt-1">
                      <span>Back: 1.92</span>
                      <span>Lay: 1.95</span>
                    </div>
                  </div>

                  <div className="w-full py-2 rounded-lg bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow">
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Instant WhatsApp Payout</span>
                  </div>

                  <div className="text-[10px] text-slate-500">Fast • Reliable • 100% Verified</div>
                </div>

                {/* Home Indicator */}
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
