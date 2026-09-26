'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Image as ImageIcon, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const PRESET_COVERS = [
  { label: 'Cricket Exchange', url: '/images/blog-cricket-betting-exchange.jpg' },
  { label: 'Live Betting', url: '/images/blog-online-cricket-betting.jpg' },
  { label: 'Live Casino', url: '/images/blog-casino-game-betting.jpg' },
];

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, WebP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeded', {
        description: 'Maximum image size is 5MB.',
      });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Processing image asset...');

    try {
      // Create local object URL for preview and form binding
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
      toast.success('Image selected successfully', { id: toastId });
    } catch {
      toast.error('Failed to load image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    toast.info('Cover image cleared');
  };

  const applyCustomUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setShowCustomUrlInput(false);
      setCustomUrl('');
      toast.success('Cover image URL updated');
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900 group aspect-video max-h-64 w-full flex items-center justify-center shadow-md">
          <Image
            src={value}
            alt="Cover preview"
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {/* Action Overlay */}
          <div className="absolute inset-0 bg-gray-950/75 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37] hover:bg-[#b89628] text-black shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onChange(url);
            }
          }}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative overflow-hidden ${
            isDragOver
              ? 'border-[#d4af37] bg-[#d4af37]/10'
              : 'border-gray-700 hover:border-[#d4af37]/60 bg-gray-800/40 hover:bg-gray-800/70'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-300 py-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
              <p className="text-xs font-semibold text-white">Loading cover image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
              <div className="p-2.5 rounded-xl bg-gray-800 text-gray-300 border border-gray-700">
                <Upload className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div className="text-xs text-gray-300">
                <span className="font-semibold text-[#f3e5ab] hover:underline">
                  Click to browse
                </span>{' '}
                or drag and drop here
              </div>
              <p className="text-[11px] text-gray-500">Supports PNG, JPG, WebP</p>
            </div>
          )}
        </div>
      )}

      {/* Preset Banner Quick Selection */}
      <div className="pt-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>Or choose preset cover:</span>
          <button
            type="button"
            onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
            className="text-[#d4af37] hover:underline text-[10px] font-semibold"
          >
            {showCustomUrlInput ? 'Cancel URL' : 'Enter Image URL'}
          </button>
        </div>

        {showCustomUrlInput && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="https://.../image.webp"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
            />
            <button
              type="button"
              onClick={applyCustomUrl}
              className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#b89628]"
            >
              Set
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {PRESET_COVERS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                value === preset.url
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f3e5ab] font-bold'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
