import React from 'react';
import { ALL_GENERATORS_LIST, GENERATOR_FAMILIES_CONFIG } from '../data/generators';
import { GeneratorId } from '../types';
import { Logo } from './Logo';
import { getAppSettings } from '../services/settings';
import { getTranslations } from '../i18n';
import { ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const settings = getAppSettings();
  const t = getTranslations(settings.language).footer;

  const fantasyGens = ALL_GENERATORS_LIST.filter((g) => g.category === 'fantasy').slice(0, 5);
  const businessGens = ALL_GENERATORS_LIST.filter((g) => g.category === 'business').slice(0, 5);
  const creativeGens = ALL_GENERATORS_LIST.filter((g) => g.category === 'creative').slice(0, 5);

  return (
    <footer className="border-t border-white/5 bg-[#05070e] py-14 mt-20 text-slate-400">
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="cursor-pointer text-left focus:outline-none"
            >
              <Logo size="lg" />
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t.tagline}
            </p>
            <div className="text-xs text-purple-400 font-semibold pt-1">
              ✨ {ALL_GENERATORS_LIST.length} Générateurs • 300+ Styles • 100% Gratuit & Local
            </div>
            {/* Legal Notice */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2 max-w-md">
              <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{t.legalNote}</span>
            </div>
          </div>

          {/* Fantasy Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t.exploreTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              {fantasyGens.map((gen) => (
                <li key={gen.id}>
                  <button
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{gen.icon}</span>
                    <span>{gen.shortTitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t.businessTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              {businessGens.map((gen) => (
                <li key={gen.id}>
                  <button
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{gen.icon}</span>
                    <span>{gen.shortTitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Creative & Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              {t.creativeTitle}
            </h4>
            <ul className="space-y-2 text-xs mb-6">
              {creativeGens.map((gen) => (
                <li key={gen.id}>
                  <button
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{gen.icon}</span>
                    <span>{gen.shortTitle}</span>
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              {t.toolsTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('my-names')}
                  className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📁</span>
                  <span>Mes Favoris & Notes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('generators')}
                  className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔍</span>
                  <span>Catalogue des 36</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} NameForge. {t.rights}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-slate-400 transition cursor-pointer"
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate('generators')}
              className="hover:text-slate-400 transition cursor-pointer"
            >
              Tous les générateurs
            </button>
            <button
              onClick={() => onNavigate('my-names')}
              className="hover:text-slate-400 transition cursor-pointer"
            >
              Mes noms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
