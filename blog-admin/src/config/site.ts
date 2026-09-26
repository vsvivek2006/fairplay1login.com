export interface SiteConfig {
  name: string;
  tagline: string;
  domain: string;
  url: string;
  whatsappUrl: string;
  whatsappRegisterUrl: string;
  whatsappDemoUrl: string;
  whatsappSupportUrl: string;
  loginUrl: string;
  registerUrl: string;
  supportAvailability: string;
  minDeposit: string;
  withdrawalTime: string;
  bonusOffer: string;
  categories: { name: string; slug: string; description: string; icon: string }[];
}

export interface TargetSiteConfig {
  id: string;
  name: string;
  domain: string;
  url: string;
  badge: string;
  badgeColor: string;
  description: string;
  liveBlogsUrl: string;
}

export const TARGET_SITES: Record<string, TargetSiteConfig> = {
  'fairplay1login.com': {
    id: 'fairplay1login.com',
    name: 'FairPlay',
    domain: 'fairplay1login.com',
    url: 'https://fairplay1login.com',
    badge: 'fairplay1login.com',
    badgeColor: 'amber',
    description: 'Live Cricket Exchange & Casino Gaming',
    liveBlogsUrl: 'https://fairplay1login.com/blogs/',
  },
  'fairplaylive.io': {
    id: 'fairplaylive.io',
    name: 'FairPlay Live',
    domain: 'fairplaylive.io',
    url: 'https://fairplaylive.io',
    badge: 'fairplaylive.io',
    badgeColor: 'indigo',
    description: 'Live Cricket Exchange & Casino Gaming',
    liveBlogsUrl: 'https://fairplaylive.io/blogs/',
  },
};

export const DEFAULT_TARGET_SITE = TARGET_SITES['fairplay1login.com'];

export const SITE_CONFIG: SiteConfig = {
  name: 'FairPlay',
  tagline: "India's #1 Trusted Cricket ID, Sports Exchange & Live Casino",
  domain: 'fairplay1login.com',
  url: 'https://fairplay1login.com',
  whatsappUrl: 'https://wa.link/fairplaylive',
  whatsappRegisterUrl: 'https://wa.link/fairplaylive',
  whatsappDemoUrl: 'https://wa.link/fairplaylive',
  whatsappSupportUrl: 'https://wa.link/fairplaylive',
  loginUrl: 'https://fairplay1login.com/fairplay-login/',
  registerUrl: 'https://wa.link/fairplaylive',
  supportAvailability: '24/7 / 365 Days Instant VIP Support',
  minDeposit: '₹100',
  withdrawalTime: '2-Minute Instant Withdrawal',
  bonusOffer: '300% Welcome Bonus on First Deposit',
  categories: [
    {
      name: 'Cricket Betting',
      slug: 'cricket-betting',
      description: 'Live IPL match odds, session bets, toss predictions and bookmaker exchange rates.',
      icon: '🏏',
    },
    {
      name: 'Live Casino',
      slug: 'live-casino',
      description: 'Real-time Teen Patti, Roulette, Andar Bahar, Blackjack and Baccarat with live dealers.',
      icon: '🎰',
    },
    {
      name: 'Betting Guides',
      slug: 'betting-guides',
      description: 'Step-by-step guides for instant deposit, 2-minute withdrawal and ID verification.',
      icon: '📖',
    },
    {
      name: 'IPL 2026',
      slug: 'ipl-2026',
      description: 'Exclusive IPL 2026 tournament insights, team analyses, and match odds forecasts.',
      icon: '🏆',
    },
    {
      name: 'Strategies & Tips',
      slug: 'strategies',
      description: 'Bankroll management and high-probability betting tactics for sports exchanges.',
      icon: '💡',
    },
  ],
};
