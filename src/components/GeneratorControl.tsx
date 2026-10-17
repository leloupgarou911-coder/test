import React from 'react';
import { Sparkles, RefreshCw, Globe } from 'lucide-react';
import { FormatOption, GenderOption, GeneratorId, GenLanguageCode, LengthOption } from '../types';
import { getStyleOptions } from '../data/styles';
import { GEN_LANGUAGES } from '../services/settings';
import { getTranslations } from '../i18n';
import { getAppSettings } from '../services/settings';

interface GeneratorControlProps {
  generatorId?: GeneratorId;
  style: string;
  onStyleChange: (s: string) => void;
  length: LengthOption;
  onLengthChange: (l: LengthOption) => void;
  format: FormatOption;
  onFormatChange: (f: FormatOption) => void;
  gender: GenderOption;
  onGenderChange: (g: GenderOption) => void;
  genLanguage?: GenLanguageCode;
  onGenLanguageChange?: (gl: GenLanguageCode) => void;
  quantity?: number;
  onQuantityChange?: (q: number) => void;
  keyword?: string;
  onKeywordChange?: (kw: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const GeneratorControl: React.FC<GeneratorControlProps> = ({
  generatorId,
  style,
  onStyleChange,
  length,
  onLengthChange,
  format,
  onFormatChange,
  gender,
  onGenderChange,
  genLanguage = 'auto',
  onGenLanguageChange,
  quantity = 9,
  onQuantityChange,
  keyword = '',
  onKeywordChange,
  onGenerate,
  isGenerating = false,
}) => {
  const settings = getAppSettings();
  const t = getTranslations(settings.language).generatorControl;
  const styles = getStyleOptions(generatorId);

  // If the current selected style doesn't exist in the new options list, pick the first
  React.useEffect(() => {
    if (styles.length > 0 && !styles.some((s) => s.key === style)) {
      onStyleChange(styles[0].key);
    }
  }, [generatorId, styles, style, onStyleChange]);

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* 1. Style selector */}
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            {t.styleLabel}
          </label>
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

        {/* 2. Generation Language */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{t.genLangLabel}</span>
          </label>
          <select
            value={genLanguage}
            onChange={(e) => onGenLanguageChange && onGenLanguageChange(e.target.value as GenLanguageCode)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            {GEN_LANGUAGES.map((gl) => (
              <option key={gl.code} value={gl.code} className="bg-[#0e1627]">
                {gl.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Length selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            {t.lengthLabel}
          </label>
          <select
            value={length}
            onChange={(e) => onLengthChange(e.target.value as LengthOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="short" className="bg-[#0e1627]">{t.shortLength}</option>
            <option value="medium" className="bg-[#0e1627]">{t.mediumLength}</option>
            <option value="long" className="bg-[#0e1627]">{t.longLength}</option>
          </select>
        </div>

        {/* 4. Format selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            {t.formatLabel}
          </label>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as FormatOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="title" className="bg-[#0e1627]">{t.formatTitle}</option>
            <option value="full" className="bg-[#0e1627]">{t.formatFull}</option>
            <option value="group" className="bg-[#0e1627]">{t.formatGroup}</option>
          </select>
        </div>

        {/* 5. Gender / Nuance */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            {t.genderLabel}
          </label>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value as GenderOption)}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value="any" className="bg-[#0e1627]">{t.genderAny}</option>
            <option value="female" className="bg-[#0e1627]">{t.genderFemale}</option>
            <option value="male" className="bg-[#0e1627]">{t.genderMale}</option>
          </select>
        </div>

        {/* 6. Quantity */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            {t.quantityLabel}
          </label>
          <select
            value={quantity}
            onChange={(e) => onQuantityChange && onQuantityChange(Number(e.target.value))}
            className="w-full h-11 px-3 py-2 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-inner"
          >
            <option value={6} className="bg-[#0e1627]">6 noms</option>
            <option value={9} className="bg-[#0e1627]">9 noms</option>
            <option value={12} className="bg-[#0e1627]">12 noms</option>
            <option value={18} className="bg-[#0e1627]">18 noms</option>
          </select>
        </div>
      </div>

      {/* 7. Optional Keyword Inspiration Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="💡 Mot-clé ou racine d'inspiration optionnel (ex: Aero, Loup, Luna, Zen, Cyber, Nova)..."
            value={keyword}
            onChange={(e) => onKeywordChange && onKeywordChange(e.target.value)}
            className="w-full h-11 px-4 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner"
          />
          {keyword && onKeywordChange && (
            <button
              onClick={() => onKeywordChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
              title="Effacer le mot-clé"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Trigger Button */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto min-w-[280px] h-13 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>{t.generatingBtn}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>{t.generateBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
