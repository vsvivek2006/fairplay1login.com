import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import CrmNav from '@/components/CrmNav';
import ToasterClient from '@/components/ToasterClient';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FairPlay Blog Studio | fairplay1login.com',
  description: 'Internal platform for writing and publishing articles to fairplay1login.com',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-[#090D16] text-zinc-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        <CrmNav />
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
        <ToasterClient />
      </body>
    </html>
  );
}
