import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchPublishedPosts } from '@/services/blogService';
import type { BlogPost } from '@/types/BlogPost';
import { SITE_CONFIG } from '@/config/site';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetchPublishedPosts().then((res) => {
      if (isMounted) {
        setPosts(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const list = new Set<string>();
    posts.forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return ['All', ...Array.from(list)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCat =
        selectedCategory === 'All' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <>
      <SEO
        title="FairPlay Official Blog & Guides | IPL Betting, Casino, Live Tips"
        description="Read the latest FairPlay cricket betting strategies, IPL 2026 match predictions, casino guides, and WhatsApp ID tutorials."
        canonical="/blogs/"
        keywords="Fairplay blog, cricket betting guides, IPL 2026 odds, Fairplay login tips, online casino India"
      />

      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 bg-[#0a0d14] min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumbs items={[{ name: 'Official Blog & Guides', url: '/blogs/' }]} />

          {/* Hero Header */}
          <div className="py-8 sm:py-12 border-b border-white/[0.08] mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-newspaper text-xs"></i>
              <span>FairPlay Knowledge Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4">
              FairPlay Betting Guides &amp; Insights
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
              Master cricket exchange trading, stay ahead with live IPL odds analysis, explore casino game strategies, and learn how to manage your instant VIP account safely.
            </p>

            {/* WhatsApp Fast CTA Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#d4af37]/15 to-transparent border border-[#d4af37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] flex items-center justify-center text-lg shrink-0">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Need an Instant FairPlay ID?
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Get your verified betting ID on WhatsApp in 2 minutes with 300% welcome bonus.
                  </div>
                </div>
              </div>
              <a
                href={SITE_CONFIG.whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-center"
              >
                <i className="fa-brands fa-whatsapp text-sm mr-1.5"></i>
                <span>Get WhatsApp ID</span>
              </a>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#d4af37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e1322] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <i className="fa-solid fa-book-open text-3xl text-slate-600 mb-3"></i>
              <h3 className="text-base font-bold text-white mb-1">No articles found</h3>
              <p className="text-xs text-slate-400">
                Try searching for a different topic or select another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id || post.slug}
                  className="flex flex-col rounded-2xl overflow-hidden bg-[#0e1322] border border-white/[0.08] hover:border-[#d4af37]/60 transition-all duration-300 group shadow-lg"
                >
                  <Link to={`/blog/${post.slug}/`} className="block w-full h-48 sm:h-52 overflow-hidden bg-[#0a0d14] relative">
                    <img
                      src={post.cover_image || '/images/blog-online-cricket-betting.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/blog-online-cricket-betting.jpg';
                      }}
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0a0d14]/90 text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-md">
                      {post.category || 'Article'}
                    </span>
                    {post.reading_time_minutes && (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/75 text-slate-300 backdrop-blur-sm">
                        {post.reading_time_minutes} min read
                      </span>
                    )}
                  </Link>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{post.author || 'FairPlay Desk'}</span>
                      </div>
                      <Link to={`/blog/${post.slug}/`}>
                        <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug mb-2.5 line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#f3e5ab]">
                        <i className="fa-solid fa-circle-check text-xs text-[#25d366]"></i>
                        <span>Verified Guide</span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}/`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] transition-colors"
                      >
                        <span>Read Full Guide</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
