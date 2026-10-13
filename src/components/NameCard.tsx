import React, { useState } from 'react';
import { Bookmark, Heart, FileText, Copy, Check, Star } from 'lucide-react';
import { GeneratedName, GeneratorId } from '../types';
import {
  findSavedEntry,
  getStoredRating,
  setStoredRating,
  toggleLikeName,
  toggleSaveName,
} from '../services/storage';

interface NameCardProps {
  item: GeneratedName;
  onOpenNote?: (name: string, generatorId: GeneratorId, style: string) => void;
  onUpdate?: () => void;
}

export const NameCard: React.FC<NameCardProps> = ({
  item,
  onOpenNote,
  onUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const existing = findSavedEntry(item.name, item.generatorId);
  const [isSaved, setIsSaved] = useState(existing?.saved || false);
  const [isLiked, setIsLiked] = useState(existing?.liked || false);
  const [rating, setRating] = useState<number>(getStoredRating(item.name));

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.name);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = item.name;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSaveToggle = () => {
    const newState = toggleSaveName(item.name, item.generatorId, item.style);
    setIsSaved(newState);
    if (onUpdate) onUpdate();
  };

  const handleLikeToggle = () => {
    const newState = toggleLikeName(item.name, item.generatorId, item.style);
    setIsLiked(newState);
    if (onUpdate) onUpdate();
  };

  const handleRate = (r: number) => {
    const next = rating === r ? 0 : r;
    setRating(next);
    setStoredRating(item.name, next);
    if (onUpdate) onUpdate();
  };

  return (
    <article className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#101625] to-[#0d1422] border border-slate-700/60 hover:border-purple-500/60 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-purple-900/20 flex flex-col justify-between text-center">
      {/* Top info */}
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words group-hover:text-cyan-200 transition">
          {item.name}
        </h3>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
            <span>{item.icon}</span>
            <span>{item.style}</span>
          </span>
        </div>

        <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-purple-500/10 border border-purple-400/20 text-purple-300">
          {item.tone}
        </div>

        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed min-h-[48px] line-clamp-3">
          {item.description}
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 line-clamp-2 min-h-[34px]">
          <strong className="text-slate-200">Ideal for:</strong> {item.bestFor}
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-4 space-y-2 pt-3 border-t border-slate-800/80">
        {/* Save / Like grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveToggle}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
              isSaved
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/60'
                : 'bg-[#101a2c] text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-purple-400' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleLikeToggle}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
              isLiked
                ? 'bg-pink-600/30 text-pink-300 border-pink-500/60'
                : 'bg-[#101a2c] text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-pink-400' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
        </div>

        {/* Note & Star Rating row */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            onClick={() => onOpenNote && onOpenNote(item.name, item.generatorId, item.style)}
            className="text-[11px] font-semibold text-slate-400 hover:text-purple-300 transition flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{existing?.note ? 'Edit Note' : 'Add Note'}</span>
          </button>

          {/* 5-star rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <button
                key={starIndex}
                onClick={() => handleRate(starIndex)}
                className="p-0.5 text-slate-600 hover:text-amber-400 hover:scale-110 transition cursor-pointer"
                title={`Rate ${starIndex} stars`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    starIndex <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
            copied
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-[#182236] hover:bg-[#202e48] text-slate-200 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>✓ Copied Name</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Name</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
