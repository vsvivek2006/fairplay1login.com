import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SITE_CONFIG } from '@/config/site';
import { useAuthModal } from '@/context/AuthModalContext';

interface Slide {
  image: string;
  subtitle: string;
  titlePrefix: string;
  titleHighlight: string;
  desc: string;
  primaryCta: string;
  primaryIcon: string;
}

const slides: Slide[] = [
  {
    image: '/images/home-banner-1.jpg',
    subtitle: "India's #1 Trusted Betting ID Provider",
    titlePrefix: 'Fairplay Official ID —',
    titleHighlight: 'Online Cricket & Sports Betting',
    desc: 'Get your verified Fairplay betting ID instantly. Unmatched sports odds, live IPL 2026 coverage, 24/7 instant withdrawals, and round-the-clock WhatsApp support.',
    primaryCta: 'Register Now',
    primaryIcon: 'fa-user-plus',
  },
  {
    image: '/images/home-banner-2.jpg',
    subtitle: 'Ultimate Cricket Experience',
    titlePrefix: 'Live Match',
    titleHighlight: 'Action & Fast Odds',
    desc: 'Bet live on IPL 2026, World Cup, and International Cricket matches with highest market margins and zero delay.',
    primaryCta: 'Start Betting',
    primaryIcon: 'fa-play',
  },
  {
    image: '/images/home-banner-3.jpg',
    subtitle: 'Instant Payout Guarantee',
    titlePrefix: '100% Secure',
    titleHighlight: '& Lightning Fast',
    desc: 'Deposits & Withdrawals processed within 2 minutes. Transparent, reliable, and trusted by millions.',
    primaryCta: 'Claim Your ID',
    primaryIcon: 'fa-shield-halved',
  },
  {
    image: '/images/home-banner-4.jpg',
    subtitle: '24/7 Dedicated Support',
    titlePrefix: 'Win Big With',
    titleHighlight: 'Fairplay',
    desc: "Join India's largest sports betting family. Enjoy 100% safe gaming, fast payouts, and round-the-clock VIP support.",
    primaryCta: 'Register Today',
    primaryIcon: 'fa-trophy',
  },
];

export default function HeroBanner() {
  const { openAuthModal } = useAuthModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleRegisterClick = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#d4af37', '#ffb574', '#25d366', '#ffffff'],
    });
    openAuthModal('register');
  };

  return (
    <section
      className="relative w-full min-h-[520px] sm:min-h-[600px] lg:h-screen lg:min-h-[640px] lg:max-h-[920px] overflow-hidden bg-[#0a0d14] flex items-center justify-center pt-20 sm:pt-24 pb-14 sm:pb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="home"
    >
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          {/* Dark luxury gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/75 via-[#0a0d14]/65 to-[#0a0d14] pointer-events-none" />
        </div>
      ))}

      {/* Slide Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col justify-center items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15 text-[#f3e5ab] text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3 sm:mb-5 shadow-sm backdrop-blur-md">
          <i className="fa-solid fa-crown text-[#d4af37] text-xs"></i>
          <span>{slides[currentSlide].subtitle}</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight leading-tight sm:leading-[1.15] mb-3 sm:mb-6 drop-shadow-2xl">
          {slides[currentSlide].titlePrefix}{' '}
          <span className="block mt-0.5 sm:inline sm:mt-0 bg-gradient-to-r from-white via-[#ffb574] to-[#ff6b18] bg-clip-text text-transparent">
            {slides[currentSlide].titleHighlight}
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-xl mx-auto mb-5 sm:mb-8 leading-relaxed font-normal drop-shadow line-clamp-3 sm:line-clamp-none">
          {slides[currentSlide].desc}
        </p>

        {/* Dual CTAs (Responsive Stack on Mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <button
            onClick={handleRegisterClick}
            className="btn btn-gold btn-shimmer text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 shadow-xl font-bold flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${slides[currentSlide].primaryIcon} text-xs`}></i>
            <span>{slides[currentSlide].primaryCta}</span>
          </button>

          <a
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 shadow-xl font-bold flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-whatsapp text-base sm:text-lg"></i>
            <span>Get ID on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Navigation Arrows (Hidden on Mobile to Prevent Clipping/Overlapping) */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a0d14]/70 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black items-center justify-center backdrop-blur-md transition-all shadow-lg"
        aria-label="Previous Slide"
      >
        <i className="fa-solid fa-chevron-left text-xs sm:text-sm"></i>
      </button>

      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a0d14]/70 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black items-center justify-center backdrop-blur-md transition-all shadow-lg"
        aria-label="Next Slide"
      >
        <i className="fa-solid fa-chevron-right text-xs sm:text-sm"></i>
      </button>

      {/* Pagination Bullets */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.7)]'
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
