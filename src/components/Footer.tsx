import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-[#05070a] border-t border-white/10 text-slate-400 pt-12 sm:pt-16 pb-28 md:pb-14 mt-12 sm:mt-16 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 pb-10 border-b border-white/10">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src="/images/logo.png" alt="Fairplay" className="h-9 sm:h-11 w-auto object-contain" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              India's premier verified sports ID provider. Delivering transparent exchange odds, instant 2-minute withdrawals, and bank-grade data security 24 hours a day, 365 days a year.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-xs font-black shrink-0">
                18+
              </div>
              <div className="text-[11px] text-slate-400">
                Play Responsibly • Age Restriction Applies
              </div>
            </div>
          </div>

          {/* Column 2: Helpful Guides */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm sm:text-base tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-7 after:h-0.5 after:bg-[#d4af37]">
              Helpful Guides
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-[#d4af37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/fairplay-beginner-guide/" className="hover:text-[#d4af37] transition-colors">
                  Beginner Setup Guide
                </Link>
              </li>
              <li>
                <Link to="/how-fairplay-works/" className="hover:text-[#d4af37] transition-colors">
                  How Fairplay Works
                </Link>
              </li>
              <li>
                <Link to="/fairplay-features/" className="hover:text-[#d4af37] transition-colors">
                  Top Features &amp; Bonuses
                </Link>
              </li>
              <li>
                <Link to="/fairplay-updates/" className="hover:text-[#d4af37] transition-colors">
                  What's New in 2026
                </Link>
              </li>
              <li>
                <Link to="/blogs/" className="hover:text-[#d4af37] transition-colors font-medium text-[#f3e5ab]">
                  Blog &amp; Betting Guides
                </Link>
              </li>
              <li>
                <Link to="/about/" className="hover:text-[#d4af37] transition-colors">
                  About Fairplay
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & App */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm sm:text-base tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-7 after:h-0.5 after:bg-[#d4af37]">
              Account &amp; Mobile App
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/fairplay-login/" className="hover:text-[#d4af37] transition-colors">
                  Fairplay Login Guide
                </Link>
              </li>
              <li>
                <Link to="/fairplay-register/" className="hover:text-[#d4af37] transition-colors">
                  Fairplay Registration
                </Link>
              </li>
              <li>
                <Link to="/fairplay-app/" className="hover:text-[#d4af37] transition-colors">
                  Fairplay App Download
                </Link>
              </li>
              <li>
                <Link to="/fairplay-apk/" className="hover:text-[#d4af37] transition-colors">
                  Android APK Download
                </Link>
              </li>
              <li>
                <Link to="/fairplay-account-security/" className="hover:text-[#d4af37] transition-colors">
                  Safe &amp; Secure Gaming
                </Link>
              </li>
              <li>
                <Link to="/fairplay-troubleshooting/" className="hover:text-[#d4af37] transition-colors">
                  Login &amp; Account Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Sports & Support */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm sm:text-base tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-7 after:h-0.5 after:bg-[#d4af37]">
              Sports &amp; WhatsApp Care
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/fairplay-ipl-2026/" className="hover:text-[#d4af37] transition-colors">
                  IPL 2026 Matches &amp; Odds
                </Link>
              </li>
              <li>
                <Link to="/fairplay-sports/" className="hover:text-[#d4af37] transition-colors">
                  Live Cricket &amp; Sports Odds
                </Link>
              </li>
              <li>
                <Link to="/faq/" className="hover:text-[#d4af37] transition-colors">
                  FAQ Hub
                </Link>
              </li>
              <li>
                <Link to="/help/" className="hover:text-[#d4af37] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact/" className="hover:text-[#d4af37] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>

            <div className="mt-4">
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2 w-full"
              >
                <i className="fa-brands fa-whatsapp text-base"></i>
                <span>24/7 Official Care</span>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="py-5 sm:py-6 border-b border-white/5 text-[11px] text-slate-500 leading-relaxed text-center">
          Disclaimer: This website provides information, guides, and customer care assistance for the Fairplay platform. Users must be 18 years or older. Online sports gaming involves risk. Please gamble responsibly and adhere to all applicable jurisdictional regulations.
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Fairplay (fairplay1login.com). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link to="/privacy-policy/" className="hover:text-[#d4af37] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms/" className="hover:text-[#d4af37] transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/disclaimer/" className="hover:text-[#d4af37] transition-colors">
              Disclaimer
            </Link>
            <Link to="/cookie-policy/" className="hover:text-[#d4af37] transition-colors">
              Cookie Policy
            </Link>
            <Link to="/security-policy/" className="hover:text-[#d4af37] transition-colors">
              Security Policy
            </Link>
            <Link to="/responsible-use-policy/" className="hover:text-[#d4af37] transition-colors">
              Responsible Gaming
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
