import { SITE_CONFIG } from '@/config/site';

export default function WhatsAppFloat() {
  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 md:bottom-8 right-6 z-40">
      <a
        href={SITE_CONFIG.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25d366] text-white text-3xl shadow-[0_4px_25px_rgba(37,211,102,0.6)] hover:bg-[#1ebd56] hover:scale-110 transition-all duration-300 whatsapp-radar"
        aria-label="Contact us on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>

        {/* Hover Tooltip */}
        <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-lg bg-[#0a0d14]/90 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
          Need Help? Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
