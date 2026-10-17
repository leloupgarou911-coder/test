import React, { useState } from 'react';
import { Bookmark, Heart, FileText, Copy, Check, Star, Info, Volume2 } from 'lucide-react';
import { GeneratedName, GeneratorId } from '../types';
import {
  findSavedEntry,
  getStoredRating,
  setStoredRating,
  toggleLikeName,
  toggleSaveName,
} from '../services/storage';
import { NameDetailsModal } from './NameDetailsModal';
import { getAppSettings } from '../services/settings';
import { getTranslations } from '../i18n';

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
  const [showDetails, setShowDetails] = useState(false);
  const existing = findSavedEntry(item.name, item.generatorId);
  const [isSaved, setIsSaved] = useState(existing?.saved || false);
  const [isLiked, setIsLiked] = useState(existing?.liked || false);
  const [rating, setRating] = useState<number>(getStoredRating(item.name));

  const settings = getAppSettings();
  const t = getTranslations(settings.language).nameCard;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.name);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

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
    <>
      {showDetails && (
        <NameDetailsModal
          nameItem={item}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
        />
      )}

      <article className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#11182c] to-[#0a101d] border border-slate-700/70 hover:border-purple-500/80 transition-all duration-200 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-purple-900/30 flex flex-col justify-between text-center">
        {/* Top info */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-xs sm:text-sm font-bold text-pink-400 flex items-center gap-1.5">
              <span className="text-base">{item.icon}</span>
              <span>{item.style}</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Audio speech synthesis button */}
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
                title="Écouter la prononciation"
                aria-label={`Écouter la prononciation de ${item.name}`}
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
              </button>

              {/* Details trigger button */}
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs font-semibold text-slate-300 hover:text-cyan-300 transition flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer border border-slate-700/60"
                title={t.details}
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.details}</span>
              </button>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words group-hover:text-cyan-200 transition mt-3">
            {item.name}
          </h3>

          <div className="inline-block mt-2.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500/15 border border-purple-400/30 text-purple-300">
            {item.tone}
          </div>

          <p className="mt-3.5 text-sm sm:text-[14px] text-slate-300 leading-relaxed min-h-[50px] line-clamp-3 font-normal">
            {item.description}
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/90 text-xs sm:text-[13px] text-slate-400 line-clamp-2 min-h-[34px]">
            <strong className="text-slate-200">{t.idealFor}</strong> {item.bestFor}
          </div>
        </div>

        {/* Action footer */}
        <div className="mt-5 space-y-2.5 pt-3.5 border-t border-slate-800/90">
          {/* Save / Like grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleSaveToggle}
              className={`w-full py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                isSaved
                  ? 'bg-purple-600/35 text-purple-200 border-purple-500/70 shadow-sm'
                  : 'bg-[#101b2f] text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-purple-400' : ''}`} />
              <span>{isSaved ? t.saved : t.save}</span>
            </button>

            <button
              onClick={handleLikeToggle}
              className={`w-full py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                isLiked
                  ? 'bg-pink-600/35 text-pink-200 border-pink-500/70 shadow-sm'
                  : 'bg-[#101b2f] text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-pink-400' : ''}`} />
              <span>{isLiked ? t.liked : t.like}</span>
            </button>
          </div>

          {/* Note & Star Rating row */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              onClick={() => onOpenNote && onOpenNote(item.name, item.generatorId, item.style)}
              className="text-xs font-semibold text-slate-400 hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer py-1"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{existing?.note ? t.editNote : t.note}</span>
            </button>

            {/* 5-star rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                  key={starIndex}
                  onClick={() => handleRate(starIndex)}
                  className="p-1 text-slate-600 hover:text-amber-400 hover:scale-115 transition cursor-pointer"
                  title={`Note ${starIndex}/5`}
                >
                  <Star
                    className={`w-4 h-4 ${
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
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 cursor-pointer border ${
              copied
                ? 'bg-emerald-600/35 text-emerald-200 border-emerald-500/60'
                : 'bg-[#19253c] hover:bg-[#223352] text-slate-100 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>{t.copy}</span>
              </>
            )}
          </button>
        </div>
      </article>
    </>
  );
};
