import React from 'react';
import { ALL_GENERATORS_LIST } from '../data/generators';
import { GeneratorId } from '../types';

interface FooterProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/5 bg-[#05070e] py-14 mt-20 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-md">
                <span className="text-sm">⚡</span>
              </div>
              <span>
                Name<span className="text-cyan-400">Forge</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Free character and world name generators for authors, game masters, RPG players,
              streamers and fantasy creators worldwide.
            </p>
            <div className="text-xs text-purple-400 font-semibold pt-1">
              ✨ 21+ Styles • Infinite Combinations
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore Generators
            </h4>
            <ul className="space-y-2 text-xs">
              {ALL_GENERATORS_LIST.slice(0, 6).map((gen) => (
                <li key={gen.id}>
                  <button
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{gen.icon}</span>
                    <span>{gen.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Generators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              More Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {ALL_GENERATORS_LIST.slice(6).map((gen) => (
                <li key={gen.id}>
                  <button
                    onClick={() => onNavigate('generator-detail', gen.id)}
                    className="hover:text-purple-300 transition flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>{gen.icon}</span>
                    <span>{gen.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Collection & Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('my-names')}
                  className="hover:text-purple-300 transition cursor-pointer text-left"
                >
                  🔖 My Saved & Liked Names
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('generators')}
                  className="hover:text-purple-300 transition cursor-pointer text-left"
                >
                  ⚡ All 11 Specialized Generators
                </button>
              </li>
              <li>
                <a href="#guide" className="hover:text-purple-300 transition">
                  📖 Naming Guides & Archetypes
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-purple-300 transition">
                  ❓ Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NameForge — Free name generators for fantasy, gaming and fictional worlds.</p>
          <p className="flex items-center gap-2">
            <span>Client-side only</span>
            <span>•</span>
            <span>Zero cookies</span>
            <span>•</span>
            <span>Free forever</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
