import { useState } from 'react';
import { faqPage } from '@/data/corePages';
import { SITE_CONFIG } from '@/config/site';

const additionalFaqs = [
  {
    question: 'How fast are deposits and withdrawals on Fairplay?',
    answer:
      'Deposits are processed instantly via UPI, IMPS, Google Pay, PhonePe, and Net Banking. Withdrawals are processed 24/7 and credited directly into your registered bank account within 2 to 5 minutes with zero withdrawal fee.',
  },
  {
    question: 'What is the minimum deposit required to get a Fairplay Betting ID?',
    answer:
      'You can get started on Fairplay with a minimum deposit of only ₹100. We also provide free demo accounts so you can explore the betting exchange before committing real funds.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const allFaqs = [...(faqPage.faqs || []), ...additionalFaqs];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 lg:py-24 bg-[#070a12] border-t border-white/5 relative">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="title-wrapper">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Got questions about getting your betting ID, logging in, or match rules? Find quick answers below or contact our 24/7 WhatsApp helpdesk.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3 sm:space-y-3.5">
          {allFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`glass-card overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-[#d4af37]/60 bg-[#121826]/90 shadow-[0_0_25px_rgba(212,175,55,0.15)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header Button */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 select-none"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-semibold text-xs sm:text-base transition-colors ${
                      isOpen ? 'text-[#f3e5ab] font-serif' : 'text-white'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#d4af37] text-black rotate-180 shadow-md'
                        : 'bg-white/5 text-[#d4af37]'
                    }`}
                  >
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </div>
                </button>

                {/* Body Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 px-4 sm:px-6 pb-5 sm:pb-6 opacity-100' : 'max-h-0 px-4 sm:px-6 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help CTA banner below FAQ */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#121826] to-[#0d1424] border border-[#d4af37]/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-white font-bold text-sm sm:text-base font-serif">Still have questions?</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Our support specialists are available on WhatsApp 24/7/365.
            </p>
          </div>
          <a
            href={SITE_CONFIG.whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp text-xs px-5 sm:px-6 py-2.5 sm:py-3 font-bold shrink-0 w-full sm:w-auto"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Chat With Support</span>
          </a>
        </div>
      </div>
    </section>
  );
}
