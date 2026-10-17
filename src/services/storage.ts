import {
  ExportBundle,
  GeneratorId,
  HistoryEntry,
  ImportResult,
  NamedCollection,
  SavedNameEntry,
  StorageStats,
} from '../types';

const STORAGE_KEY = 'nameforge_saved_names';
const COLLECTIONS_KEY = 'nameforge_collections';
const HISTORY_KEY = 'nameforge_generation_history';

function safeTrim(v: unknown): string {
  if (v === null || typeof v === 'undefined') return '';
  return String(v).trim();
}

function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fallback
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

function notifyStorageChange() {
  try {
    window.dispatchEvent(new CustomEvent('nameforge:storage'));
  } catch (e) {
    console.warn('Unable to dispatch storage custom event', e);
  }
}

/**
 * Universal subscription helper that listens to both internal and cross-tab storage events
 */
export function subscribeToStorage(callback: () => void): () => void {
  const handleInternal = () => callback();
  const handleExternal = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith('nameforge_')) {
      callback();
    }
  };

  window.addEventListener('nameforge:storage', handleInternal);
  window.addEventListener('storage', handleExternal);

  return () => {
    window.removeEventListener('nameforge:storage', handleInternal);
    window.removeEventListener('storage', handleExternal);
  };
}

/* =====================================================================
   RATING HELPERS
===================================================================== */

export function getStoredRating(name: string): number {
  try {
    const val = localStorage.getItem('nameforge_rating_' + name);
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
}

export function setStoredRating(name: string, rating: number): void {
  try {
    if (rating <= 0) {
      localStorage.removeItem('nameforge_rating_' + name);
    } else {
      localStorage.setItem('nameforge_rating_' + name, String(rating));
    }
    const names = getSavedNames();
    const entry = names.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (entry) {
      entry.rating = rating;
      saveAllNames(names);
    } else {
      notifyStorageChange();
    }
  } catch (e) {
    console.error('Error saving rating', e);
  }
}

/**
 * Returns top-rated names based on real user star evaluations, independently filterable by category
 */
export function getTopRatedNamesByCategory(generatorId?: string, limit = 10): SavedNameEntry[] {
  const all = getSavedNames();
  const rated = all.filter((entry) => {
    const hasStars = typeof entry.rating === 'number' && entry.rating > 0;
    if (!hasStars) return false;
    if (generatorId && generatorId !== 'all') {
      return entry.generator.toLowerCase() === generatorId.toLowerCase();
    }
    return true;
  });
  // Sort strictly by star rating descending (5 to 1), then by most recent
  rated.sort((a, b) => {
    const diff = (b.rating || 0) - (a.rating || 0);
    if (diff !== 0) return diff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  return rated.slice(0, limit);
}

/* =====================================================================
   SAVED NAMES CRUD
===================================================================== */

function normalizeEntry(raw: any): SavedNameEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const name = safeTrim(raw.name);
  if (!name) return null;

  return {
    id: safeTrim(raw.id) || generateId(),
    name,
    generator: safeTrim(raw.generator) || 'fantasy',
    style: safeTrim(raw.style) || 'warrior',
    saved: raw.saved === true,
    liked: raw.liked === true,
    note: safeTrim(raw.note),
    collectionId: safeTrim(raw.collectionId) || undefined,
    rating: typeof raw.rating === 'number' ? raw.rating : getStoredRating(name),
    createdAt: safeTrim(raw.createdAt) || new Date().toISOString(),
  };
}

function isEntryActive(item: SavedNameEntry): boolean {
  return (
    item.saved === true ||
    item.liked === true ||
    safeTrim(item.note) !== '' ||
    !!item.collectionId
  );
}

export function getSavedNames(): SavedNameEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const list: SavedNameEntry[] = [];
    const ids = new Set<string>();

    for (const item of parsed) {
      const entry = normalizeEntry(item);
      if (entry) {
        if (ids.has(entry.id)) {
          entry.id = generateId();
        }
        ids.add(entry.id);
        list.push(entry);
      }
    }
    return list;
  } catch (e) {
    console.error('Error loading saved names from localStorage', e);
    return [];
  }
}

function saveAllNames(names: SavedNameEntry[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    notifyStorageChange();
    return true;
  } catch (e) {
    console.error('Error saving names to localStorage', e);
    return false;
  }
}

function findInList(list: SavedNameEntry[], name: string, generator?: string): SavedNameEntry | undefined {
  const target = safeTrim(name).toLowerCase();
  if (!target) return undefined;
  if (generator) {
    const genTarget = safeTrim(generator).toLowerCase();
    const exact = list.find((x) => x.name.toLowerCase() === target && x.generator.toLowerCase() === genTarget);
    if (exact) return exact;
  }
  return list.find((x) => x.name.toLowerCase() === target);
}

export function findSavedEntry(name: string, generator?: string): SavedNameEntry | undefined {
  const names = getSavedNames();
  return findInList(names, name, generator);
}

export function toggleSaveName(
  name: string,
  generator: GeneratorId | string,
  style: string,
  collectionId?: string
): boolean {
  const clean = safeTrim(name);
  if (!clean) return false;
  const names = getSavedNames();
  const existing = findInList(names, clean, generator);

  if (existing) {
    existing.saved = !existing.saved;
    if (generator) existing.generator = generator;
    if (style) existing.style = style;
    if (collectionId !== undefined) existing.collectionId = collectionId;

    if (!isEntryActive(existing)) {
      const filtered = names.filter((x) => x.id !== existing.id);
      saveAllNames(filtered);
      return false;
    }
    saveAllNames(names);
    return existing.saved;
  } else {
    const newEntry: SavedNameEntry = {
      id: generateId(),
      name: clean,
      generator,
      style,
      saved: true,
      liked: false,
      note: '',
      collectionId,
      rating: getStoredRating(clean),
      createdAt: new Date().toISOString(),
    };
    names.unshift(newEntry);
    saveAllNames(names);
    return true;
  }
}

export function toggleLikeName(name: string, generator: GeneratorId | string, style: string): boolean {
  const clean = safeTrim(name);
  if (!clean) return false;
  const names = getSavedNames();
  const existing = findInList(names, clean, generator);

  if (existing) {
    existing.liked = !existing.liked;
    if (generator) existing.generator = generator;
    if (style) existing.style = style;

    if (!isEntryActive(existing)) {
      const filtered = names.filter((x) => x.id !== existing.id);
      saveAllNames(filtered);
      return false;
    }
    saveAllNames(names);
    return existing.liked;
  } else {
    const newEntry: SavedNameEntry = {
      id: generateId(),
      name: clean,
      generator,
      style,
      saved: false,
      liked: true,
      note: '',
      rating: getStoredRating(clean),
      createdAt: new Date().toISOString(),
    };
    names.unshift(newEntry);
    saveAllNames(names);
    return true;
  }
}

export function updateEntryNote(
  name: string,
  note: string,
  generator?: GeneratorId | string,
  style?: string
): boolean {
  const clean = safeTrim(name);
  if (!clean) return false;
  const names = getSavedNames();
  const existing = findInList(names, clean, generator);

  if (existing) {
    existing.note = safeTrim(note);
    if (generator) existing.generator = generator;
    if (style) existing.style = style;

    if (!isEntryActive(existing)) {
      const filtered = names.filter((x) => x.id !== existing.id);
      saveAllNames(filtered);
      return true;
    }
    saveAllNames(names);
    return true;
  } else {
    const newEntry: SavedNameEntry = {
      id: generateId(),
      name: clean,
      generator: generator || 'fantasy',
      style: style || 'warrior',
      saved: false,
      liked: false,
      note: safeTrim(note),
      rating: getStoredRating(clean),
      createdAt: new Date().toISOString(),
    };
    if (isEntryActive(newEntry)) {
      names.unshift(newEntry);
      saveAllNames(names);
    }
    return true;
  }
}

export function assignNameToCollection(name: string, collectionId?: string): boolean {
  const clean = safeTrim(name);
  if (!clean) return false;
  const names = getSavedNames();
  const existing = findInList(names, clean);
  if (!existing) return false;

  existing.collectionId = collectionId ? safeTrim(collectionId) : undefined;
  saveAllNames(names);
  return true;
}

export function deleteSavedName(name: string, generator?: string): boolean {
  const clean = safeTrim(name);
  if (!clean) return false;
  const names = getSavedNames();
  const target = clean.toLowerCase();
  const filtered = names.filter((x) => {
    if (x.name.toLowerCase() !== target) return true;
    if (generator && x.generator.toLowerCase() !== generator.toLowerCase()) return true;
    return false;
  });
  saveAllNames(filtered);
  try {
    localStorage.removeItem('nameforge_rating_' + clean);
  } catch {}
  return true;
}

/* =====================================================================
   COLLECTIONS CRUD
===================================================================== */

export function getCollections(): NamedCollection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({
      id: safeTrim(c.id) || generateId(),
      name: safeTrim(c.name) || 'Collection sans nom',
      description: safeTrim(c.description),
      color: safeTrim(c.color) || '#8b5cf6',
      createdAt: safeTrim(c.createdAt) || new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Error reading collections from localStorage', e);
    return [];
  }
}

export function saveCollections(collections: NamedCollection[]): boolean {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    notifyStorageChange();
    return true;
  } catch (e) {
    console.error('Error saving collections', e);
    return false;
  }
}

export function createCollection(name: string, description = '', color = '#8b5cf6'): NamedCollection | null {
  const clean = safeTrim(name);
  if (!clean) return null;
  const list = getCollections();
  const newCol: NamedCollection = {
    id: generateId(),
    name: clean,
    description: safeTrim(description),
    color,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newCol);
  saveCollections(list);
  return newCol;
}

export function updateCollection(id: string, name: string, description: string, color?: string): boolean {
  const list = getCollections();
  const existing = list.find((c) => c.id === id);
  if (!existing) return false;
  existing.name = safeTrim(name) || existing.name;
  existing.description = safeTrim(description);
  if (color) existing.color = color;
  return saveCollections(list);
}

export function deleteCollection(id: string): boolean {
  const list = getCollections();
  const filtered = list.filter((c) => c.id !== id);
  // Also unassign names belonging to this collection
  const names = getSavedNames();
  names.forEach((n) => {
    if (n.collectionId === id) {
      n.collectionId = undefined;
    }
  });
  saveAllNames(names);
  return saveCollections(filtered);
}

/* =====================================================================
   GENERATION HISTORY (50 RECENT NAMES)
===================================================================== */

export function getGenerationHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addGenerationHistory(
  entries: Array<{
    name: string;
    generatorId: GeneratorId | string;
    style: string;
    tone: string;
    description: string;
    bestFor: string;
  }>
): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getGenerationHistory();
    const existingNames = new Set(current.map((x) => x.name.toLowerCase()));
    const newItems: HistoryEntry[] = [];

    for (const item of entries) {
      if (!existingNames.has(item.name.toLowerCase())) {
        existingNames.add(item.name.toLowerCase());
        newItems.push({
          id: generateId(),
          name: item.name,
          generator: item.generatorId,
          style: item.style,
          tone: item.tone,
          description: item.description,
          bestFor: item.bestFor,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    const updated = [...newItems, ...current].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    notifyStorageChange();
  } catch (e) {
    console.error('Error saving generation history', e);
  }
}

export function clearGenerationHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    notifyStorageChange();
  } catch (e) {
    console.error('Error clearing history', e);
  }
}

/* =====================================================================
   STATS & CLEAR ALL
===================================================================== */

export function getNameForgeStats(): StorageStats {
  const names = getSavedNames();
  const collections = getCollections();
  const history = getGenerationHistory();
  const uniqueGens = new Set(names.map((x) => x.generator).filter(Boolean));

  return {
    total: names.length,
    saved: names.filter((x) => x.saved).length,
    liked: names.filter((x) => x.liked).length,
    notes: names.filter((x) => safeTrim(x.note) !== '').length,
    generators: uniqueGens.size,
    collections: collections.length,
    history: history.length,
  };
}

export function clearAllSavedNames(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COLLECTIONS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    notifyStorageChange();
    return true;
  } catch (e) {
    console.error('Error clearing localStorage', e);
    return false;
  }
}

/* =====================================================================
   IMPORT & EXPORT (JSON & CSV)
===================================================================== */

export function exportDataJSON(): string {
  const bundle: ExportBundle = {
    version: 2,
    appName: 'NameForge',
    exportedAt: new Date().toISOString(),
    names: getSavedNames(),
    collections: getCollections(),
    history: getGenerationHistory(),
  };
  return JSON.stringify(bundle, null, 2);
}

export function exportDataCSV(): string {
  const names = getSavedNames();
  const collections = getCollections();
  const colMap = new Map<string, string>();
  collections.forEach((c) => colMap.set(c.id, c.name));

  const header = [
    'Nom',
    'Generateur',
    'Style',
    'Enregistre (Saved)',
    'Aime (Liked)',
    'Note etoiles',
    'Collection',
    'Note privee',
    'Date creation',
  ];

  const escapeCSV = (field: any) => {
    const str = String(field ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = names.map((n) => [
    escapeCSV(n.name),
    escapeCSV(n.generator),
    escapeCSV(n.style),
    escapeCSV(n.saved ? 'Oui' : 'Non'),
    escapeCSV(n.liked ? 'Oui' : 'Non'),
    escapeCSV(n.rating || 0),
    escapeCSV(n.collectionId ? colMap.get(n.collectionId) || 'Autre' : 'Aucune'),
    escapeCSV(n.note || ''),
    escapeCSV(n.createdAt),
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function importDataJSON(jsonStr: string): ImportResult {
  const result: ImportResult = {
    success: false,
    added: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      result.errors.push('Format de fichier JSON invalide.');
      return result;
    }

    // Check if it is an array of names or a full bundle
    const rawNames: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.names)
      ? parsed.names
      : [];

    const rawCollections: any[] = Array.isArray(parsed.collections) ? parsed.collections : [];

    const existingNames = getSavedNames();
    const existingMap = new Map<string, SavedNameEntry>();
    existingNames.forEach((item) => {
      existingMap.set(item.name.toLowerCase() + '_' + item.generator.toLowerCase(), item);
    });

    // Import Collections first
    if (rawCollections.length > 0) {
      const currentCols = getCollections();
      const colIdSet = new Set(currentCols.map((c) => c.id));
      for (const col of rawCollections) {
        if (col && col.name && !colIdSet.has(col.id)) {
          currentCols.push({
            id: col.id || generateId(),
            name: safeTrim(col.name),
            description: safeTrim(col.description),
            color: col.color || '#8b5cf6',
            createdAt: col.createdAt || new Date().toISOString(),
          });
        }
      }
      saveCollections(currentCols);
    }

    // Import Names with merge
    for (const item of rawNames) {
      const entry = normalizeEntry(item);
      if (!entry) {
        result.skipped++;
        continue;
      }

      const key = entry.name.toLowerCase() + '_' + entry.generator.toLowerCase();
      if (existingMap.has(key)) {
        const current = existingMap.get(key)!;
        let modified = false;
        if (entry.saved && !current.saved) {
          current.saved = true;
          modified = true;
        }
        if (entry.liked && !current.liked) {
          current.liked = true;
          modified = true;
        }
        if (entry.note && entry.note !== current.note) {
          if (!current.note) {
            current.note = entry.note;
          } else if (!current.note.includes(entry.note)) {
            current.note = `${current.note} | ${entry.note}`;
          }
          modified = true;
        }
        if (entry.rating && (!current.rating || entry.rating > current.rating)) {
          current.rating = entry.rating;
          modified = true;
        }
        if (entry.collectionId && !current.collectionId) {
          current.collectionId = entry.collectionId;
          modified = true;
        }
        if (modified) {
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        existingNames.unshift(entry);
        existingMap.set(key, entry);
        result.added++;
      }
    }

    saveAllNames(existingNames);
    result.success = true;
    return result;
  } catch (e: any) {
    result.errors.push(e?.message || 'Erreur lors de la lecture du fichier JSON.');
    return result;
  }
}
