import { useState, useEffect, useRef, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { useAuthModal } from '@/context/AuthModalContext';
import { SITE_CONFIG } from '@/config/site';

export default function AuthModal() {
  const { isOpen, activeTab, closeAuthModal, setActiveTab } = useAuthModal();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPromoCode, setRegPromoCode] = useState('WELCOME300');
  const [regAgree, setRegAgree] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAuthModal();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      // Reset simulated states when closed
      setLoginLoading(false);
      setLoginSuccess(false);
      setRegLoading(false);
      setRegError('');
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  // Handle Login submission (pure client-side simulated auth + WhatsApp gateway)
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;

    setLoginLoading(true);
    setLoginSuccess(false);

    setTimeout(() => {
      setLoginLoading(false);
      setLoginSuccess(true);

      // Trigger celebratory confetti on successful authentication
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#25d366'],
      });

      // Redirect to WhatsApp 24/7 gateway after 1.2 seconds
      setTimeout(() => {
        window.open(SITE_CONFIG.whatsappLoginUrl, '_blank');
        closeAuthModal();
      }, 1400);
    }, 1200);
  };

  // Handle Register submission (pure client-side simulated registration + WhatsApp activation)
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regAgree) {
      setRegError('You must confirm you are 18+ and agree to Terms.');
      return;
    }

    setRegLoading(true);

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffb574', '#25d366', '#00f2fe'],
    });

    setTimeout(() => {
      setRegLoading(false);
      window.open(SITE_CONFIG.whatsappRegisterUrl, '_blank');
      closeAuthModal();
    }, 1200);
  };

  const handleForgotPassword = () => {
    window.open(SITE_CONFIG.whatsappSupportUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#0f1422] border border-[#d4af37]/35 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10 my-auto"
      >
        {/* Ambient radial gold glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#25d366]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-4 sm:pb-5 border-b border-white/10 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/images/logo.png"
              alt="Fairplay"
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <div>
              <div className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase">
                Official VIP Portal
              </div>
              <div id="auth-modal-title" className="text-[11px] sm:text-xs text-slate-400">
                Quick ID, 100% Safe &amp; Instant Payouts
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 transition-all flex items-center justify-center text-sm shrink-0"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* 3 Tab Navigation Header */}
        <div className="relative grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
          {/* Tab 1: WhatsApp Quick ID */}
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'whatsapp'
                ? 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-brands fa-whatsapp text-sm text-[#25d366]"></i>
            <span>Quick ID</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] bg-[#25d366]/30 text-white font-bold">
              Instant
            </span>
          </button>

          {/* Tab 2: User Login */}
          <button
            onClick={() => setActiveTab('login')}
            className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-right-to-bracket text-sm text-[#d4af37]"></i>
            <span>Login</span>
          </button>

          {/* Tab 3: Register */}
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-[#d4af37]/30 to-[#ffb574]/30 text-white border border-[#d4af37]/50 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-user-plus text-sm text-[#ffb574]"></i>
            <span>Register</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] bg-[#d4af37] text-black font-bold">
              +300%
            </span>
          </button>
        </div>

        {/* TAB 1: WhatsApp Quick ID */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Get Instant Betting ID in <span className="text-[#25d366]">2 Minutes</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Chat directly with our 24/7 team on WhatsApp to get your betting ID in 2 minutes with an instant 300% bonus!
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <span><strong>Instant UPI &amp; GPay Deposits</strong> — Start playing in 2 mins</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-gift"></i>
                </div>
                <span><strong>300% Welcome Bonus</strong> on your very first deposit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#00f2fe]/20 text-[#00f2fe] flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <span><strong>2-Minute Withdrawals</strong> guaranteed round the clock</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <span><strong>100% Safe &amp; Private</strong> — No complicated paperwork</span>
              </div>
            </div>

            {/* Direct 1-Click WhatsApp Button */}
            <a
              href={SITE_CONFIG.whatsappRegisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.6 },
                });
                closeAuthModal();
              }}
              className="btn btn-whatsapp w-full py-4 text-sm sm:text-base font-bold shadow-xl flex items-center justify-center gap-3 relative group"
            >
              <i className="fa-brands fa-whatsapp text-2xl group-hover:scale-110 transition-transform"></i>
              <span>Connect on WhatsApp Now</span>
            </a>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <i className="fa-solid fa-shield-halved text-[#d4af37]"></i>
              <span>Official Fairplay Representative • 24/7 Live Response</span>
            </div>
          </div>
        )}

        {/* TAB 2: User Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Member Login
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered ID or mobile number to access your betting account.
              </p>
            </div>

            {loginSuccess ? (
              <div className="p-5 rounded-2xl bg-[#25d366]/15 border border-[#25d366]/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#25d366]/20 text-[#25d366] text-2xl mx-auto flex items-center justify-center">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h4 className="text-base font-bold text-white">Verification Successful!</h4>
                <p className="text-xs text-slate-300">
                  Connecting you to Fairplay live betting on WhatsApp...
                </p>
              </div>
            ) : (
              <>
                {/* Username / Mobile Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username / Registered Mobile
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      <i className="fa-solid fa-user"></i>
                    </span>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. fairplay_user or 9876543210"
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d4af37] rounded"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[#d4af37] hover:text-[#f3e5ab] transition-colors underline text-xs"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn btn-gold btn-shimmer w-full py-3.5 text-xs sm:text-sm font-bold shadow-xl justify-center mt-2 flex items-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-right-to-bracket"></i>
                      <span>Sign In to Fairplay</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Switch to Register */}
            <div className="text-center pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400">Don't have an ID yet? </span>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] transition-colors"
              >
                Register & Get 300% Bonus →
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f3e5ab] text-[11px] font-bold mb-2">
                <i className="fa-solid fa-gift text-[#d4af37]"></i>
                <span>300% WELCOME BONUS INCLUDED</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Create Your Betting ID
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant 2-minute activation with dedicated WhatsApp VIP support.
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-red-400"></i>
                <span>{regError}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  <i className="fa-solid fa-id-card"></i>
                </span>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp / Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl bg-white/5 border border-r-0 border-white/10 text-slate-400 text-xs font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-r-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
            </div>

            {/* Referral / Promo Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Promo / Referral Code</span>
                <span className="text-[10px] text-[#25d366] font-semibold">Active: +300% Bonus</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  <i className="fa-solid fa-ticket"></i>
                </span>
                <input
                  type="text"
                  value={regPromoCode}
                  onChange={(e) => setRegPromoCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME300"
                  className="w-full bg-[#0a0d14] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-[#f3e5ab] font-bold placeholder-slate-500 focus:outline-none focus:border-[#d4af37] uppercase tracking-wider"
                />
              </div>
            </div>

            {/* 18+ Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={regAgree}
                  onChange={(e) => setRegAgree(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#d4af37] rounded mt-0.5"
                />
                <span>
                  I confirm that I am 18 years or older and accept Fairplay's Terms of Service and Responsible Gaming Policy.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={regLoading}
              className="btn btn-gold btn-shimmer w-full py-3.5 text-xs sm:text-sm font-bold shadow-xl justify-center mt-2 flex items-center gap-2"
            >
              {regLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Activating Your Betting ID...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Claim 300% Bonus & Activate ID</span>
                </>
              )}
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400">Already have an ID? </span>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] transition-colors"
              >
                Sign In Here →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
