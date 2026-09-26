import React from 'react';
import { MessageCircle, ShieldCheck, Zap, Gift } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface FairPlayCtaBoxProps {
  className?: string;
}

export default function FairPlayCtaBox({ className = '' }: FairPlayCtaBoxProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151D30] via-[#101728] to-[#0D1220] border border-indigo-500/30 p-6 sm:p-8 shadow-xl ${className}`}
    >
      {/* Background glow effects */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>300% Welcome Bonus Live</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Get Your Official <span className="text-indigo-400">FairPlay Cricket ID</span>
          </h3>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl">
            Join India&apos;s most reliable sports exchange. Instant ID activation via WhatsApp, 2-minute guaranteed bank payouts, and 24/7 dedicated VIP assistance.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 2-Min UPI Cashout
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Safe &amp; Verified
            </span>
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-indigo-400" /> Min Deposit ₹100
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto flex-shrink-0">
          <a
            href={SITE_CONFIG.whatsappRegisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-base shadow-primary-glow transition-all transform hover:-translate-y-0.5 text-center"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Get WhatsApp ID</span>
          </a>
          <a
            href={SITE_CONFIG.whatsappDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/15 text-gray-200 font-semibold text-sm hover:border-indigo-400 hover:text-white transition-all text-center"
          >
            <span>Request Demo ID</span>
          </a>
        </div>
      </div>
    </div>
  );
}
