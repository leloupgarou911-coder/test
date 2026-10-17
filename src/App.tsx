import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { GeneratorsListView } from './views/GeneratorsListView';
import { GeneratorDetailView } from './views/GeneratorDetailView';
import { MyNamesView } from './views/MyNamesView';
import { GeneratorId } from './types';
import { GENERATORS_METADATA, ALL_GENERATORS_LIST } from './data/generators';
import { applySettingsToDOM, getAppSettings, subscribeToSettings } from './services/settings';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentGenerator, setCurrentGenerator] = useState<GeneratorId>('fantasy');
  const [settings, setSettings] = useState(getAppSettings());

  // Initialize and subscribe to settings
  useEffect(() => {
    applySettingsToDOM(getAppSettings());
    const unsub = subscribeToSettings((s) => {
      setSettings(s);
      applySettingsToDOM(s);
    });
    return () => unsub();
  }, []);

  // Handle URL hash changes for deep linking
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash || hash === 'faq') {
      setCurrentView('home');
      return;
    }
    if (hash === 'generators' || hash === 'all-name-generators') {
      setCurrentView('generators');
      return;
    }
    if (hash === 'my-names') {
      setCurrentView('my-names');
      return;
    }
    if (hash.startsWith('generator/')) {
      const genId = hash.replace('generator/', '') as GeneratorId;
      if (GENERATORS_METADATA[genId]) {
        setCurrentGenerator(genId);
        setCurrentView('generator-detail');
        return;
      }
    }
    // Also match legacy file-like hashes if any: e.g. #anime-name-generator
    const matchLegacy = hash.replace('-name-generator', '') as GeneratorId;
    if (GENERATORS_METADATA[matchLegacy]) {
      setCurrentGenerator(matchLegacy);
      setCurrentView('generator-detail');
      return;
    }

    setCurrentView('home');
  };

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleNavigate = (view: string, generatorId?: GeneratorId) => {
    if (view === 'home') {
      window.location.hash = '';
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'generators') {
      window.location.hash = '/generators';
      setCurrentView('generators');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'my-names') {
      window.location.hash = '/my-names';
      setCurrentView('my-names');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'generator-detail' && generatorId) {
      window.location.hash = `/generator/${generatorId}`;
      setCurrentGenerator(generatorId);
      setCurrentView('generator-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync document title and meta
  useEffect(() => {
    if (currentView === 'home') {
      document.title = `NameForge — ${ALL_GENERATORS_LIST.length} Générateurs de Noms Gratuits & Professionnels`;
    } else if (currentView === 'generators') {
      document.title = `Tous les ${ALL_GENERATORS_LIST.length} Générateurs de Noms — NameForge`;
    } else if (currentView === 'my-names') {
      document.title = 'Mes Noms — Favoris, Notes & Collections | NameForge';
    } else if (currentView === 'generator-detail') {
      const meta = GENERATORS_METADATA[currentGenerator];
      document.title = `${meta ? meta.title : 'Générateur de Noms'} | NameForge`;
    }
  }, [currentView, currentGenerator, settings.language]);

  return (
    <div className="min-h-screen bg-[#060611] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none"
      >
        Passer au contenu principal
      </a>

      <Navbar
        currentView={currentView}
        currentGenerator={currentView === 'generator-detail' ? currentGenerator : undefined}
        onNavigate={handleNavigate}
      />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {currentView === 'home' && <HomeView onNavigate={handleNavigate} />}
        {currentView === 'generators' && <GeneratorsListView onNavigate={handleNavigate} />}
        {currentView === 'generator-detail' && (
          <GeneratorDetailView generatorId={currentGenerator} onNavigate={handleNavigate} />
        )}
        {currentView === 'my-names' && <MyNamesView onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
