import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  Heart,
  FileText,
  Trash2,
  Copy,
  Check,
  Star,
  Search,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  FolderPlus,
  History,
  Scale,
  Plus,
  Folder,
} from 'lucide-react';
import {
  clearAllSavedNames,
  deleteSavedName,
  getSavedNames,
  setStoredRating,
  toggleLikeName,
  toggleSaveName,
  getCollections,
  deleteCollection,
  assignNameToCollection,
  getGenerationHistory,
  clearGenerationHistory,
  exportDataJSON,
  exportDataCSV,
  importDataJSON,
  getNameForgeStats,
  subscribeToStorage,
} from '../services/storage';
import { GeneratorId, HistoryEntry, NamedCollection, SavedNameEntry, StorageStats } from '../types';
import { NoteModal } from '../components/NoteModal';
import { CollectionModal } from '../components/CollectionModal';
import { CompareModal } from '../components/CompareModal';
import { ALL_GENERATORS_LIST } from '../data/generators';

interface MyNamesViewProps {
  onNavigate: (view: string, generatorId?: GeneratorId) => void;
}

export const MyNamesView: React.FC<MyNamesViewProps> = ({ onNavigate }) => {
  const [entries, setEntries] = useState<SavedNameEntry[]>([]);
  const [collections, setCollections] = useState<NamedCollection[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<StorageStats>({
    total: 0,
    saved: 0,
    liked: 0,
    notes: 0,
    generators: 0,
    collections: 0,
    history: 0,
  });

  // Navigation tab inside MyNames: 'names' | 'collections' | 'history'
  const [activeMainTab, setActiveMainTab] = useState<'names' | 'collections' | 'history'>('names');

  // Filters for names tab
  const [filterTab, setFilterTab] = useState<'all' | 'saved' | 'liked' | 'notes'>('all');
  const [filterGenerator, setFilterGenerator] = useState<string>('all');
  const [filterCollectionId, setFilterCollectionId] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Notifications & Modals
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Compare selection (2 to 4 names)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Collection modal
  const [editingCollection, setEditingCollection] = useState<NamedCollection | null | undefined>(undefined);

  // Note modal
  const [activeNoteModal, setActiveNoteModal] = useState<{
    name: string;
    generatorId: string;
    style: string;
  } | null>(null);

  // Import feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadData = () => {
    setEntries(getSavedNames());
    setCollections(getCollections());
    setHistory(getGenerationHistory());
    setStats(getNameForgeStats());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeToStorage(reloadData);
    return () => unsubscribe();
  }, []);

  const handleCopySingle = async (name: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(name);
      } else {
        const t = document.createElement('textarea');
        t.value = name;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        t.remove();
      }
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1400);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAll = async () => {
    if (!filteredEntries.length) return;
    const text = filteredEntries.map((e) => e.name).join('\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1600);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nameforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = exportDataCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nameforge-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        setImportStatus(
          `Importation réussie : ${res.added} ajoutés, ${res.updated} mis à jour, ${res.skipped} ignorés.`
        );
        reloadData();
      } else {
        setImportStatus(`Erreur : ${res.errors.join(', ')}`);
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleToggleCompareSelection = (name: string) => {
    if (selectedForCompare.includes(name)) {
      setSelectedForCompare(selectedForCompare.filter((n) => n !== name));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('Vous pouvez comparer jusqu\'à 4 noms simultanément.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, name]);
    }
  };

  const handleRate = (name: string, r: number, currentRating: number = 0) => {
    const next = currentRating === r ? 0 : r;
    setStoredRating(name, next);
    reloadData();
  };

  const handleDelete = (name: string, generator?: string) => {
    deleteSavedName(name, generator);
    setSelectedForCompare(selectedForCompare.filter((n) => n !== name));
    reloadData();
  };

  const handleClearEverything = () => {
    clearAllSavedNames();
    setShowClearConfirm(false);
    setSelectedForCompare([]);
    reloadData();
  };

  const handleClearHistory = () => {
    clearGenerationHistory();
    setShowClearHistoryConfirm(false);
    reloadData();
  };

  // Filter entries
  const filteredEntries = entries.filter((item) => {
    if (filterTab === 'saved' && !item.saved) return false;
    if (filterTab === 'liked' && !item.liked) return false;
    if (filterTab === 'notes' && !item.note?.trim()) return false;

    if (filterGenerator !== 'all' && item.generator.toLowerCase() !== filterGenerator.toLowerCase()) {
      return false;
    }

    if (filterCollectionId !== 'all') {
      if (filterCollectionId === 'none' && item.collectionId) return false;
      if (filterCollectionId !== 'none' && item.collectionId !== filterCollectionId) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchNote = item.note?.toLowerCase().includes(q);
      const matchStyle = item.style?.toLowerCase().includes(q);
      if (!matchName && !matchNote && !matchStyle) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 py-10 space-y-8 text-left">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />

      {/* Note Modal */}
      {activeNoteModal && (
        <NoteModal
          name={activeNoteModal.name}
          generatorId={activeNoteModal.generatorId}
          style={activeNoteModal.style}
          onClose={() => setActiveNoteModal(null)}
          onSave={reloadData}
        />
      )}

      {/* Collection Modal */}
      {editingCollection !== undefined && (
        <CollectionModal
          collection={editingCollection}
          onClose={() => setEditingCollection(undefined)}
          onSaved={reloadData}
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          initialNames={selectedForCompare}
          onClose={() => setShowCompareModal(false)}
          onUpdate={reloadData}
        />
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Supprimer toute votre collection ?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action supprimera définitivement vos {entries.length} noms enregistrés, collections,
              notes et évaluations de ce navigateur. Cette opération est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleClearEverything}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/30 cursor-pointer"
              >
                Oui, Tout Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Vider l'historique des générations ?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Voulez-vous réinitialiser les 50 derniers noms générés récents ? Vos favoris enregistrés
              ne seront pas affectés.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md cursor-pointer"
              >
                Vider l'historique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-3">
          <Bookmark className="w-3.5 h-3.5" />
          <span>ESPACE PERSONNEL LOCAL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3">
          Mes Noms, Collections & Historique
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Stockage 100% privé dans votre navigateur. Synchronisé entre vos onglets, exportable et
          restaurable à tout moment.
        </p>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/50 text-xs text-purple-200 text-center font-medium animate-fade-in">
          {importStatus}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
          <div className="text-xl sm:text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Noms Suivis
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
          <div className="text-xl sm:text-2xl font-black text-purple-400">{stats.saved}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Enregistrés
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
          <div className="text-xl sm:text-2xl font-black text-pink-400">{stats.liked}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Favoris (Likes)
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
          <div className="text-xl sm:text-2xl font-black text-cyan-400">{stats.collections}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Collections
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center">
          <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.notes}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Avec Notes
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 text-center col-span-2 sm:col-span-1">
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.history}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Historique (50)
          </div>
        </div>
      </div>

      {/* Main Mode Tabs: Noms | Collections | Historique */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('names')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'names'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Noms Enregistrés ({entries.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('collections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'collections'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Dossiers & Collections ({collections.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique Récent ({history.length})</span>
          </button>
        </div>

        {/* Global Export/Import & Compare Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparer ({selectedForCompare.length})</span>
            </button>
          )}

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Sauvegarder tout en JSON"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Exporter en tableau CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Restaurer un fichier JSON"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restaurer</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          TAB 1 : NOMS ENREGISTRÉS
      ===================================================================== */}
      {activeMainTab === 'names' && (
        <div className="space-y-6">
          {/* Controls & Search Toolbar */}
          <div className="space-y-3.5 p-4 rounded-3xl bg-[#0f172a] border border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    ['all', 'Tous'],
                    ['saved', '🔖 Enregistrés'],
                    ['liked', '❤️ Favoris'],
                    ['notes', '📝 Avec Notes'],
                  ] as const
                ).map(([tabKey, label]) => (
                  <button
                    key={tabKey}
                    onClick={() => setFilterTab(tabKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                      filterTab === tabKey
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#0a0f1d] text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Generator & Collection dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterCollectionId}
                  onChange={(e) => setFilterCollectionId(e.target.value)}
                  className="h-9 px-3 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  <option value="all">Toutes collections</option>
                  <option value="none">Sans collection</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      📁 {col.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterGenerator}
                  onChange={(e) => setFilterGenerator(e.target.value)}
                  className="h-9 px-3 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  <option value="all">Tous générateurs</option>
                  {ALL_GENERATORS_LIST.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.icon} {g.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search bar + Bulk export actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer par nom, note ou style..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-[#0a0f1d] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {filteredEntries.length > 0 && (
                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Copier les noms filtrés"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copié {filteredEntries.length}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Tout Copier ({filteredEntries.length})</span>
                      </>
                    )}
                  </button>
                )}

                {entries.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tout Supprimer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {entries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0e1627] border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-2xl">
                🔖
              </div>
              <h3 className="text-xl font-bold text-white">Votre collection est vide</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Vous n'avez pas encore enregistré de nom. Rendez-vous sur n'importe quel générateur et
                cliquez sur <strong className="text-purple-300">Save</strong> ou{' '}
                <strong className="text-pink-300">Like</strong> pour constituer votre collection !
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 shadow-lg shadow-purple-600/30 transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Générer des Noms</span>
              </button>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">Aucun nom ne correspond à vos critères de recherche.</p>
              <button
                onClick={() => {
                  setFilterTab('all');
                  setFilterGenerator('all');
                  setFilterCollectionId('all');
                  setSearch('');
                }}
                className="mt-2 text-xs font-bold text-purple-400 hover:underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map((item) => {
                const assignedCol = collections.find((c) => c.id === item.collectionId);
                const isSelected = selectedForCompare.includes(item.name);

                return (
                  <article
                    key={item.id}
                    className={`p-5 rounded-2xl bg-[#101625] border transition flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-cyan-400/80 shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-400/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/50 text-purple-300 border border-purple-800/40">
                            {item.generator}
                          </span>
                          {assignedCol && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1"
                              style={{ backgroundColor: assignedCol.color || '#8b5cf6' }}
                            >
                              📁 {assignedCol.name}
                            </span>
                          )}
                        </div>

                        {/* Compare Checkbox */}
                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-cyan-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCompareSelection(item.name)}
                            className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                          />
                          <span>Comparer</span>
                        </label>
                      </div>

                      <h3 className="text-xl font-black text-white break-words">{item.name}</h3>
                      {item.style && (
                        <p className="text-xs text-pink-400 font-semibold mt-0.5">Style : {item.style}</p>
                      )}

                      {/* 5-star rating */}
                      <div className="flex items-center gap-1 mt-2.5">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <button
                            key={starIndex}
                            onClick={() => handleRate(item.name, starIndex, item.rating)}
                            className="p-0.5 text-slate-600 hover:text-amber-400 transition cursor-pointer"
                            title={`Noter ${starIndex} étoiles`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                starIndex <= (item.rating || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-[11px] text-slate-500 ml-1">
                          {item.rating ? `${item.rating}/5` : 'Non noté'}
                        </span>
                      </div>

                      {/* Collection assigner */}
                      <div className="mt-2.5">
                        <select
                          value={item.collectionId || ''}
                          onChange={(e) => {
                            assignNameToCollection(item.name, e.target.value || undefined);
                            reloadData();
                          }}
                          className="w-full text-[11px] px-2 py-1 bg-[#0a0f1d] border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="">📁 Classer dans un dossier...</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Note display */}
                      {item.note ? (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#090e1c] border border-slate-800 text-xs text-slate-300 leading-relaxed italic relative">
                          "{item.note}"
                        </div>
                      ) : null}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            toggleSaveName(item.name, item.generator, item.style);
                            reloadData();
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                            item.saved
                              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                              : 'bg-[#101a2c] text-slate-400 border-slate-700/80'
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${item.saved ? 'fill-current text-purple-400' : ''}`}
                          />
                          <span>{item.saved ? 'Enregistré' : 'Enregistrer'}</span>
                        </button>

                        <button
                          onClick={() => {
                            toggleLikeName(item.name, item.generator, item.style);
                            reloadData();
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                            item.liked
                              ? 'bg-pink-600/30 text-pink-300 border-pink-500/50'
                              : 'bg-[#101a2c] text-slate-400 border-slate-700/80'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${item.liked ? 'fill-current text-pink-400' : ''}`}
                          />
                          <span>{item.liked ? 'Favori' : 'Aimer'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setActiveNoteModal({
                              name: item.name,
                              generatorId: item.generator,
                              style: item.style,
                            })
                          }
                          className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>{item.note ? 'Note' : '+ Note'}</span>
                        </button>

                        <button
                          onClick={() => handleCopySingle(item.name)}
                          className="py-1.5 px-3 rounded-xl bg-[#182236] hover:bg-[#202e48] text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          title="Copier le nom"
                        >
                          {copiedName === item.name ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(item.name, item.generator)}
                          className="py-1.5 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs transition cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 2 : DOSSIERS & COLLECTIONS
      ===================================================================== */}
      {activeMainTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Vos Collections Thématiques</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Regroupez vos noms par livre, faction, campagne ou équipe.
              </p>
            </div>
            <button
              onClick={() => setEditingCollection(null)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Collection</span>
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0e1627] border border-slate-800 space-y-3">
              <FolderPlus className="w-12 h-12 text-purple-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">Aucune collection créée</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Créez votre première collection pour classer vos noms par projet ou par campagne.
              </p>
              <button
                onClick={() => setEditingCollection(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
              >
                + Nouvelle Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => {
                const count = entries.filter((e) => e.collectionId === col.id).length;
                return (
                  <div
                    key={col.id}
                    className="p-5 rounded-2xl bg-[#101827] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: col.color || '#8b5cf6' }}
                        />
                        <span className="text-[11px] font-bold text-purple-300">
                          {count} {count <= 1 ? 'nom' : 'noms'}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">{col.name}</h3>
                      {col.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{col.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setFilterCollectionId(col.id);
                          setActiveMainTab('names');
                        }}
                        className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        Voir les noms ({count}) →
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingCollection(col)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                          title="Modifier la collection"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer la collection "${col.name}" ?`)) {
                              deleteCollection(col.id);
                              reloadData();
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3 : HISTORIQUE RÉCENT (50 NOMS)
      ===================================================================== */}
      {activeMainTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Historique Récent des Générations</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Les 50 dernières propositions générées en cours de session.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setShowClearHistoryConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider l'historique</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0e1627] border border-slate-800 space-y-3">
              <History className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Historique vide</h3>
              <p className="text-xs text-slate-400">
                Générez des noms sur le site pour qu'ils s'enregistrent automatiquement ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {history.map((item) => {
                const isSaved = entries.some((e) => e.name.toLowerCase() === item.name.toLowerCase() && e.saved);
                const isLiked = entries.some((e) => e.name.toLowerCase() === item.name.toLowerCase() && e.liked);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0f1728] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          {item.generator}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            toggleSaveName(item.name, item.generator, item.style);
                            reloadData();
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                            isSaved
                              ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Enregistrer"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            toggleLikeName(item.name, item.generator, item.style);
                            reloadData();
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                            isLiked
                              ? 'bg-pink-600/30 text-pink-300 border-pink-500/50'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                          title="Liker"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-pink-400' : ''}`} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleCopySingle(item.name)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedName === item.name ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
