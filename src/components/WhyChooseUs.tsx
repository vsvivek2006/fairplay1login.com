import { homePage } from '@/data/corePages';

const featureCards = [
  {
    title: 'Live & Pre-Match Betting',
    image: '/images/live-&-pre-match-betting.jpg',
    desc: 'Feel the rush of betting ball-by-ball with the highest live exchange odds, zero delay, and instant cashout whenever you want.',
  },
  {
    title: 'Instant 2-Minute Withdrawals',
    image: '/images/secure-transactions.jpg',
    desc: 'Deposit with GPay, PhonePe, or UPI and get your winning cash in your bank account in 2 to 5 minutes guaranteed.',
  },
  {
    title: 'Best Odds & Lowest Margin',
    image: '/images/competitive-odds.jpg',
    desc: 'Get more value on every bet across IPL 2026, international cricket, football, and tennis with India’s lowest commission rates.',
  },
  {
    title: '24/7 Live WhatsApp Care',
    image: '/images/24-7-live-coverage.jpg',
    desc: 'Need help or want a new ID? Our dedicated team is available 24 hours a day on WhatsApp for instant assistance.',
  },
];

export default function WhyChooseUs() {
  const whySection = homePage.sections[1];

  return (
    <section id="why-us" className="py-14 sm:py-20 bg-[#070b12] border-t border-b border-white/5 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="title-wrapper">
          <h2 className="section-title">Why Choose Fairplay?</h2>
          <p className="section-subtitle">
            {whySection.paragraphs[0] ||
              'We offer unmatched features tailored for high-stakes sports enthusiasts and casual bettors alike.'}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className="glass-card flex flex-col overflow-hidden p-4 sm:p-6 group hover:border-[#d4af37]/60 transition-all duration-300"
            >
              <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-4 sm:mb-5 bg-[#0a0d14] relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
              </div>

              <h3 className="text-lg font-bold text-[#f3e5ab] mb-2 font-serif group-hover:text-[#d4af37] transition-colors">
                {card.title}
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-auto">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
