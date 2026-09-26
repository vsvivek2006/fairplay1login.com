'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Plus, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CrmNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Hide nav on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    if (!confirm('Sign out of FairPlay?')) return;

    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Signed out successfully.');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Failed to log out.');
      }
    } catch {
      toast.error('Network error during logout.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                FP
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">
                  FairPlay Live <span className="text-indigo-400 font-medium">Articles</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  .io
                </span>
              </div>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  pathname === '/'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                All Articles
              </Link>
              <Link
                href="/admin/blog/new"
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  pathname === '/admin/blog/new'
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Write Article</span>
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Live Site Link */}
            <div className="hidden md:flex items-center">
              <a
                href="https://fairplay1login.com/blogs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl transition-all shadow-sm"
                title="View fairplay1login.com live blogs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>fairplay1login.com</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
            </div>

            {/* Quick Write CTA (Mobile) */}
            <Link
              href="/admin/blog/new"
              className="sm:hidden p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
              title="New Article"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {/* Sign Out */}
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
              title="Sign out of admin"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
