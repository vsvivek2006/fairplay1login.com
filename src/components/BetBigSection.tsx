import { SITE_CONFIG } from '@/config/site';

export default function BetBigSection() {
  return (
    <section id="bet-big" className="py-14 sm:py-24 bg-[#0a0d14] relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16">
          {/* Image Box */}
          <div className="rounded-2xl border border-[#d4af37]/30 shadow-[0_0_35px_rgba(212,175,55,0.2)] overflow-hidden group">
            <img
              src="/images/win-big.jpg"
              alt="Bet Big Win Bigger"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Content Box */}
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-[#d4af37] text-xs sm:text-sm font-bold tracking-widest uppercase">
              <i className="fa-solid fa-trophy"></i>
              <span>Maximize Your Wins</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-white leading-tight">
              Bet Big — <br className="hidden sm:inline" />
              <span className="text-[#d4af37]">Win Bigger</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Join India's favorite sports betting platform. Enjoy higher betting limits, instant winning payouts, and personalized VIP service. Turn your cricket passion into real winnings today!
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-[#d4af37]">2 Min</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Withdrawal Guarantee</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-[#25d366]">24/7 VIP</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Personal Manager</div>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-xs sm:text-sm px-6 py-3.5 font-bold shadow-xl flex items-center justify-center gap-2.5 w-full sm:w-auto"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                <span>Connect on WhatsApp Now</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
