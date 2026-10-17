import React, { useEffect, useState } from 'react';
import { Bookmark, Menu, X, ChevronDown, Settings, Search, Globe, Dices } from 'lucide-react';
import { ALL_GENERATORS_LIST, GENERATOR_FAMILIES_CONFIG } from '../data/generators';
import { GeneratorId } from '../types';
import { getSavedNames, subscribeToStorage } from '../services/storage';
import { Logo } from './Logo';
import { SettingsModal } from './SettingsModal';
import { LanguageSelectorModal } from './LanguageSelectorModal';
import { getAppSettings, subscribeToSettings, SUPPORTED_LANGUAGES } from '../services/settings';
import { getTranslations } from '../i18n';

interface NavbarProps {
  currentView: string;
  currentGenerator?: GeneratorId;
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentGenerator,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generatorsDropdownOpen, setGeneratorsDropdownOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [settings, setSettings] = useState(getAppSettings());

  const t = getTranslations(settings.language).nav;

  const updateCount = () => {
    const list = getSavedNames();
    setSavedCount(list.length);
  };

  useEffect(() => {
    updateCount();
    const unsubStorage = subscribeToStorage(updateCount);
    const unsubSettings = subscribeToSettings((s) => setSettings(s));
    return () => {
      unsubStorage();
      unsubSettings();
    };
  }, []);

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === settings.language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSettingsChanged={(s) => setSettings(s)}
        />
      )}

      <LanguageSelectorModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onLanguageSelected={(code) => {
          setSettings(getAppSettings());
        }}
      />

      <header className="sticky top-0 z-40 bg-[#070912]/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer text-left focus:outline-none py-1"
            aria-label="NameForge Accueil"
          >
            <Logo size="lg" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-semibold transition cursor-pointer ${
                currentView === 'home' && !currentGenerator
                  ? 'text-white border-b-2 border-purple-500 pb-1'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.home}
            </button>

            {/* Generators Dropdown with all 4 families */}
            <div className="relative">
              <button
                onClick={() => setGeneratorsDropdownOpen(!generatorsDropdownOpen)}
                className={`text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer py-1.5 ${
                  currentView === 'generators' || currentView === 'generator-detail'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.generators} ({ALL_GENERATORS_LIST.length})</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {generatorsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setGeneratorsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-[520px] rounded-2xl bg-[#0b1020] border border-slate-800 shadow-2xl p-4 z-30 animate-fade-in max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Les {ALL_GENERATORS_LIST.length} Générateurs NameForge
                      </span>
                      <button
                        onClick={() => {
                          onNavigate('generators');
                          setGeneratorsDropdownOpen(false);
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                      >
                        {t.allGenerators} →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {GENERATOR_FAMILIES_CONFIG.filter((f) => f.id !== 'all').map((fam) => {
                        const items = ALL_GENERATORS_LIST.filter((g) => g.category === fam.id);
                        return (
                          <div key={fam.id} className="space-y-1.5">
                            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                              <span>{fam.icon}</span>
                              <span>{fam.label} ({items.length})</span>
                            </div>
                            <div className="space-y-0.5">
                              {items.slice(0, 5).map((gen) => (
                                <button
                                  key={gen.id}
                                  onClick={() => {
                                    onNavigate('generator-detail', gen.id);
                                    setGeneratorsDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 cursor-pointer"
                                >
                                  <span>{gen.icon}</span>
                                  <span className="truncate">{gen.shortTitle}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Catalog Link */}
            <button
              onClick={() => onNavigate('generators')}
              className={`text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentView === 'generators'
                  ? 'text-white border-b-2 border-purple-500 pb-1'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Catalogue</span>
            </button>

            {/* Random Generator Quick Button */}
            <button
              onClick={() => {
                const randomGen = ALL_GENERATORS_LIST[Math.floor(Math.random() * ALL_GENERATORS_LIST.length)];
                onNavigate('generator-detail', randomGen.id);
              }}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title={`Ouvrir un générateur aléatoire parmi les ${ALL_GENERATORS_LIST.length}`}
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>🎲 Aléatoire</span>
            </button>

            {/* My Names with Live Counter */}
            <button
              onClick={() => onNavigate('my-names')}
              className={`text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                currentView === 'my-names'
                  ? 'text-white border-b-2 border-purple-500 pb-1'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>{t.myNames}</span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-600 text-white rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Header Tools (Settings & Quick Language) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Language Trigger */}
            <button
              onClick={() => setShowLangModal(true)}
              className="h-10 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-xs sm:text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 transition cursor-pointer shadow-sm hover:border-purple-500/60"
              title="Changer la langue (80 langues disponibles)"
              aria-label="Changer la langue"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-base">{currentLangMeta.flag}</span>
              <span className="font-semibold text-xs text-slate-300 hidden xl:inline">{currentLangMeta.native}</span>
              <span className="uppercase text-xs font-bold text-purple-300 xl:hidden">{currentLangMeta.code}</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              title={t.settings}
              aria-label={t.settings}
            >
              <Settings className="w-4.5 h-4.5 text-purple-400" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300"
              aria-label={t.settings}
            >
              <Settings className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#090d1c] px-4 pt-3 pb-6 space-y-3">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {t.home}
            </button>

            <button
              onClick={() => {
                onNavigate('generators');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
            >
              <span>{t.allGenerators}</span>
              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                {ALL_GENERATORS_LIST.length}
              </span>
            </button>

            <button
              onClick={() => {
                const randomGen = ALL_GENERATORS_LIST[Math.floor(Math.random() * ALL_GENERATORS_LIST.length)];
                onNavigate('generator-detail', randomGen.id);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-amber-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Générateur Aléatoire (🎲 Surprenez-moi)</span>
            </button>

            <button
              onClick={() => {
                onNavigate('my-names');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" />
                <span>{t.myNames}</span>
              </span>
              {savedCount > 0 && (
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLangModal(true);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-cyan-300 hover:bg-slate-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Langue : {currentLangMeta.flag} {currentLangMeta.native}</span>
              </span>
              <span className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                80 langues
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowSettingsModal(true);
              }}
              className="w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>{t.settings}</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};
