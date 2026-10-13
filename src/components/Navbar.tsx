import React, { useEffect, useState } from 'react';
import { Sparkles, Bookmark, Menu, X, ChevronDown } from 'lucide-react';
import { ALL_GENERATORS_LIST } from '../data/generators';
import { GeneratorId } from '../types';
import { getSavedNames, subscribeToStorage } from '../services/storage';

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
  const [savedCount, setSavedCount] = useState(0);

  const updateCount = () => {
    const list = getSavedNames();
    setSavedCount(list.length);
  };

  useEffect(() => {
    updateCount();
    const unsubscribe = subscribeToStorage(updateCount);
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#070912]/90 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-17 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-lg">⚡</span>
          </div>
          <span>
            Name<span className="text-cyan-400">Forge</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-semibold transition cursor-pointer ${
              currentView === 'home' && !currentGenerator
                ? 'text-white border-b-2 border-purple-500 pb-1'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </button>

          {/* Generators Dropdown */}
          <div className="relative">
            <button
              onClick={() => setGeneratorsDropdownOpen(!generatorsDropdownOpen)}
              onBlur={() => setTimeout(() => setGeneratorsDropdownOpen(false), 200)}
              className={`text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentView === 'generators' || currentView === 'generator-detail'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Generators</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {generatorsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#0e1626] border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 grid grid-cols-1 gap-1">
                <button
                  onClick={() => {
                    onNavigate('generators');
                    setGeneratorsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-400 hover:bg-purple-950/40 transition flex items-center justify-between cursor-pointer"
                >
                  <span>✨ View All 11 Generators</span>
                  <span>→</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
                  {ALL_GENERATORS_LIST.map((gen) => (
                    <button
                      key={gen.id}
                      onClick={() => {
                        onNavigate('generator-detail', gen.id);
                        setGeneratorsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer ${
                        currentGenerator === gen.id
                          ? 'bg-purple-600/30 text-purple-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{gen.icon}</span>
                      <span>{gen.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('my-names')}
            className={`text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
              currentView === 'my-names'
                ? 'text-white border-b-2 border-purple-500 pb-1'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>My Names</span>
            {savedCount > 0 && (
              <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <a
            href="#faq"
            onClick={(e) => {
              if (currentView !== 'home' && currentView !== 'generator-detail') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  const el = document.getElementById('faq');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            FAQ
          </a>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('generator-detail', 'fantasy')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Forge Names</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onNavigate('my-names')}
            className="p-2 text-purple-400 relative"
            title="My Saved Names"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0e1a] border-b border-slate-800 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('generators');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            All Name Generators (11)
          </button>
          <button
            onClick={() => {
              onNavigate('my-names');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>My Saved Names</span>
            </span>
            {savedCount > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block mb-2">
              Popular Generators
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ALL_GENERATORS_LIST.slice(0, 6).map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => {
                    onNavigate('generator-detail', gen.id);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs text-slate-300 hover:text-purple-300 py-1.5 flex items-center gap-1.5 truncate cursor-pointer"
                >
                  <span>{gen.icon}</span>
                  <span className="truncate">{gen.shortTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
