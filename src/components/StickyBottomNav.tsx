import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';

export default function StickyBottomNav() {
  const location = useLocation();

  const handleLiveClick = () => {
    if (location.pathname === '/') {
      const elem = document.getElementById('live-matches');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCasinoClick = () => {
    if (location.pathname === '/') {
      const elem = document.getElementById('casino');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[#0a0d14]/95 backdrop-blur-xl border-t border-[#d4af37]/25 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)] shadow-[0_-5px_25px_rgba(0,0,0,0.8)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-between text-center">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 transition-colors ${location.pathname === '/' ? 'text-[#d4af37]' : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fa-solid fa-house text-base mb-1"></i>
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
        </Link>

        {/* Live Games */}
        <Link
          to="/#live-matches"
          onClick={handleLiveClick}
          className="flex flex-col items-center py-1 text-slate-400 hover:text-[#d4af37] transition-colors relative"
        >
          <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
          <i className="fa-solid fa-satellite-dish text-base mb-1 text-[#00f2fe]"></i>
          <span className="text-[10px] font-semibold tracking-tight">Live</span>
        </Link>

        {/* Casino */}
        <Link
          to="/#casino"
          onClick={handleCasinoClick}
          className="flex flex-col items-center py-1 text-slate-400 hover:text-[#d4af37] transition-colors"
        >
          <i className="fa-solid fa-dice text-base mb-1 text-[#ff416c]"></i>
          <span className="text-[10px] font-semibold tracking-tight">Casino</span>
        </Link>

        {/* App */}
        <Link
          to="/fairplay-app/"
          className={`flex flex-col items-center py-1 transition-colors ${location.pathname === '/fairplay-app/'
              ? 'text-[#d4af37]'
              : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <i className="fa-brands fa-android text-base mb-1 text-[#25d366]"></i>
          <span className="text-[10px] font-semibold tracking-tight">App</span>
        </Link>

        {/* WhatsApp */}
        <a
          href={SITE_CONFIG.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center py-1 text-[#25d366] hover:text-[#34e775] transition-colors"
        >
          <i className="fa-brands fa-whatsapp text-lg mb-0.5"></i>
          <span className="text-[10px] font-bold tracking-tight">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
