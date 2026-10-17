import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Layers, Dices } from 'lucide-react';
import { ALL_GENERATORS_LIST, GENERATOR_FAMILIES_CONFIG } from '../data/generators';
import { GeneratorId } from '../types';

interface GeneratorsListViewProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const GeneratorsListView: React.FC<GeneratorsListViewProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = ALL_GENERATORS_LIST.filter((gen) => {
    const matchesSearch =
      gen.title.toLowerCase().includes(search.toLowerCase()) ||
      gen.description.toLowerCase().includes(search.toLowerCase()) ||
      gen.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
      gen.badge.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || gen.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>CATALOGUE COMPLET DES {ALL_GENERATORS_LIST.length} GÉNÉRATEURS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Tous les Générateurs de Noms
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Explorez nos {ALL_GENERATORS_LIST.length} outils spécialisés pour les marques, commerces, romans, héros d’anime, campagnes RPG, sciences, technologies et univers imaginaires.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un générateur (ex. marque, dragon, anime)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>

          {/* Random generator button + Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                const randomGen = ALL_GENERATORS_LIST[Math.floor(Math.random() * ALL_GENERATORS_LIST.length)];
                onNavigate('generator-detail', randomGen.id);
              }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-300 border border-amber-500/40 cursor-pointer"
              title="Ouvrir un générateur aléatoire"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>🎲 Aléatoire</span>
            </button>

            {GENERATOR_FAMILIES_CONFIG.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#10182c] text-slate-400 hover:text-white border border-slate-700/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
          <span>Affichage de <strong className="text-white">{filtered.length}</strong> sur {ALL_GENERATORS_LIST.length} générateurs</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-purple-400 hover:underline cursor-pointer text-[11px]"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      </div>

      {/* Grid of all 134 generators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((gen) => (
          <article
            key={gen.id}
            className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#101728] to-[#0a0f1d] border border-slate-800 hover:border-purple-500/60 transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition">{gen.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  {gen.badge}
                </span>
              </div>

              <h2 className="text-lg font-black text-white group-hover:text-cyan-300 transition mb-2">
                {gen.title}
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed min-h-[48px] line-clamp-3">
                {gen.description}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {gen.category}
              </span>
              <button
                onClick={() => onNavigate('generator-detail', gen.id)}
                className="py-1.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/30"
              >
                <span>Forger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Aucun générateur ne correspond à « {search} ».</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="mt-3 text-xs text-purple-400 hover:underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};
