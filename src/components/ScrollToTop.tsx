import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that navigating between pages always resets
 * the scroll position to the very top immediately.
 * If a hash anchor is provided (e.g. #live-matches), it scrolls smoothly
 * to the targeted element.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration to avoid sticking at previous scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      // Allow DOM to settle before scrolling to hash target
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // Force instant scroll to top on page change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
}
