import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostEditor } from '@/components/admin/PostEditor';

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
        <Link
          href="/"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Create Blog Post</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
              FairPlay Live
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Write manually or generate full structured articles with AI, real-time slug generation, and rich Tiptap editor.
          </p>
        </div>
      </div>

      <PostEditor />
    </div>
  );
}
