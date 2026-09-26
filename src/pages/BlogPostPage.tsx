import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchPostBySlug, fetchPublishedPosts } from '@/services/blogService';
import type { BlogPost } from '@/types/BlogPost';
import { SITE_CONFIG } from '@/config/site';
import { renderContentToHtml } from '@/lib/contentRenderer';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    let isMounted = true;

    fetchPostBySlug(slug).then((res) => {
      if (isMounted) {
        setPost(res);
        setLoading(false);
      }
    });

    fetchPublishedPosts().then((all) => {
      if (isMounted) {
        setRelatedPosts(all.filter((p) => p.slug !== slug).slice(0, 3));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0d14] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0d14] text-white text-center px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center text-2xl mx-auto">
            <i className="fa-solid fa-file-circle-question"></i>
          </div>
          <h1 className="text-2xl font-bold font-serif">Article Not Found</h1>
          <p className="text-xs text-slate-400">
            The article you are looking for has been moved or is currently in draft.
          </p>
          <Link to="/blogs/" className="btn btn-gold text-xs px-6 py-2.5 inline-flex items-center gap-2 font-bold">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Browse All Guides</span>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_CONFIG.siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_CONFIG.siteUrl}/blogs/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_CONFIG.siteUrl}/blog/${post.slug}/`,
      },
    ],
  };

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo_description,
    image: post.cover_image || `${SITE_CONFIG.siteUrl}/images/blog-online-cricket-betting.jpg`,
    author: {
      '@type': 'Person',
      name: post.author || 'FairPlay Desk',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/images/logo.png`,
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    mainEntityOfPage: `${SITE_CONFIG.siteUrl}/blog/${post.slug}/`,
  };

  const fullSchema = {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbSchema, blogPostingSchema],
  };

  return (
    <>
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonical={`/blog/${post.slug}/`}
        keywords={post.tags?.join(', ') || 'Fairplay, cricket betting, casino'}
        ogType="article"
        image={post.cover_image}
        structuredData={fullSchema}
      />

      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#25d366] z-[60] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="pt-24 sm:pt-28 pb-20 bg-[#0a0d14] min-h-screen text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { name: 'Blog', url: '/blogs/' },
              { name: post.category || 'Guides', url: '/blogs/' },
              { name: post.title, url: `/blog/${post.slug}/` },
            ]}
          />

          {/* Article Header */}
          <header className="py-6 sm:py-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/30">
                {post.category || 'Betting Guide'}
              </span>
              {post.reading_time_minutes && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <i className="fa-regular fa-clock text-[10px]"></i>
                  <span>{post.reading_time_minutes} min read</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author & Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-b border-white/[0.08] py-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] flex items-center justify-center font-bold text-xs">
                  FP
                </div>
                <div>
                  <div className="font-semibold text-white">{post.author || 'FairPlay Desk'}</div>
                  <div className="text-[10px] text-slate-400">
                    Published on {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Quick Share/Chat */}
              <a
                href={SITE_CONFIG.whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>Get FairPlay ID</span>
              </a>
            </div>
          </header>

          {/* Featured Cover Photo */}
          {post.cover_image && (
            <div className="my-6 rounded-2xl overflow-hidden border border-[#d4af37]/25 shadow-2xl bg-[#0e1322]">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full max-h-[460px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/blog-online-cricket-betting.jpg';
                }}
              />
            </div>
          )}

          {/* Excerpt Lead */}
          {post.excerpt && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border-l-4 border-[#d4af37] text-slate-200 text-sm sm:text-base leading-relaxed italic mb-8">
              "{post.excerpt}"
            </div>
          )}

          {/* Article Body Content (Growth-Service Architecture: Clean, Sanitized Semantic HTML) */}
          <div
            className="article-content max-w-none space-y-6"
            dangerouslySetInnerHTML={{ __html: renderContentToHtml(post.content) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Tags:</span>
              {post.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* WhatsApp VIP Support Box */}
          <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121829] to-[#0a0d14] border border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                  <i className="fa-solid fa-crown text-xs"></i>
                  <span>Official FairPlay VIP Desk</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Start Playing on FairPlay in 2 Minutes
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Instant WhatsApp registration, 300% first deposit bonus, and guaranteed 2-minute UPI cashouts.
                </p>
              </div>

              <a
                href={SITE_CONFIG.whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl whitespace-nowrap self-start sm:self-center shadow-xl flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                <span>Get Instant ID on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-white/[0.08]">
              <h3 className="text-xl font-bold font-serif text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-compass text-[#d4af37] text-base"></i>
                <span>More Betting Guides &amp; Tips</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    to={`/blog/${rel.slug}/`}
                    className="p-4 rounded-xl bg-[#0e1322] border border-white/[0.06] hover:border-[#d4af37]/50 transition-all duration-300 group block"
                  >
                    <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider mb-1">
                      {rel.category}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 mb-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
