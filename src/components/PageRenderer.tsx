import { useState, useEffect, useMemo } from 'react';
import type { PageData } from '@/types/PageData';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import RelatedLinks from '@/components/RelatedLinks';
import { SITE_CONFIG } from '@/config/site';
import { Link } from 'react-router-dom';

function breadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

interface PageRendererProps {
  data: PageData;
}

export default function PageRenderer({ data }: PageRendererProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);

  // Calculate reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart Scrollspy for Table of Contents
  useEffect(() => {
    if (!data.sections || data.sections.length === 0) return;

    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      const offsets = data.sections.map((_, idx) => {
        const el = document.getElementById(`section-${idx}`);
        return el ? el.offsetTop - 150 : 0;
      });

      let currentIdx = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (scrollY >= offsets[i]) {
          currentIdx = i;
        }
      }
      setActiveSectionIdx(currentIdx);
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [data.sections]);

  // Calculate estimated reading time
  const readingTimeMinutes = useMemo(() => {
    let text = data.intro || '';
    data.sections.forEach((sec) => {
      text += ' ' + sec.paragraphs.join(' ');
      sec.subsections?.forEach((sub) => {
        text += ' ' + sub.paragraphs.join(' ');
      });
    });
    const words = text.trim().split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 180));
  }, [data]);

  // Dynamic Schema.org Type Determination
  let schemaType = 'Article';
  const slug = data.slug.toLowerCase();
  const category = (data.category || '').toLowerCase();

  if (slug === '/about/') {
    schemaType = 'AboutPage';
  } else if (slug === '/contact/') {
    schemaType = 'ContactPage';
  } else if (slug === '/faq/') {
    schemaType = 'FAQPage';
  } else if (
    category.includes('legal') ||
    category.includes('policy') ||
    slug.includes('policy') ||
    slug === '/terms/' ||
    slug === '/disclaimer/' ||
    slug === '/accessibility/'
  ) {
    schemaType = 'WebPage';
  }

  // Schema object
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: data.h1,
    headline: data.h1,
    description: data.metaDescription,
    image: `${SITE_CONFIG.siteUrl}/images/logo.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Fairplay',
      url: `${SITE_CONFIG.siteUrl}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/images/logo.png`,
      },
    },
    ...(schemaType === 'Article'
      ? {
          author: {
            '@type': 'Organization',
            name: 'Fairplay Editorial Team',
            url: `${SITE_CONFIG.siteUrl}/`,
          },
        }
      : {}),
    mainEntityOfPage: `${SITE_CONFIG.siteUrl}${data.slug}`,
  };

  const allStructuredData = [
    breadcrumbStructuredData(data.breadcrumb),
    pageSchema,
    ...(data.structuredData ? [data.structuredData] : []),
    ...(data.faqs && data.faqs.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: data.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent pointer-events-none">
        <div
          className="reading-progress-bar h-full transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <SEO
        title={data.title}
        description={data.metaDescription}
        canonical={data.slug}
        keywords={data.keywords}
        ogType={data.ogType}
        structuredData={
          allStructuredData.length === 1
            ? allStructuredData[0]
            : allStructuredData.length > 1
              ? {
                  '@context': 'https://schema.org',
                  '@graph': allStructuredData,
                }
              : undefined
        }
      />

      <div className="min-h-screen pt-20 sm:pt-24 pb-20 bg-[#0a0d14] text-slate-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs items={data.breadcrumb} />

          {/* Article Hero Banner with Radial Glow */}
          <header className="mb-8 sm:mb-12 mt-2 sm:mt-4 p-5 sm:p-8 md:p-10 rounded-2xl bg-gradient-to-r from-[#121826] via-[#0f1524] to-[#121826] border border-[#d4af37]/30 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              {/* Category Badge & Estimated Reading Time */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <span className="inline-block px-3 py-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-full">
                  {data.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full">
                  <i className="fa-regular fa-clock text-[#d4af37]"></i>
                  <span>{readingTimeMinutes} min read</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight mb-4 sm:mb-5 drop-shadow-md break-words">
                {data.h1}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
                {data.intro}
              </p>

              {/* Meta information strip */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10 text-[11px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-[#d4af37]"></i>
                  <span>Official Fairplay ID Guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-[#25d366]"></i>
                  <span>IPL 2026 Special Bonus</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-headset text-[#00f2fe]"></i>
                  <span>24/7 WhatsApp Support</span>
                </div>
              </div>
            </div>
          </header>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Main Content (Left ~70%) */}
            <article className="lg:col-span-8 min-w-0">
              {/* Dynamic Scrollspy Quick Guide Navigation */}
              {data.sections && data.sections.length > 1 && (
                <div className="mb-8 sm:mb-10 p-4 sm:p-6 rounded-xl bg-[#121826]/90 border border-[#d4af37]/30 shadow-md">
                  <div className="flex items-center gap-2.5 text-[#d4af37] font-bold text-sm mb-3">
                    <i className="fa-solid fa-compass text-sm"></i>
                    <span className="font-serif tracking-wide uppercase">Quick Guide Navigation</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {data.sections.map((section, sIdx) => {
                      const isActive = activeSectionIdx === sIdx;
                      return (
                        <li key={sIdx}>
                          <a
                            href={`#section-${sIdx}`}
                            className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-all ${
                              isActive
                                ? 'text-[#f3e5ab] font-bold bg-[#d4af37]/15 border-l-2 border-[#d4af37]'
                                : 'text-slate-300 hover:text-[#d4af37]'
                            }`}
                          >
                            <i
                              className={`fa-solid fa-chevron-right text-[10px] ${
                                isActive ? 'text-[#d4af37]' : 'text-slate-500'
                              }`}
                            ></i>
                            <span>{section.heading}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Sections */}
              <div className="space-y-8 sm:space-y-12">
                {data.sections.map((section, idx) => (
                  <section
                    key={idx}
                    id={`section-${idx}`}
                    className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[#0f1422]/70 border border-white/10 shadow-lg transition-all"
                  >
                    {/* Heading with Gold Accent Bar */}
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 border-b border-white/10 pb-3">
                      <div className="w-1.5 h-5 sm:h-6 rounded-full bg-gradient-to-b from-[#ffb574] to-[#ff6b18] shrink-0"></div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-white break-words">
                        {section.heading}
                      </h2>
                    </div>

                    {/* Section Paragraphs */}
                    <div className="space-y-3.5 sm:space-y-4 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Subsections if present */}
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                        {section.subsections.map((sub, subIdx) => (
                          <div
                            key={subIdx}
                            className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/5"
                          >
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#f3e5ab] font-serif mb-2.5 sm:mb-3 flex items-center gap-2 break-words">
                              <i className="fa-solid fa-circle-check text-[#d4af37] text-xs sm:text-sm shrink-0"></i>
                              <span>{sub.heading}</span>
                            </h3>
                            <div className="space-y-2.5 sm:space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                              {sub.paragraphs.map((subP, spIdx) => (
                                <p key={spIdx}>{subP}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Accordion FAQ Section if Present */}
              {data.faqs && data.faqs.length > 0 && (
                <div className="mt-10 sm:mt-14 p-4 sm:p-6 md:p-8 rounded-2xl bg-[#0f1422]/80 border border-[#d4af37]/30 shadow-lg">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6 border-b border-white/10 pb-3">
                    <div className="w-1.5 h-5 sm:h-6 rounded-full bg-[#d4af37] shrink-0"></div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-white break-words">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {data.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                            isOpen
                              ? 'bg-[#161f33] border-[#d4af37]/60'
                              : 'bg-black/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <button
                            onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                            className="w-full text-left p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4"
                          >
                            <span
                              className={`text-xs sm:text-sm font-semibold transition-colors ${
                                isOpen ? 'text-[#f3e5ab]' : 'text-white'
                              }`}
                            >
                              {faq.question}
                            </span>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                                isOpen
                                  ? 'bg-[#d4af37] text-black rotate-180'
                                  : 'bg-white/5 text-[#d4af37]'
                              }`}
                            >
                              <i className="fa-solid fa-chevron-down text-xs"></i>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related Links */}
              <RelatedLinks links={data.relatedLinks} />
            </article>

            {/* Sticky Sidebar (Right ~30%) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 min-w-0">
              {/* Sidebar 1: WhatsApp Instant ID Conversion Card */}
              <div className="glass-card p-6 border border-[#25d366]/40 bg-gradient-to-b from-[#121826] to-[#0a1518] shadow-xl text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#25d366]/20 text-[#25d366] text-3xl mx-auto flex items-center justify-center border border-[#25d366]/40 shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
                <h3 className="text-lg font-bold font-serif text-white">Get Betting ID in 2 Mins</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect directly with Fairplay official desk on WhatsApp for instant login verification and free demo credits.
                </p>

                <div className="bg-black/40 rounded-lg p-3 text-[11px] text-slate-300 space-y-1.5 text-left border border-white/5">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[#25d366]"></i>
                    <span>Instant UPI / IMPS Deposit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[#25d366]"></i>
                    <span>2-Minute Payout Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-[#25d366]"></i>
                    <span>IPL 2026 Special Bonus</span>
                  </div>
                </div>

                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp w-full justify-center text-xs py-3 font-bold shadow-lg"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  <span>WhatsApp Now</span>
                </a>
              </div>

              {/* Sidebar 2: Quick Search */}
              <div className="glass-card p-5 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass text-[#d4af37]"></i>
                  <span>Search Betting Guides</span>
                </h4>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search guides, APK, login..."
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Sidebar 3: Quick Category Links */}
              <div className="glass-card p-5 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-[#d4af37]"></i>
                  <span>Popular Betting Guides</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      to="/fairplay-login/"
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] hover:text-[#d4af37] transition-all"
                    >
                      <span>Fairplay Login Guide</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/fairplay-app/"
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] hover:text-[#d4af37] transition-all"
                    >
                      <span>Fairplay App &amp; APK</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/fairplay-ipl-2026/"
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] hover:text-[#d4af37] transition-all"
                    >
                      <span>IPL 2026 Matches &amp; Odds</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/fairplay-sports/"
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] hover:text-[#d4af37] transition-all"
                    >
                      <span>Sports Betting Guide</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/fairplay-account-security/"
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] hover:text-[#d4af37] transition-all"
                    >
                      <span>Account Security</span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
