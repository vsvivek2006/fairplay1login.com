import { Link } from 'react-router-dom';
import type { PageLink } from '@/types/PageData';

interface RelatedLinksProps {
  links: PageLink[];
}

export default function RelatedLinks({ links }: RelatedLinksProps) {
  if (!links || !links.length) return null;

  return (
    <section className="mt-14 pt-8 border-t border-white/10">
      <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mb-6 flex items-center gap-2.5">
        <i className="fa-solid fa-link text-[#d4af37] text-base"></i>
        <span>Related Fairplay Guides &amp; Resources</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {links.map((link) => (
          <Link
            key={link.url}
            to={link.url}
            className="flex items-center justify-between p-4 rounded-xl bg-[#121826]/70 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1a2338]/90 transition-all duration-300 group shadow-sm"
          >
            <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-[#f3e5ab] transition-colors">
              {link.text}
            </span>
            <i className="fa-solid fa-arrow-right text-xs text-slate-500 group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all"></i>
          </Link>
        ))}
      </div>
    </section>
  );
}
