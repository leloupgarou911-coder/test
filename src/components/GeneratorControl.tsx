import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { FormatOption, GenderOption, LengthOption } from '../types';
import { getStyleOptions } from '../data/styles';

interface GeneratorControlProps {
  style: string;
  onStyleChange: (s: string) => void;
  length: LengthOption;
  onLengthChange: (l: LengthOption) => void;
  format: FormatOption;
  onFormatChange: (f: FormatOption) => void;
  gender: GenderOption;
  onGenderChange: (g: GenderOption) => void;
  quantity?: number;
  onQuantityChange?: (q: number) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const GeneratorControl: React.FC<GeneratorControlProps> = ({
  style,
  onStyleChange,
  length,
  onLengthChange,
  format,
  onFormatChange,
  gender,
  onGenderChange,
  quantity = 9,
  onQuantityChange,
  onGenerate,
  isGenerating = false,
}) => {
  const styles = getStyleOptions();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Style selector */}
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            Archetype / Style
          </label>
          <div className="relative">
            <select
              value={style}
              onChange={(e) => onStyleChange(e.target.value)}
              className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
            >
              {styles.map((s) => (
                <option key={s.key} value={s.key} className="bg-[#0e1627] text-white py-1">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Length selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            Length
          </label>
          <select
            value={length}
            onChange={(e) => onLengthChange(e.target.value as LengthOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="short" className="bg-[#0e1627]">⚡ Short (1–2 syl.)</option>
            <option value="medium" className="bg-[#0e1627]">✨ Medium (balanced)</option>
            <option value="long" className="bg-[#0e1627]">📜 Long (epic / ornate)</option>
          </select>
        </div>

        {/* Format selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            Format Structure
          </label>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as FormatOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="title" className="bg-[#0e1627]">🏷️ Single / Title / Alias</option>
            <option value="full" className="bg-[#0e1627]">👤 First & Last Name</option>
            <option value="group" className="bg-[#0e1627]">🏰 Clan / Realm / Guild</option>
          </select>
        </div>

        {/* Gender selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            Gender / Roots
          </label>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value as GenderOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="any" className="bg-[#0e1627]">⚥ Any / Neutral</option>
            <option value="female" className="bg-[#0e1627]">♀ Feminine roots</option>
            <option value="male" className="bg-[#0e1627]">♂ Masculine roots</option>
          </select>
        </div>

        {/* Generate button */}
        <div className="flex flex-col justify-end">
          <label className="hidden lg:block text-[11px] font-bold uppercase tracking-wider text-transparent mb-1.5 select-none">
            Action
          </label>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            title="Générer de nouveaux noms (Raccourci clavier : touche G)"
            className="w-full h-11 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-98 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                <span>Forging...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Generate Names</span>
                <span className="hidden xl:inline text-[10px] opacity-75 font-mono px-1 py-0.5 rounded bg-black/30">G</span>
              </>
            )}
          </button>
        </div>
      </div>

      {onQuantityChange && (
        <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-slate-400">
          <span>Results count:</span>
          <div className="flex items-center gap-1.5">
            {[6, 9, 12, 18].map((q) => (
              <button
                key={q}
                onClick={() => onQuantityChange(q)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  quantity === q
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
