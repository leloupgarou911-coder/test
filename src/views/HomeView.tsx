import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Shield, Zap, BookOpen, Compass, ChevronDown } from 'lucide-react';
import { GeneratorControl } from '../components/GeneratorControl';
import { NameCard } from '../components/NameCard';
import { NoteModal } from '../components/NoteModal';
import { generateNames } from '../services/generatorEngine';
import { ALL_GENERATORS_LIST } from '../data/generators';
import {
  FormatOption,
  GenderOption,
  GeneratedName,
  GeneratorId,
  LengthOption,
} from '../types';

interface HomeViewProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorId>('fantasy');
  const [selectedStyle, setSelectedStyle] = useState('warrior');
  const [selectedLength, setSelectedLength] = useState<LengthOption>('medium');
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>('title');
  const [selectedGender, setSelectedGender] = useState<GenderOption>('any');
  const [quantity, setQuantity] = useState(9);
  const [results, setResults] = useState<GeneratedName[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Note Modal state
  const [noteModalData, setNoteModalData] = useState<{
    name: string;
    generatorId: GeneratorId | string;
    style: string;
  } | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateNames({
        generator: selectedGenerator,
        style: selectedStyle,
        length: selectedLength,
        format: selectedFormat,
        gender: selectedGender,
        quantity,
      });
      setResults(generated);
      setIsGenerating(false);
    }, 150);
  };

  useEffect(() => {
    handleGenerate();
  }, [selectedGenerator, selectedStyle, selectedLength, selectedFormat, selectedGender, quantity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGenerator, selectedStyle, selectedLength, selectedFormat, selectedGender, quantity]);

  return (
    <div className="space-y-20 pb-16">
      {/* Note Modal */}
      {noteModalData && (
        <NoteModal
          name={noteModalData.name}
          generatorId={noteModalData.generatorId}
          style={noteModalData.style}
          onClose={() => setNoteModalData(null)}
          onSave={() => handleGenerate()}
        />
      )}

      {/* Hero Section */}
      <section className="text-center pt-14 pb-4 px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>FREE ONLINE NAME GENERATOR</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
          Forge your{' '}
          <span className="bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            perfect name
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          NameForge generates unforgettable identities for fantasy characters, RPG campaigns, anime
          heroes, gaming handles, ancient dragons, and fictional kingdoms.
        </p>

        {/* Quick Generator Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10">
          {ALL_GENERATORS_LIST.map((gen) => (
            <button
              key={gen.id}
              onClick={() => {
                setSelectedGenerator(gen.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                selectedGenerator === gen.id
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                  : 'bg-[#101827] text-slate-400 hover:text-white border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <span>{gen.icon}</span>
              <span>{gen.shortTitle}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Interactive Generator Section */}
      <section id="generator" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141d2f]/95 to-[#0c111d]/95 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white">
                <span className="text-2xl">
                  {ALL_GENERATORS_LIST.find((g) => g.id === selectedGenerator)?.icon || '⚡'}
                </span>
                <span>
                  {ALL_GENERATORS_LIST.find((g) => g.id === selectedGenerator)?.title ||
                    'Name Generator'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Customize your archetype, length, and naming format to forge distinct identities.
              </p>
            </div>

            <button
              onClick={() => onNavigate('generator-detail', selectedGenerator)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Open dedicated page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative z-10 mb-8">
            <GeneratorControl
              style={selectedStyle}
              onStyleChange={setSelectedStyle}
              length={selectedLength}
              onLengthChange={setSelectedLength}
              format={selectedFormat}
              onFormatChange={setSelectedFormat}
              gender={selectedGender}
              onGenderChange={setSelectedGender}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Results Grid */}
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((item) => (
                <NameCard
                  key={item.name}
                  item={item}
                  onOpenNote={(name, genId, style) =>
                    setNoteModalData({ name, generatorId: genId, style })
                  }
                  onUpdate={handleGenerate}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore All 11 Generators Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1">
              DISCOVER MORE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Specialized Name Generators
            </h2>
          </div>
          <button
            onClick={() => onNavigate('generators')}
            className="text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>View all 11 generators</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_GENERATORS_LIST.map((gen) => (
            <article
              key={gen.id}
              className="p-5 rounded-2xl bg-[#101827] border border-slate-800 hover:border-purple-500/50 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl mb-3.5 group-hover:scale-105 transition">
                  {gen.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition mb-2">
                  {gen.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {gen.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {gen.category}
                </span>
                <button
                  onClick={() => onNavigate('generator-detail', gen.id)}
                  className="text-xs font-bold text-purple-400 group-hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Forge names</span>
                  <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why Choose NameForge Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0e1526] via-[#0b101c] to-[#080d17] border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">
              WHY NAMEFORGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Crafted for Authors, DMs & Gamers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Engineered with linguistic syllabic weighting so you never end up with generic noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#11192a] border border-slate-800/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant & Infinite</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate dozens of unique, contextually appropriate names with zero lag and no
                refresh required.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#11192a] border border-slate-800/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">21 Naming Archetypes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                From high-elf aristocracy and demon lords to cyberpunk netrunners and northern
                jarls.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#11192a] border border-slate-800/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Save, Like & Add Notes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bookmark favorites, rank them with 5-star ratings, and record campaign notes locally
                in your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
            COMMON QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          <details className="group p-4 rounded-xl bg-[#101625] border border-slate-800 cursor-pointer">
            <summary className="text-sm font-bold text-white flex items-center justify-between list-none">
              <span>Are names generated on NameForge completely free for commercial use?</span>
              <ChevronDown className="w-4 h-4 text-purple-400 transition group-open:rotate-180" />
            </summary>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Yes! All generated names are 100% free for use in your published books, games, comics,
              YouTube videos, merchandise, and tabletop roleplaying campaigns with no attribution
              required.
            </p>
          </details>

          <details className="group p-4 rounded-xl bg-[#101625] border border-slate-800 cursor-pointer">
            <summary className="text-sm font-bold text-white flex items-center justify-between list-none">
              <span>How does the NameForge naming algorithm work?</span>
              <ChevronDown className="w-4 h-4 text-purple-400 transition group-open:rotate-180" />
            </summary>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              NameForge uses genre-specific syllabic DNA matrices (prefixes, roots, suffixes, and
              titles) blended with strict phonetic rules to eliminate awkward triplications and
              produce natural, evocative names.
            </p>
          </details>

          <details className="group p-4 rounded-xl bg-[#101625] border border-slate-800 cursor-pointer">
            <summary className="text-sm font-bold text-white flex items-center justify-between list-none">
              <span>Where are my saved and liked names stored?</span>
              <ChevronDown className="w-4 h-4 text-purple-400 transition group-open:rotate-180" />
            </summary>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Your saved names, likes, notes, and star ratings are safely stored directly in your
              web browser's localStorage. No account or login is required.
            </p>
          </details>

          <details className="group p-4 rounded-xl bg-[#101625] border border-slate-800 cursor-pointer">
            <summary className="text-sm font-bold text-white flex items-center justify-between list-none">
              <span>Can I export or copy my entire collection of saved names?</span>
              <ChevronDown className="w-4 h-4 text-purple-400 transition group-open:rotate-180" />
            </summary>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Yes! Visit the "My Names" page in the navigation bar to export your list to a clean
              text file or copy all names with one click.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
};
