import SEO from '@/components/SEO';
import HeroBanner from '@/components/HeroBanner';
import LiveMatches from '@/components/LiveMatches';
import CasinoArcade from '@/components/CasinoArcade';
import AboutSection from '@/components/AboutSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import AppDownloadBanner from '@/components/AppDownloadBanner';
import BetBigSection from '@/components/BetBigSection';
import HomeBlogSection from '@/components/HomeBlogSection';
import FAQSection from '@/components/FAQSection';
import { homePage, faqPage } from '@/data/corePages';
import { SITE_CONFIG } from '@/config/site';

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_CONFIG.siteUrl}/#website`,
        url: `${SITE_CONFIG.siteUrl}/`,
        name: 'Fairplay',
        description: 'Online Sports Betting & Cricket ID Provider in India',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_CONFIG.siteUrl}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.siteUrl}/#organization`,
        name: 'Fairplay',
        url: `${SITE_CONFIG.siteUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_CONFIG.siteUrl}/images/logo.png`,
        },
        sameAs: [SITE_CONFIG.whatsappUrl],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_CONFIG.siteUrl}/#faq`,
        mainEntity: (faqPage.faqs || []).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <SEO
        title="Fairplay Login & Sports ID Provider | Online Cricket Betting ID in India"
        description="Get your verified Fairplay betting ID instantly. Unmatched sports odds, live IPL 2026 coverage, 24/7 instant withdrawals, and round-the-clock WhatsApp support."
        canonical="/"
        keywords={homePage.keywords}
        ogType="website"
        structuredData={structuredData}
      />

      <div className="w-full">
        {/* 1. Hero Slider */}
        <HeroBanner />

        {/* 2. Live Matches & Back/Lay Odds Ticker */}
        <LiveMatches />

        {/* 3. Live Casino & Arcade Cards */}
        <CasinoArcade />

        {/* 4. About Glass Card */}
        <AboutSection />

        {/* 5. Why Choose Us Features */}
        <WhyChooseUs />

        {/* 6. Mobile App & APK Banner */}
        <AppDownloadBanner />

        {/* 7. Bet Big - Win Bigger Promo Banner */}
        <BetBigSection />

        {/* 8. Knowledge Base & Guides Grid */}
        <HomeBlogSection />

        {/* 9. FAQ Accordion */}
        <FAQSection />
      </div>
    </>
  );
}
