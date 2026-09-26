import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';

interface Match {
  id: string;
  category: 'cricket' | 'football' | 'tennis';
  teams: string;
  league: string;
  time: string;
  isLive: boolean;
  backOdds: string;
  layOdds: string;
}

const matchData: Match[] = [
  {
    id: '1',
    category: 'cricket',
    teams: 'R C Bengaluru vs Kolkata Knight Riders',
    league: 'Indian Premier League (IPL 2026)',
    time: 'TODAY, 07:30 PM IST',
    isLive: true,
    backOdds: '1.92',
    layOdds: '1.95',
  },
  {
    id: '2',
    category: 'cricket',
    teams: 'Chennai Super Kings vs Mumbai Indians',
    league: 'Indian Premier League (IPL 2026)',
    time: 'TOMORROW, 03:30 PM IST',
    isLive: false,
    backOdds: '1.85',
    layOdds: '1.88',
  },
  {
    id: '3',
    category: 'cricket',
    teams: 'Hobart Hurricanes vs Perth Scorchers',
    league: 'Big Bash League 2026',
    time: 'LIVE IN PLAY',
    isLive: true,
    backOdds: '2.10',
    layOdds: '2.14',
  },
  {
    id: '4',
    category: 'football',
    teams: 'FC Barcelona vs Real Madrid',
    league: 'UEFA Champions League',
    time: 'LIVE IN PLAY - 64\'',
    isLive: true,
    backOdds: '2.40',
    layOdds: '2.45',
  },
  {
    id: '5',
    category: 'football',
    teams: 'Arsenal vs Manchester City',
    league: 'English Premier League',
    time: 'TONIGHT, 11:30 PM IST',
    isLive: false,
    backOdds: '1.98',
    layOdds: '2.02',
  },
  {
    id: '6',
    category: 'tennis',
    teams: 'Carlos Alcaraz vs Jannik Sinner',
    league: 'ATP Shanghai Masters',
    time: 'LIVE IN PLAY - Set 2',
    isLive: true,
    backOdds: '1.75',
    layOdds: '1.80',
  },
  {
    id: '7',
    category: 'tennis',
    teams: 'Novak Djokovic vs Daniil Medvedev',
    league: 'ATP Beijing Open',
    time: 'TOMORROW, 04:00 PM IST',
    isLive: false,
    backOdds: '1.68',
    layOdds: '1.72',
  },
];

export default function LiveMatches() {
  const [activeTab, setActiveTab] = useState<'all' | 'cricket' | 'football' | 'tennis'>('all');

  const filteredMatches =
    activeTab === 'all' ? matchData : matchData.filter((m) => m.category === activeTab);

  return (
    <section id="live-matches" className="py-14 sm:py-20 bg-[#070a10]/80 relative border-t border-white/5">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="title-wrapper">
          <h2 className="section-title">Live Games &amp; Match Odds</h2>
          <p className="section-subtitle">
            Bet live on today's cricket matches with the best market odds, instant cash payouts, and 2-minute verified ID activation.
          </p>
        </div>

        {/* 3 Featured Image Cards (Direct WhatsApp Connection) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          <a
            href={SITE_CONFIG.whatsappCasinoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="match-image-card group relative"
            aria-label="Teen Patti Live"
          >
            <img
              src="/images/teen-patti.png"
              alt="Teen Patti Live"
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
              <span className="text-[#d4af37] font-bold text-sm flex items-center gap-2">
                <span>Play Teen Patti on WhatsApp</span>
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </a>

          <a
            href={SITE_CONFIG.whatsappCasinoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="match-image-card group relative"
            aria-label="Live Casino"
          >
            <img
              src="/images/casino.png"
              alt="Live Casino"
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
              <span className="text-[#d4af37] font-bold text-sm flex items-center gap-2">
                <span>Get Casino ID on WhatsApp</span>
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </a>

          <a
            href={SITE_CONFIG.whatsappBetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="match-image-card group relative"
            aria-label="Cricket Sports"
          >
            <img
              src="/images/cricket.png"
              alt="Cricket Sports"
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
              <span className="text-[#d4af37] font-bold text-sm flex items-center gap-2">
                <span>Get Cricket ID on WhatsApp</span>
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </a>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#ffb574] to-[#ff6b18] text-white shadow-lg'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            All Sports
          </button>
          <button
            onClick={() => setActiveTab('cricket')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
              activeTab === 'cricket'
                ? 'bg-gradient-to-r from-[#ffb574] to-[#ff6b18] text-white shadow-lg'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <i className="fa-solid fa-baseball-bat-ball"></i>
            <span>Cricket (IPL)</span>
          </button>
          <button
            onClick={() => setActiveTab('football')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
              activeTab === 'football'
                ? 'bg-gradient-to-r from-[#ffb574] to-[#ff6b18] text-white shadow-lg'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <i className="fa-solid fa-futbol"></i>
            <span>Football</span>
          </button>
          <button
            onClick={() => setActiveTab('tennis')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
              activeTab === 'tennis'
                ? 'bg-gradient-to-r from-[#ffb574] to-[#ff6b18] text-white shadow-lg'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <i className="fa-solid fa-baseball"></i>
            <span>Tennis</span>
          </button>
        </div>

        {/* Live Match Cards Container */}
        <div className="glass-card overflow-hidden border border-[#d4af37]/20 shadow-2xl">
          {/* Header Bar */}
          <div className="category-header-angled bg-gradient-to-r from-[#a71d31] to-[#680d1a] px-6 py-3.5 flex items-center gap-3 text-white font-serif font-bold text-base sm:text-lg">
            <i className="fa-solid fa-satellite-dish text-[#ff4b60] animate-pulse"></i>
            <span>Live Markets &amp; Exchange Odds</span>
          </div>

          {/* Matches List */}
          <div className="divide-y divide-white/10">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
              >
                {/* Team & League Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {match.isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30">
                        <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping inline-block"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300">
                        UPCOMING
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">{match.league}</span>
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg">{match.teams}</h3>
                  <div className="text-xs text-[#f3e5ab] mt-1 flex items-center gap-1.5 font-medium">
                    <i className="fa-regular fa-clock text-[#d4af37]"></i>
                    <span>{match.time}</span>
                  </div>
                </div>

                {/* Back / Lay Betting Exchange Odds */}
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 pt-2 md:pt-0 w-full md:w-auto border-t md:border-t-0 border-white/5">
                  <a
                    href={SITE_CONFIG.whatsappBetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 group/odds"
                  >
                    {/* Blue Back Box */}
                    <div className="flex flex-col items-center justify-center w-14 sm:w-18 py-1 sm:py-1.5 rounded-lg bg-[#1e6091]/80 group-hover/odds:bg-[#1e6091] border border-[#00f2fe]/40 text-center transition-all">
                      <span className="text-[9px] sm:text-[10px] text-sky-200 uppercase font-bold tracking-wider">Back</span>
                      <span className="text-xs sm:text-base font-extrabold text-white font-mono">
                        {match.backOdds}
                      </span>
                    </div>

                    {/* Pink Lay Box */}
                    <div className="flex flex-col items-center justify-center w-14 sm:w-18 py-1 sm:py-1.5 rounded-lg bg-[#e63946]/80 group-hover/odds:bg-[#e63946] border border-red-400/40 text-center transition-all">
                      <span className="text-[9px] sm:text-[10px] text-pink-200 uppercase font-bold tracking-wider">Lay</span>
                      <span className="text-xs sm:text-base font-extrabold text-white font-mono">
                        {match.layOdds}
                      </span>
                    </div>
                  </a>

                  {/* Bet / Direct WhatsApp Button */}
                  <a
                    href={SITE_CONFIG.whatsappBetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-bet text-xs px-3.5 py-1.5"
                  >
                    <i className="fa-solid fa-bolt text-xs"></i>
                    <span>Bet Now</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Bar of Match Widget */}
          <div className="p-4 bg-[#0a0d14]/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1e6091]"></span>
                <span>Back (Bet On)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e63946]"></span>
                <span>Lay (Bet Against)</span>
              </span>
            </div>
            <Link
              to="/fairplay-sports/"
              className="text-[#d4af37] hover:text-[#f3e5ab] font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>View Today's Sports &amp; Match Odds</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
