import { lazy, Suspense } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageRenderer from '@/components/PageRenderer';
import SEO from '@/components/SEO';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import StickyBottomNav from '@/components/StickyBottomNav';
import HomePage from '@/pages/HomePage';
import { AuthModalProvider } from '@/context/AuthModalContext';
import AuthModal from '@/components/AuthModal';
import ScrollToTop from '@/components/ScrollToTop';

const BlogListPage = lazy(() => import('@/pages/BlogListPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));

import {
  aboutPage,
  contactPage,
  faqPage,
  helpCenterPage,
  editorialPolicyPage,
  accessibilityPage,
} from '@/data/corePages';

import {
  fairplayHubPage,
  fairplayGuidePage,
  fairplayFeaturesPage,
  fairplayOverviewPage,
  fairplay2026Page,
  fairplayOnlinePage,
  myFairplayPage,
  fairplayProPage,
  fairplay24Page,
  fairplayClubPage,
  fairplayGlobalPage,
  fairplayWebsitePage,
  fairplayMobilePage,
  fairplayUpdatesPage,
} from '@/data/fairplayPages';

import {
  fairplayAppPage,
  fairplayAppGuidePage,
  fairplayDownloadPage,
  fairplayDownloadGuidePage,
  fairplayAPKPage,
  fairplayAPKGuidePage,
  fairplayAPKInstallationPage,
  fairplayAppInstallationPage,
  fairplayLatestVersionPage,
  fairplayAppUpdatesPage,
  fairplayMobileAppGuidePage,
  fairplayAppFeaturesPage,
} from '@/data/appPages';

import {
  fairplayLoginPage,
  fairplayLoginGuidePage,
  fairplayRegisterPage,
  fairplayRegistrationGuidePage,
  fairplayAccountPage,
  fairplayPasswordHelpPage,
  fairplayLoginTroubleshootingPage,
  fairplayRegistrationHelpPage,
  fairplayAccountSecurityPage,
} from '@/data/loginPages';

import {
  howFairplayWorksPage,
  fairplayBeginnerGuidePage,
  fairplayUserGuidePage,
  fairplayMobileGuidePage,
  fairplayWebsiteGuidePage,
  fairplayFeaturesGuidePage,
  fairplayHelpGuidePage,
  fairplayTroubleshootingPage,
  fairplayCommonQuestionsPage,
  fairplaySafetyGuidePage,
  fairplayResponsibleUsePage,
} from '@/data/guidePages';

import {
  fairplaySportsPage,
  fairplayIPL2026Page,
  fairplayIPLGuidePage,
  fairplayAwardIPL2026Page,
  fairplaySportsUpdatesPage,
} from '@/data/sportsPages';

import {
  privacyPolicyPage,
  termsPage,
  disclaimerPage,
  cookiePolicyPage,
  securityPolicyPage,
  responsibleUsePolicyPage,
} from '@/data/legalPages';

function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | Fairplay"
        description="The page you are looking for does not exist. Explore our betting guides or return to homepage."
        robots="noindex, nofollow"
      />
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-3xl mx-auto flex items-center justify-center mb-6">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white mb-4">404 — Page Not Found</h1>
        <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been relocated. Explore our guides or return to homepage.
        </p>
        <Link
          to="/"
          className="btn btn-gold text-xs sm:text-sm px-6 py-3 font-bold inline-flex items-center gap-2"
        >
          <i className="fa-solid fa-house"></i>
          <span>Return to Homepage</span>
        </Link>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthModalProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-white">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<div className="min-h-screen bg-[#0a0d14]" />}>
            <Routes>
            {/* Homepage with all target luxury components */}
            <Route path="/" element={<HomePage />} />

            {/* Official Blog & Guides with Canonical Redirects */}
            <Route path="/blog" element={<Navigate to="/blogs/" replace />} />
            <Route path="/blog/" element={<Navigate to="/blogs/" replace />} />
            <Route path="/blogs" element={<Navigate to="/blogs/" replace />} />
            <Route path="/blogs/" element={<BlogListPage />} />
            <Route path="/blog/:slug/" element={<BlogPostPage />} />
            <Route path="/blogs/:slug/" element={<BlogPostPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />

            {/* Core Pages */}
            <Route path="/about/" element={<PageRenderer data={aboutPage} />} />
            <Route path="/contact/" element={<PageRenderer data={contactPage} />} />
            <Route path="/faq/" element={<PageRenderer data={faqPage} />} />
            <Route path="/help/" element={<PageRenderer data={helpCenterPage} />} />
            <Route path="/editorial-policy/" element={<PageRenderer data={editorialPolicyPage} />} />
            <Route path="/accessibility/" element={<PageRenderer data={accessibilityPage} />} />

            {/* Fairplay Main Topic */}
            <Route path="/fairplay/" element={<PageRenderer data={fairplayHubPage} />} />
            <Route path="/fairplay-guide/" element={<PageRenderer data={fairplayGuidePage} />} />
            <Route path="/fairplay-features/" element={<PageRenderer data={fairplayFeaturesPage} />} />
            <Route path="/fairplay-overview/" element={<PageRenderer data={fairplayOverviewPage} />} />
            <Route path="/fairplay-2026/" element={<PageRenderer data={fairplay2026Page} />} />
            <Route path="/fairplay-online/" element={<PageRenderer data={fairplayOnlinePage} />} />
            <Route path="/my-fairplay/" element={<PageRenderer data={myFairplayPage} />} />
            <Route path="/fairplay-pro/" element={<PageRenderer data={fairplayProPage} />} />
            <Route path="/fairplay-24/" element={<PageRenderer data={fairplay24Page} />} />
            <Route path="/fairplay-club/" element={<PageRenderer data={fairplayClubPage} />} />
            <Route path="/fairplay-global/" element={<PageRenderer data={fairplayGlobalPage} />} />
            <Route path="/fairplay-website/" element={<PageRenderer data={fairplayWebsitePage} />} />
            <Route path="/fairplay-mobile/" element={<PageRenderer data={fairplayMobilePage} />} />
            <Route path="/fairplay-updates/" element={<PageRenderer data={fairplayUpdatesPage} />} />

            {/* App / Download Cluster */}
            <Route path="/fairplay-app/" element={<PageRenderer data={fairplayAppPage} />} />
            <Route path="/fairplay-app-guide/" element={<PageRenderer data={fairplayAppGuidePage} />} />
            <Route path="/fairplay-download/" element={<PageRenderer data={fairplayDownloadPage} />} />
            <Route path="/fairplay-download-guide/" element={<PageRenderer data={fairplayDownloadGuidePage} />} />
            <Route path="/fairplay-apk/" element={<PageRenderer data={fairplayAPKPage} />} />
            <Route path="/fairplay-apk-guide/" element={<PageRenderer data={fairplayAPKGuidePage} />} />
            <Route path="/fairplay-apk-installation/" element={<PageRenderer data={fairplayAPKInstallationPage} />} />
            <Route path="/fairplay-app-installation/" element={<PageRenderer data={fairplayAppInstallationPage} />} />
            <Route path="/fairplay-latest-version/" element={<PageRenderer data={fairplayLatestVersionPage} />} />
            <Route path="/fairplay-app-updates/" element={<PageRenderer data={fairplayAppUpdatesPage} />} />
            <Route path="/fairplay-mobile-app/" element={<PageRenderer data={fairplayMobileAppGuidePage} />} />
            <Route path="/fairplay-app-features/" element={<PageRenderer data={fairplayAppFeaturesPage} />} />

            {/* Login / Account Cluster */}
            <Route path="/fairplay-login/" element={<PageRenderer data={fairplayLoginPage} />} />
            <Route path="/fairplay-login-guide/" element={<PageRenderer data={fairplayLoginGuidePage} />} />
            <Route path="/fairplay-register/" element={<PageRenderer data={fairplayRegisterPage} />} />
            <Route path="/fairplay-registration-guide/" element={<PageRenderer data={fairplayRegistrationGuidePage} />} />
            <Route path="/fairplay-account/" element={<PageRenderer data={fairplayAccountPage} />} />
            <Route path="/fairplay-password-help/" element={<PageRenderer data={fairplayPasswordHelpPage} />} />
            <Route path="/fairplay-login-troubleshooting/" element={<PageRenderer data={fairplayLoginTroubleshootingPage} />} />
            <Route path="/fairplay-registration-help/" element={<PageRenderer data={fairplayRegistrationHelpPage} />} />
            <Route path="/fairplay-account-security/" element={<PageRenderer data={fairplayAccountSecurityPage} />} />

            {/* Guides / Information */}
            <Route path="/how-fairplay-works/" element={<PageRenderer data={howFairplayWorksPage} />} />
            <Route path="/fairplay-beginner-guide/" element={<PageRenderer data={fairplayBeginnerGuidePage} />} />
            <Route path="/fairplay-user-guide/" element={<PageRenderer data={fairplayUserGuidePage} />} />
            <Route path="/fairplay-mobile-guide/" element={<PageRenderer data={fairplayMobileGuidePage} />} />
            <Route path="/fairplay-website-guide/" element={<PageRenderer data={fairplayWebsiteGuidePage} />} />
            <Route path="/fairplay-features-guide/" element={<PageRenderer data={fairplayFeaturesGuidePage} />} />
            <Route path="/fairplay-help-guide/" element={<PageRenderer data={fairplayHelpGuidePage} />} />
            <Route path="/fairplay-troubleshooting/" element={<PageRenderer data={fairplayTroubleshootingPage} />} />
            <Route path="/fairplay-common-questions/" element={<PageRenderer data={fairplayCommonQuestionsPage} />} />
            <Route path="/fairplay-safety-guide/" element={<PageRenderer data={fairplaySafetyGuidePage} />} />
            <Route path="/fairplay-responsible-use/" element={<PageRenderer data={fairplayResponsibleUsePage} />} />

            {/* Sports / IPL Information */}
            <Route path="/fairplay-sports/" element={<PageRenderer data={fairplaySportsPage} />} />
            <Route path="/fairplay-ipl-2026/" element={<PageRenderer data={fairplayIPL2026Page} />} />
            <Route path="/fairplay-ipl-guide/" element={<PageRenderer data={fairplayIPLGuidePage} />} />
            <Route path="/fairplay-award-ipl-2026/" element={<PageRenderer data={fairplayAwardIPL2026Page} />} />
            <Route path="/fairplay-sports-updates/" element={<PageRenderer data={fairplaySportsUpdatesPage} />} />

            {/* Legal / Trust */}
            <Route path="/privacy-policy/" element={<PageRenderer data={privacyPolicyPage} />} />
            <Route path="/terms/" element={<PageRenderer data={termsPage} />} />
            <Route path="/disclaimer/" element={<PageRenderer data={disclaimerPage} />} />
            <Route path="/cookie-policy/" element={<PageRenderer data={cookiePolicyPage} />} />
            <Route path="/security-policy/" element={<PageRenderer data={securityPolicyPage} />} />
            <Route path="/responsible-use-policy/" element={<PageRenderer data={responsibleUsePolicyPage} />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
        <Footer />
        <WhatsAppFloat />
        <StickyBottomNav />
        <AuthModal />
      </div>
    </AuthModalProvider>
  );
}

export default App;
