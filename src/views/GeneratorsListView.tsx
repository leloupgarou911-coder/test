import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { ALL_GENERATORS_LIST } from '../data/generators';
import { GeneratorId } from '../types';

interface GeneratorsListViewProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const GeneratorsListView: React.FC<GeneratorsListViewProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Generators' },
    { key: 'fantasy', label: 'Fantasy & Lore' },
    { key: 'fiction', label: 'Anime & Fiction' },
    { key: 'gaming', label: 'Gaming & RPG' },
    { key: 'worldbuilding', label: 'Worldbuilding' },
  ];

  const filtered = ALL_GENERATORS_LIST.filter((gen) => {
    const matchesSearch =
      gen.title.toLowerCase().includes(search.toLowerCase()) ||
      gen.description.toLowerCase().includes(search.toLowerCase()) ||
      gen.shortTitle.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || gen.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>COMPLETE CATALOG</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          All Name Generators
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Explore specialized naming tools crafted for fantasy races, tabletop roleplaying, anime
          stories, gaming aliases, and worldbuilding maps.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search generators (e.g. dragon, elf, rpg)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedCategory === c.key
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-[#121a2c] text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Generators */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">No name generators found matching "{search}".</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="mt-3 text-xs font-bold text-purple-400 hover:underline"
          >
            Reset search filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((gen) => (
            <article
              key={gen.id}
              className="p-6 rounded-2xl bg-gradient-to-b from-[#101827] to-[#0c1220] border border-slate-800 hover:border-purple-500/60 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-purple-950/20 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    {gen.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40">
                    {gen.category}
                  </span>
                </div>

                <h2 className="text-lg font-black text-white group-hover:text-purple-300 transition mb-2">
                  {gen.title}
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {gen.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  21+ styles • Instant
                </span>
                <button
                  onClick={() => onNavigate('generator-detail', gen.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600/20 hover:bg-purple-600 group-hover:bg-purple-600 border border-purple-500/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
