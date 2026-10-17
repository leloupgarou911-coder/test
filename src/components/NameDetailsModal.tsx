import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { GeneratedName, GeneratorId } from '../types';
import {
  findSavedEntry,
  getStoredRating,
  setStoredRating,
  toggleLikeName,
  toggleSaveName,
} from '../services/storage';
import { GENERATORS_METADATA } from '../data/generators';

interface NameDetailsModalProps {
  nameItem: GeneratedName;
  onClose: () => void;
  onUpdate?: () => void;
}

export const NameDetailsModal: React.FC<NameDetailsModalProps> = ({
  nameItem,
  onClose,
  onUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const existing = findSavedEntry(nameItem.name, nameItem.generatorId);
  const [isSaved, setIsSaved] = useState(existing?.saved || false);
  const [isLiked, setIsLiked] = useState(existing?.liked || false);
  const [rating, setRating] = useState<number>(getStoredRating(nameItem.name));

  const meta = GENERATORS_METADATA[nameItem.generatorId] || GENERATORS_METADATA.fantasy;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(nameItem.name);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = nameItem.name;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    const s = toggleSaveName(nameItem.name, nameItem.generatorId, nameItem.style);
    setIsSaved(s);
    if (onUpdate) onUpdate();
  };

  const handleLike = () => {
    const l = toggleLikeName(nameItem.name, nameItem.generatorId, nameItem.style);
    setIsLiked(l);
    if (onUpdate) onUpdate();
  };

  const handleRate = (r: number) => {
    const next = rating === r ? 0 : r;
    setRating(next);
    setStoredRating(nameItem.name, next);
    if (onUpdate) onUpdate();
  };

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(nameItem.name);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-[#0c1224] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-900/40 via-indigo-950 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xl">
              {nameItem.icon || '✨'}
            </div>
            <div>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">
                Fiche d’Analyse Linguistique • {meta.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {nameItem.name}
                </h2>
                <button
                  onClick={handleSpeak}
                  className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-cyan-300 border border-purple-500/30 transition cursor-pointer"
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#10182e] border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Archétype</span>
              <div className="font-bold text-white text-sm mt-0.5">{nameItem.style}</div>
            </div>

            <button
              onClick={handleSpeak}
              className="p-3 rounded-2xl bg-[#10182e] border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer text-left group"
              title="Cliquer pour écouter la prononciation"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Phonétique</span>
                <span className="text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition">Écouter ▶</span>
              </span>
              <div className="font-bold text-cyan-300 text-sm mt-0.5 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
                <span>{nameItem.pronunciation || '[nom]'}</span>
              </div>
            </button>

            <div className="p-3 rounded-2xl bg-[#10182e] border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Évaluation</span>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    className="p-0.5 cursor-pointer hover:scale-110 transition"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#10182e] border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Longueur</span>
              <div className="font-bold text-purple-300 text-sm mt-0.5">
                {nameItem.name.length} lettres
              </div>
            </div>
          </div>

          {/* Description & Ambience */}
          <div className="p-4 rounded-2xl bg-[#10182e] border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Pourquoi ce nom convient à cet univers ?</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {nameItem.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                Tonalité : {nameItem.tone}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                Usage : {nameItem.bestFor}
              </span>
            </div>
          </div>

          {/* Strengths vs Watch-outs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Points Forts & Atouts</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {(nameItem.strengths && nameItem.strengths.length > 0
                  ? nameItem.strengths
                  : [
                      'Haute mémorisation et sonorité percutante',
                      'Excellente lisibilité typographique',
                      'Résonance fidèle au genre',
                    ]
                ).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Watch-outs */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Points de Vigilance & Limites</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {(nameItem.watchouts && nameItem.watchouts.length > 0
                  ? nameItem.watchouts
                  : [
                      'Vérifiez la disponibilité sur votre marché cible',
                      'Testez la prononciation auprès de testeurs',
                    ]
                ).map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Practical Advice */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300 text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              <span>Conseil pour choisir entre plusieurs propositions</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Prononcez le nom à voix haute dans une phrase type : « Bienvenue chez {nameItem.name} » ou « Voici {nameItem.name}, héros de notre histoire ». Le mot doit couler naturellement sans achopper sur la langue.
            </p>
          </div>

          {/* Legal / Clearance notice if applicable */}
          {nameItem.disclaimer && (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{nameItem.disclaimer}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`py-2 px-3.5 rounded-xl font-bold transition flex items-center gap-1.5 text-xs cursor-pointer border ${
                isSaved
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Enregistré' : 'Enregistrer'}</span>
            </button>

            <button
              onClick={handleLike}
              className={`py-2 px-3.5 rounded-xl font-bold transition flex items-center gap-1.5 text-xs cursor-pointer border ${
                isLiked
                  ? 'bg-pink-600/30 text-pink-300 border-pink-500/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Aimé' : 'J’aime'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`py-2 px-4 rounded-xl font-bold transition flex items-center gap-1.5 text-xs cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>✓ Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le nom</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
