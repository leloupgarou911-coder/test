import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  Compass,
  ChevronDown,
  Search,
  Star,
  Copy,
  Check,
  Bookmark,
  Layers,
  Award,
  HelpCircle,
  TrendingUp,
  Cpu,
  Flame,
  Globe,
  Sliders,
  Lock,
  Dices,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { ALL_GENERATORS_LIST, GENERATOR_FAMILIES_CONFIG, GENERATORS_METADATA } from '../data/generators';
import { COMPREHENSIVE_FAQ_LIST } from '../data/faqData';
import { GeneratedName, GeneratorFamily, GeneratorId, SavedNameEntry } from '../types';
import { getSavedNames, subscribeToStorage } from '../services/storage';
import { getAppSettings, subscribeToSettings } from '../services/settings';
import { getTranslations } from '../i18n';
import { generateNames } from '../services/generatorEngine';
import { NameCard } from '../components/NameCard';

interface HomeViewProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState(getAppSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [savedEntries, setSavedEntries] = useState<SavedNameEntry[]>([]);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // Quick Express Forge state
  const [quickGenId, setQuickGenId] = useState<GeneratorId>('brand');
  const [quickKeyword, setQuickKeyword] = useState('');
  const [quickResults, setQuickResults] = useState<GeneratedName[]>([]);
  const [quickGenerating, setQuickGenerating] = useState(false);

  const t = getTranslations(settings.language);

  const refreshSaved = () => {
    setSavedEntries(getSavedNames());
  };

  const handleQuickForge = (targetId?: GeneratorId) => {
    const id = targetId || quickGenId;
    setQuickGenerating(true);
    setTimeout(() => {
      const res = generateNames({
        generator: id,
        quantity: 3,
        keyword: quickKeyword,
      });
      setQuickResults(res);
      setQuickGenerating(false);
    }, 100);
  };

  useEffect(() => {
    refreshSaved();
    handleQuickForge('brand');
    const unsubStorage = subscribeToStorage(refreshSaved);
    const unsubSettings = subscribeToSettings((s) => setSettings(s));
    return () => {
      unsubStorage();
      unsubSettings();
    };
  }, []);

  // Filtered generators for interactive search bar
  const searchedGenerators = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_GENERATORS_LIST.filter(
      (gen) =>
        gen.title.toLowerCase().includes(q) ||
        gen.shortTitle.toLowerCase().includes(q) ||
        gen.description.toLowerCase().includes(q) ||
        gen.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Featured Generators
  const featuredGenerators = useMemo(() => {
    const featuredIds: GeneratorId[] = [
      'brand',
      'fantasy',
      'startup',
      'dragon',
      'anime',
      'domain',
      'videogame',
      'rpg',
    ];
    return ALL_GENERATORS_LIST.filter((g) => featuredIds.includes(g.id));
  }, []);

  // Top Rated Names calculation (Bayesian weighted based on user evaluations with fallback gems)
  const [ratedCategoryFilter, setRatedCategoryFilter] = useState<string>('all');

  // Top Rated Names calculation (based strictly on user's real star ratings, independently filterable by category)
  const topRatedItems = useMemo(() => {
    const rated = savedEntries.filter((e) => {
      const hasRating = typeof e.rating === 'number' && e.rating > 0;
      if (!hasRating) return false;
      if (ratedCategoryFilter === 'all') return true;
      const meta = GENERATORS_METADATA[e.generator as GeneratorId];
      return meta && meta.category === ratedCategoryFilter;
    });

    rated.sort((a, b) => {
      const diff = (b.rating || 0) - (a.rating || 0);
      if (diff !== 0) return diff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return rated.slice(0, 12);
  }, [savedEntries, ratedCategoryFilter]);

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopiedName(text);
      setTimeout(() => setCopiedName(null), 1400);
    } catch {
      // ignore
    }
  };

  // Filtered FAQ
  const filteredFaq = useMemo(() => {
    if (faqCategory === 'all') return COMPREHENSIVE_FAQ_LIST;
    return COMPREHENSIVE_FAQ_LIST.filter((item) => item.category === faqCategory);
  }, [faqCategory]);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* ========================================================
          1. SECTION HERO & INTRODUCTION
      ========================================================= */}
      <section className="relative text-center pt-16 pb-8 px-4 max-w-5xl mx-auto">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-black uppercase tracking-widest mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{t.hero.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
          {t.hero.titleA}{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
            {t.hero.titleB}
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          {t.hero.subtitle}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto mb-14">
          <button
            onClick={() => onNavigate('generators')}
            className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.hero.exploreBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const randomGen = ALL_GENERATORS_LIST[Math.floor(Math.random() * ALL_GENERATORS_LIST.length)];
              onNavigate('generator-detail', randomGen.id);
            }}
            className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-300 font-extrabold text-sm border border-amber-500/40 hover:border-amber-400 transition flex items-center justify-center gap-2 cursor-pointer"
            title="Ouvrir un générateur aléatoire parmi les 134"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>🎲 Surprenez-moi !</span>
          </button>

          <button
            onClick={() => onNavigate('my-names')}
            className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-[#0f172a] hover:bg-[#18233c] text-slate-200 font-bold text-sm border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>{t.hero.myNamesBtn}</span>
          </button>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold border-t border-slate-800/80 pt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">{t.hero.fastStatGenerators}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-slate-300">{t.hero.fastStatStyles}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">{t.hero.fastStatFree}</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          1.5. SECTION FORGE EXPRESS DIRECTE (TESTEZ IMMÉDIATEMENT)
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 -mt-10 sm:-mt-8 relative z-20">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#131b2e] via-[#0d1424] to-[#080d19] border border-purple-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>FORGE EXPRESS DIRECTE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Essayez NameForge en 1 clic
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sélectionnez un univers, tapez un mot-clé (optionnel) et forgez 3 identités en direct.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuickForge()}
                disabled={quickGenerating}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {quickGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Forger à nouveau</span>
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'brand' as GeneratorId, label: '🏢 Marque & Business', icon: '🏢' },
                { id: 'fantasy' as GeneratorId, label: '✨ Fantasy & Héros', icon: '🧙' },
                { id: 'startup' as GeneratorId, label: '🚀 Startup & Tech', icon: '🚀' },
                { id: 'dragon' as GeneratorId, label: '🐉 Dragon & Mythe', icon: '🐉' },
                { id: 'baby_name' as GeneratorId, label: '👶 Noms & Prénoms', icon: '👶' },
                { id: 'gamertag' as GeneratorId, label: '🎮 Pseudo & Gamer', icon: '🎯' },
                { id: 'restaurant' as GeneratorId, label: '🍽️ Resto & Café', icon: '🍽️' },
                { id: 'ai_bot' as GeneratorId, label: '🤖 Agent & IA', icon: '🤖' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setQuickGenId(chip.id);
                    handleQuickForge(chip.id);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    quickGenId === chip.id
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                      : 'bg-[#0a0f1d] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Keyword Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mot-clé ou thème d'inspiration (ex: Nova, Wolf, Luna, Spark, Zen)..."
                value={quickKeyword}
                onChange={(e) => setQuickKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickForge();
                }}
                className="flex-1 h-11 px-4 bg-[#090d1c] border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
              />
              <button
                onClick={() => handleQuickForge()}
                className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer border border-slate-700"
              >
                Appliquer
              </button>
            </div>
          </div>

          {/* Quick Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {quickResults.map((item) => (
              <NameCard
                key={item.name}
                item={item}
                onUpdate={() => handleQuickForge()}
              />
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
            <span>
              Vous aimez ces propositions ? Accédez aux options approfondies :
            </span>
            <button
              onClick={() => onNavigate('generator-detail', quickGenId)}
              className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Générateur complet {GENERATORS_METADATA[quickGenId]?.shortTitle || ''}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SECTION AVANTAGES DE NAMEFORGE
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            {t.advantages.title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.advantages.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Adv 1 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 hover:border-purple-500/40 transition-all duration-200 hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">{t.advantages.adv1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.advantages.adv1Desc}</p>
          </div>

          {/* Adv 2 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">{t.advantages.adv2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.advantages.adv2Desc}</p>
          </div>

          {/* Adv 3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 hover:border-pink-500/40 transition-all duration-200 hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">{t.advantages.adv3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.advantages.adv3Desc}</p>
          </div>

          {/* Adv 4 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-1 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-2">{t.advantages.adv4Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.advantages.adv4Desc}</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. BARRE DE RECHERCHE INTERACTIVE DE GÉNÉRATEURS
      ========================================================= */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121a30] via-[#0d1426] to-[#080d1a] border border-purple-500/30 shadow-2xl space-y-5">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Quel univers souhaitez-vous nommer ?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Recherchez parmi nos {ALL_GENERATORS_LIST.length} générateurs par besoin, profession ou registre imaginaire.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ex : marque, startup, dragon, roman, podcast, elfe, jeu vidéo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-4 bg-[#070b16] border border-slate-700/80 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-inner"
            />
          </div>

          {/* Live Search Results */}
          {searchQuery.trim() && (
            <div className="pt-2 animate-fade-in space-y-2">
              <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>{searchedGenerators.length} générateur(s) trouvé(s)</span>
                {searchedGenerators.length === 0 && (
                  <span className="text-rose-400">Aucun résultat exact, essayez d'autres mots-clés</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                {searchedGenerators.map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 hover:border-purple-500/60 transition text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl">{gen.icon}</span>
                      <div className="truncate">
                        <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition truncate">
                          {gen.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{gen.badge}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. CATÉGORIES POPULAIRES & RECOMMANDÉES
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>SÉLECTIONS LES PLUS FORGÉES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Générateurs Populaires
            </h2>
          </div>

          <button
            onClick={() => onNavigate('generators')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Voir l'ensemble du catalogue ({ALL_GENERATORS_LIST.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredGenerators.map((gen) => (
            <div
              key={gen.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 hover:border-purple-500/60 transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#090d1a] border border-slate-700/80 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {gen.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    {gen.badge}
                  </span>
                </div>

                <h3 className="text-base font-black text-white group-hover:text-cyan-200 transition mb-2">
                  {gen.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {gen.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {gen.advantages?.[0] || 'Forge instantanée'}
                </span>
                <button
                  onClick={() => onNavigate('generator-detail', gen.id)}
                  className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <span>Lancer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. LES 4 GRANDES FAMILLES DE GÉNÉRATEURS
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            {t.categories.title}
          </h2>
          <p className="text-sm text-slate-400">
            {t.categories.subtitle}
          </p>

          {/* Family Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {GENERATOR_FAMILIES_CONFIG.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                  selectedFamily === fam.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-[#10182c] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{fam.icon}</span>
                <span>{fam.label} ({fam.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display selected family generators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(selectedFamily === 'all'
            ? ALL_GENERATORS_LIST
            : ALL_GENERATORS_LIST.filter((g) => g.category === selectedFamily)
          ).map((gen) => (
            <div
              key={gen.id}
              onClick={() => onNavigate('generator-detail', gen.id)}
              className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-purple-500/50 transition cursor-pointer flex items-start gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0a0f1e] border border-slate-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition">
                {gen.icon}
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition truncate">
                    {gen.title}
                  </h4>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    {gen.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {gen.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. SECTION NOMS LES MIEUX NOTÉS (CLASSEMENT PAR ÉTOILES INDÉPENDANT)
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#121728] via-[#0f1424] to-[#0a0d18] border border-amber-500/20 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>PALMARÈS INDÉPENDANT DES ÉVALUATIONS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t.topRated.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.topRated.subtitle}
              </p>
            </div>

            <div className="text-xs text-slate-400 font-semibold bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60 max-w-md">
              <span>Classement personnel établi d’après vos véritables notes par étoiles (1 à 5★) stockées sur ce navigateur.</span>
            </div>
          </div>

          {/* Category Filter Tabs for Top Rated */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold mr-1">Filtrer par domaine :</span>
            <button
              onClick={() => setRatedCategoryFilter('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratedCategoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tous les univers
            </button>
            <button
              onClick={() => setRatedCategoryFilter('fantasy')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratedCategoryFilter === 'fantasy'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ✨ Fantasy, Mythes & Jeux
            </button>
            <button
              onClick={() => setRatedCategoryFilter('business')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratedCategoryFilter === 'business'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🏢 Entreprises & Marques
            </button>
            <button
              onClick={() => setRatedCategoryFilter('creative')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratedCategoryFilter === 'creative'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🎨 Création & eSport
            </button>
            <button
              onClick={() => setRatedCategoryFilter('innovation')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                ratedCategoryFilter === 'innovation'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🚀 Systèmes & Web3
            </button>
          </div>

          {/* Top rated grid or empty state */}
          {topRatedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRatedItems.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-[#090d1a] border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{entry.rating || 5}/5 étoiles</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {entry.generator}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white tracking-tight">{entry.name}</h3>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {entry.note || `Archétype ${entry.style} • Proposition remarquable`}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-purple-400 font-semibold">
                      {entry.style}
                    </span>
                    <button
                      onClick={() => handleCopy(entry.name)}
                      className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedName === entry.name ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Aucun nom encore noté dans ce domaine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attribuez des étoiles (★) aux propositions générées pour constituer votre palmarès personnel indépendant.
              </p>
              <button
                onClick={() => onNavigate('generators')}
                className="mt-2 py-2 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer keep-white shadow-md shadow-purple-600/30"
              >
                Lancer un générateur
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          7. SECTION COMMENT UTILISER NAMEFORGE (3 ÉTAPES)
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            {t.howItWorks.title}
          </h2>
          <p className="text-sm text-slate-400">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 relative">
            <div className="text-4xl font-black text-purple-500/30 mb-4">01</div>
            <h3 className="text-lg font-black text-white mb-2">{t.howItWorks.step1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 relative">
            <div className="text-4xl font-black text-cyan-500/30 mb-4">02</div>
            <h3 className="text-lg font-black text-white mb-2">{t.howItWorks.step2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#10182c] to-[#0a0f1e] border border-slate-800 relative">
            <div className="text-4xl font-black text-pink-500/30 mb-4">03</div>
            <h3 className="text-lg font-black text-white mb-2">{t.howItWorks.step3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.howItWorks.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. SECTION FAQ RÉÉCRITE (18 QUESTIONS COMPLÈTES)
      ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>RÉPONSES CLAIRES & HONNÊTES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Foire Aux Questions
          </h2>
          <p className="text-sm text-slate-400">
            Tout ce que vous devez savoir sur le fonctionnement du moteur, la propriété légale et vos données.
          </p>

          {/* Category Filter Pills for FAQ */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: 'all', label: 'Toutes les questions (18)' },
              { id: 'general', label: 'Principes Généraux' },
              { id: 'features', label: 'Fonctionnalités' },
              { id: 'technical', label: 'Technique & Vie Privée' },
              { id: 'legal', label: 'Légal & Marques' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFaqCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  faqCategory === cat.id
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-[#10182c] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3">
          {filteredFaq.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition"
                >
                  <span className="font-bold text-white text-sm sm:text-base leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-[#0a0f1e]/60 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          9. BANNIÈRE D’APPEL À L’ACTION (CTA)
      ========================================================= */}
      <section className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-cyan-900/40 border border-purple-500/40 shadow-2xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Prêt à forger le nom idéal pour votre projet ?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Naviguez dès maintenant parmi nos {ALL_GENERATORS_LIST.length} générateurs thématiques et sauvegardez vos créations préférées dans vos collections privées.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('generators')}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition cursor-pointer"
            >
              Explorer les {ALL_GENERATORS_LIST.length} Générateurs
            </button>
            <button
              onClick={() => onNavigate('my-names')}
              className="py-3 px-6 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
            >
              Consulter mes favoris
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
