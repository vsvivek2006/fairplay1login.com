import { SITE_CONFIG } from '@/config/site';

interface CasinoGame {
  name: string;
  provider: string;
  image: string;
  badge?: string;
  badgeType?: 'default' | 'gold' | 'cyan';
}

const games: CasinoGame[] = [
  {
    name: '7Up 7Down',
    provider: '7Up 7Down',
    image: '/images/7up-7down.jpg',
    badge: 'BONUS',
    badgeType: 'default',
  },
  {
    name: 'Dragon Tiger',
    provider: 'MAC88',
    image: '/images/dragon-tiger.jpg',
    badge: '2X BONUS',
    badgeType: 'default',
  },
  {
    name: 'Roulette',
    provider: 'Roulette Live',
    image: '/images/roulette.jpg',
    badge: 'BONUS',
    badgeType: 'default',
  },
  {
    name: 'Teen Patti',
    provider: 'Teen Patti',
    image: '/images/teenpatti.jpg',
  },
  {
    name: 'Rummy',
    provider: 'Rummy VIP',
    image: '/images/rummy.jpg',
    badge: '1000X',
    badgeType: 'gold',
  },
  {
    name: 'Mega Fishing',
    provider: 'EZUGI',
    image: '/images/mega-fishing.jpg',
    badge: '+ NEW',
    badgeType: 'cyan',
  },
  {
    name: 'Poker',
    provider: 'Poker Royal',
    image: '/images/poker.jpg',
    badge: '1000X',
    badgeType: 'gold',
  },
  {
    name: 'Coin Toss',
    provider: 'SPRIBE',
    image: '/images/coin-toss.jpg',
    badge: 'BONUS',
    badgeType: 'default',
  },
];

export default function CasinoArcade() {
  return (
    <section id="casino" className="py-14 sm:py-20 bg-[#090d16] border-t border-b border-white/5 relative">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="title-wrapper">
          <h2 className="section-title">Live Casino &amp; Arcade</h2>
          <p className="section-subtitle">
            Play popular live table games, dealer formats, slots, and interactive casino titles with instant credit rewards.
          </p>
        </div>

        {/* Casino Grid (2 Columns on Mobile, 3 on Tablet, 4 on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {games.map((game, idx) => (
            <a
              key={idx}
              href={SITE_CONFIG.whatsappCasinoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="casino-card cursor-pointer group"
            >
              {/* Image Container with Badge */}
              <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-[#0a0d14]">
                {game.badge && (
                  <div
                    className={`casino-badge ${game.badgeType === 'gold'
                        ? 'gold-badge'
                        : game.badgeType === 'cyan'
                          ? 'cyan-badge'
                          : ''
                      }`}
                  >
                    {game.badge}
                  </div>
                )}
                <img
                  src={game.image}
                  alt={game.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="btn btn-gold text-xs px-3 sm:px-4 py-1.5 sm:py-2 font-bold shadow-lg">
                    <i className="fa-solid fa-play text-[10px]"></i>
                    <span>Play Now</span>
                  </span>
                </div>
              </div>

              {/* Card Footer with Provider & Play Arrow */}
              <div className="p-2.5 sm:p-3.5 bg-gradient-to-r from-[#4c1d95] to-[#311068] text-white flex items-center justify-between border-t border-white/10">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide truncate">
                    {game.name}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-purple-200 tracking-wider uppercase font-semibold block truncate">
                    {game.provider}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#d4af37] text-xs font-bold transition-transform group-hover:translate-x-1">
                  <span className="hidden sm:inline text-[11px]">PLAY</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
