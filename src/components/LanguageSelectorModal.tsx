import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Globe, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';
import {
  LanguageMeta,
  SUPPORTED_LANGUAGES,
  getAlphabeticalLanguages,
  getAppSettings,
  saveAppSettings,
} from '../services/settings';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (lang: LanguageCode) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  onLanguageSelected,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Europe' | 'Asie' | 'Moyen-Orient' | 'Afrique' | 'Inde & Asie du Sud'>('all');
  const [currentLang, setCurrentLang] = useState<LanguageCode>(getAppSettings().language);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentLang(getAppSettings().language);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Alphabetically sorted base list
  const sortedLanguages = useMemo(() => {
    return getAlphabeticalLanguages();
  }, []);

  // Filtered list by tab and search
  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedLanguages.filter((l) => {
      const matchesTab = activeTab === 'all' || l.region === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    });
  }, [sortedLanguages, search, activeTab]);

  const handleSelect = (code: LanguageCode) => {
    saveAppSettings({ language: code });
    setCurrentLang(code);
    if (onLanguageSelected) {
      onLanguageSelected(code);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0c1224] border border-purple-500/40 rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-900/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 id="lang-modal-title" className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Choisir la Langue</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {SUPPORTED_LANGUAGES.length} langues
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sélectionnez votre langue d'affichage. Tri alphabétique & prise en charge RTL automatique.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3 bg-[#0a0f1d]">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher une langue par nom (ex. Français, English, 日本語, Arabic)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-10 bg-[#080d19] border border-slate-700/80 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: `Toutes (${SUPPORTED_LANGUAGES.length})` },
              { id: 'Europe', label: 'Europe' },
              { id: 'Asie', label: 'Asie' },
              { id: 'Moyen-Orient', label: 'Moyen-Orient & RTL' },
              { id: 'Inde & Asie du Sud', label: 'Asie du Sud' },
              { id: 'Afrique', label: 'Afrique' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-[#0e1627] text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Language Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[58vh] flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/80 text-white shadow-md shadow-purple-600/20'
                      : 'bg-[#0f172a]/90 border-slate-800 hover:border-purple-500/60 hover:bg-[#131d33] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-2xl shrink-0">{lang.flag}</span>
                    <div className="truncate">
                      <div className="text-sm font-bold text-white group-hover:text-cyan-200 transition truncate flex items-center gap-1.5">
                        <span>{lang.native}</span>
                        {lang.dir === 'rtl' && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                            RTL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {lang.label} <span className="text-[10px] opacity-60">({lang.code})</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shrink-0 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm font-semibold">Aucune langue ne correspond à « {search} ».</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveTab('all');
                }}
                className="text-xs text-purple-400 hover:underline cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-[#090e1c] flex items-center justify-between text-xs text-slate-400">
          <span>Active : <strong className="text-white">{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.native || currentLang}</strong></span>
          <span className="text-slate-500">Sauvegarde locale instantanée • UTF-8</span>
        </div>
      </div>
    </div>
  );
};
