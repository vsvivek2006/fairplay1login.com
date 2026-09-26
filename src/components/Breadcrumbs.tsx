import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  items: { name: string; url: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="w-full py-4 text-xs sm:text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-slate-400">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="text-[#d4af37] hover:text-[#f3e5ab] transition-colors flex items-center gap-1">
            <i className="fa-solid fa-house text-xs"></i>
            <span>Home</span>
          </Link>
        </li>
        {items.filter(i => i.url !== '/').map((item, index, arr) => {
          const isLast = index === arr.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-2">
              <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
              {isLast ? (
                <span className="text-[#f3e5ab] font-medium truncate max-w-[200px] sm:max-w-md">
                  {item.name}
                </span>
              ) : (
                <Link to={item.url} className="hover:text-[#d4af37] transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
