import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { GeneratorControl } from '../components/GeneratorControl';
import { NameCard } from '../components/NameCard';
import { NoteModal } from '../components/NoteModal';
import { GENERATORS_METADATA, ALL_GENERATORS_LIST } from '../data/generators';
import { generateNames } from '../services/generatorEngine';
import {
  FormatOption,
  GenderOption,
  GeneratedName,
  GeneratorId,
  LengthOption,
} from '../types';

interface GeneratorDetailViewProps {
  generatorId: GeneratorId;
  onNavigate: (view: string, genId?: GeneratorId) => void;
}

export const GeneratorDetailView: React.FC<GeneratorDetailViewProps> = ({
  generatorId,
  onNavigate,
}) => {
  const meta = GENERATORS_METADATA[generatorId] || GENERATORS_METADATA.fantasy;

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
        generator: generatorId,
        style: selectedStyle,
        length: selectedLength,
        format: selectedFormat,
        gender: selectedGender,
        quantity,
      });
      setResults(generated);
      setIsGenerating(false);
    }, 120);
  };

  useEffect(() => {
    handleGenerate();
  }, [generatorId, selectedStyle, selectedLength, selectedFormat, selectedGender, quantity]);

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
  }, [generatorId, selectedStyle, selectedLength, selectedFormat, selectedGender, quantity]);

  return (
    <div className="space-y-16 pb-20">
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

      {/* Back link + Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <button
          onClick={() => onNavigate('generators')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-purple-300 transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Generators</span>
        </button>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-4">
            <span>{meta.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {meta.h1a}{' '}
            <span className="bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              {meta.h1b}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Interactive Generator Card */}
      <section id="generator" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141d2f]/95 to-[#0c111d]/95 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{meta.icon}</span>
                <span>{meta.generatorTitle}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {meta.generatorSubtitle}
              </p>
            </div>
          </div>

          <div className="mb-8">
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
      </section>

      {/* Professional Details Section (What is this generator? + 3 Steps) */}
      {meta.professionalDetails && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
                ✨ ABOUT THIS GENERATOR
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {meta.professionalDetails.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {meta.professionalDetails.intro}
              </p>
            </div>

            {/* 4 Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meta.professionalDetails.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#111c30] border border-slate-700/60 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                    {card[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{card[1]}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{card[2]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How It Works Steps */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  ⚙️ HOW IT WORKS
                </span>
                <h3 className="text-lg font-black text-white">Create a name in three simple steps</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Built to be frictionless for creative writers and active game masters.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {meta.professionalDetails.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0c1220] border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-xs flex items-center justify-center mb-2.5">
                      {idx + 1}
                    </div>
                    <strong className="text-xs font-bold text-slate-200 block mb-1">
                      {step}
                    </strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {idx === 0
                        ? 'Select the identity or archetype that best matches your project.'
                        : idx === 1
                        ? 'Fine-tune length, structure and roots with instant feedback.'
                        : 'Generate multiple options, save or like favorites for later.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Guide & Popular Styles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Guide */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#101827] border border-slate-800 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-white">{meta.guideTitle}</h2>
          <div className="space-y-4">
            {meta.guide.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-sm font-bold text-purple-300">{item.h}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Styles */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#101827] border border-slate-800 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-white">{meta.cardsTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meta.cards.map((card, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0d1422] border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <span>{card.icon}</span>
                  <span>{card.h}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{card.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points Forts & Limites Réelles */}
      {((meta.advantages && meta.advantages.length > 0) || (meta.limits && meta.limits.length > 0)) && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800">
            {meta.advantages && meta.advantages.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  ✓ POINTS FORTS & AVANTAGES
                </span>
                <ul className="space-y-2">
                  {meta.advantages.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {meta.limits && meta.limits.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  ⚠️ LIMITES & CONSEILS D'USAGE
                </span>
                <ul className="space-y-2">
                  {meta.limits.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category FAQ */}
      {meta.faq && meta.faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {meta.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {meta.faq.map((item, idx) => (
              <details
                key={idx}
                className="group p-4 rounded-xl bg-[#101625] border border-slate-800 cursor-pointer"
              >
                <summary className="text-sm font-bold text-white flex items-center justify-between list-none">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-purple-400 transition group-open:rotate-180" />
                </summary>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Other Generators Carousel / Links */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Explore Other Generators
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {ALL_GENERATORS_LIST.filter((g) => g.id !== generatorId).map((gen) => (
            <button
              key={gen.id}
              onClick={() => onNavigate('generator-detail', gen.id)}
              className="px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{gen.icon}</span>
              <span>{gen.title}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
