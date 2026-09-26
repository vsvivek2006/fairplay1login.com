import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedPosts } from '@/services/blogService';
import type { BlogPost } from '@/types/BlogPost';

const guideHubs = [
  {
    title: 'Beginner ID Guide',
    icon: 'fa-user-gear',
    link: '/fairplay-beginner-guide/',
    desc: 'Get your verified ID in 2 minutes, deposit with UPI, and start placing winning bets.',
  },
  {
    title: 'Safe & Secure Gaming',
    icon: 'fa-shield-halved',
    link: '/fairplay-account-security/',
    desc: 'Protect your account, verify your phone, and keep your winning balance safe.',
  },
  {
    title: 'Instant Password Help',
    icon: 'fa-key',
    link: '/fairplay-password-help/',
    desc: 'Quickly recover your login credentials or reset your password on WhatsApp.',
  },
  {
    title: 'How to Play & Win',
    icon: 'fa-trophy',
    link: '/fairplay-guide/',
    desc: 'Master live cricket exchange betting, casino games, and quick cashout tricks.',
  },
];

export default function HomeBlogSection() {
  const [articles, setArticles] = useState<BlogPost[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetchPublishedPosts().then((posts) => {
      if (isMounted) {
        setArticles(posts.slice(0, 3));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="guides" className="py-14 sm:py-20 lg:py-24 bg-[#0a0d14] relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Explore Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="title-wrapper text-left !mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider mb-2">
              <i className="fa-solid fa-bolt-lightning text-xs"></i>
              <span>Live Updates &amp; Guides</span>
            </div>
            <h2 className="section-title text-left !mb-2">Betting Tips &amp; Player Guides</h2>
            <p className="section-subtitle text-left max-w-2xl !mb-0">
              Fresh insights, match predictions, and step-by-step guides to help you maximize your FairPlay experience.
            </p>
          </div>

          <Link
            to="/blogs/"
            className="self-start sm:self-auto inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#d4af37] hover:text-[#f3e5ab] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 px-4 py-2.5 rounded-xl transition-all"
          >
            <span>Explore All Blogs</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>

        {/* 3 Featured Blog Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-16">
          {articles.map((art) => (
            <article
              key={art.id || art.slug}
              className="glass-card flex flex-col overflow-hidden group hover:border-[#d4af37]/60 transition-all duration-300 rounded-2xl bg-[#0e1322] border border-white/[0.08]"
            >
              <div className="w-full h-44 sm:h-52 overflow-hidden bg-[#0a0d14] relative">
                <img
                  src={art.cover_image || '/images/blog-online-cricket-betting.jpg'}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/blog-online-cricket-betting.jpg';
                  }}
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#0a0d14]/90 text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-md">
                  {art.category || 'Guide'}
                </span>
                {art.reading_time_minutes && (
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/75 text-slate-300 backdrop-blur-sm">
                    {art.reading_time_minutes} min read
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors mb-2.5 leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                  <span className="text-[11px] text-slate-400">
                    {art.author || 'FairPlay Desk'}
                  </span>
                  <Link
                    to={`/blog/${art.slug}/`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f3e5ab] hover:text-[#d4af37] transition-colors"
                  >
                    <span>Read Guide</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Quick Knowledge Hubs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {guideHubs.map((hub, idx) => (
            <Link
              key={idx}
              to={hub.link}
              className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#d4af37]/40 hover:bg-white/[0.05] transition-all duration-300 group block"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center text-base sm:text-lg mb-3 group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                <i className={`fa-solid ${hub.icon}`}></i>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors mb-1 break-words">
                {hub.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{hub.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
