'use client';

import React, { useState, useMemo } from 'react';
import assets from '@/data/fairplay_assets.json';
import { Search, X, Check, Image as ImageIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentSelectedUrl?: string | null;
}

export default function AssetPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedUrl,
}: AssetPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Cricket', 'Casino', 'Sports', 'Payments', 'Mobile'];

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesCategory =
        selectedCategory === 'All' || a.category === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success('Image link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141B2D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Choose a Cover Photo
              </h2>
              <p className="text-xs text-gray-400">
                Pick a high-quality photo for your article
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#131A2B] border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search photos..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Assets Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = currentSelectedUrl === asset.url;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  onSelectImage(asset.url);
                  toast.success('Photo selected!');
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-[4/3] bg-black/40 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={asset.url}
                  alt={asset.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-indigo-300 border border-white/10 backdrop-blur-sm">
                  {asset.category}
                </div>

                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white line-clamp-1">
                    {asset.title}
                  </span>
                  <button
                    onClick={(e) => handleCopy(asset.url, e)}
                    className="p-1 rounded bg-black/60 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                    title="Copy image URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
