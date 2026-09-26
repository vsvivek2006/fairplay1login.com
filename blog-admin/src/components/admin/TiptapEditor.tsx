'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const lastEmittedHtml = useRef<string>(content || '');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-[#d4af37] font-semibold underline decoration-[#d4af37]/70 underline-offset-4 hover:text-[#f3e5ab] hover:decoration-[#f3e5ab] transition-colors cursor-pointer',
        },
      }),
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-[#d4af37]/30 shadow-lg',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'tiptap-editor-surface min-h-[350px] p-5 text-gray-200 focus:outline-none max-w-none text-sm sm:text-base leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
  });

  // Sync external content if updated (e.g. from AI generation)
  useEffect(() => {
    if (editor && content !== lastEmittedHtml.current) {
      lastEmittedHtml.current = content || '';
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#0E1424] min-h-[350px] flex items-center justify-center text-gray-400 text-xs sm:text-sm">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const trimmedUrl = url.trim();
    const isSafeProtocol = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmedUrl);
    if (!isSafeProtocol) {
      alert('Invalid URL scheme. Please use http://, https://, or a relative path.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmedUrl }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      const trimmedUrl = url.trim();
      const isSafeImage = /^(https?:\/\/|\/|data:image\/)/i.test(trimmedUrl);
      if (!isSafeImage) {
        alert('Invalid image URL scheme. Please provide an https:// image link or relative asset path.');
        return;
      }
      editor.chain().focus().setImage({ src: trimmedUrl }).run();
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-[#0E1424] overflow-hidden shadow-sm transition-all focus-within:border-[#d4af37]/50 focus-within:ring-1 focus-within:ring-[#d4af37]/40">
      {/* Floating Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#121829] border-b border-gray-800/80 text-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('blockquote')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Pro Tip / Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-xs hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-800 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            editor.isActive('link')
              ? 'bg-[#d4af37]/20 text-[#f3e5ab] font-bold'
              : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-lg text-xs hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Insert Image by URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-xs hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-xs hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
