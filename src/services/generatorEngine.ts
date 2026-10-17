import {
  FormatOption,
  GenderOption,
  GeneratedName,
  GeneratorId,
  GenLanguageCode,
  LengthOption,
  SubcategoryData,
} from '../types';
import { SUBCATEGORIES_DATA } from '../data/subcategories';
import { resolveStyleData } from '../data/styles';
import { addGenerationHistory } from './storage';
import { GENERATORS_METADATA } from '../data/generators';

const RECENT_NAMES_KEY = 'nameforge_recent_names';
const RECENT_LIMIT = 120;

function randomItem<T>(arr?: T[]): T | '' {
  if (!arr || !arr.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(v: string): string {
  const str = String(v || '').trim();
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function normalize(s: string): string {
  return cap(
    String(s || '')
      .replace(/[^A-Za-zÀ-ÿ0-9'’& -]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/* =====================================================================
   1. SIMILARITY & LEVENSHTEIN DISTANCE FILTER
===================================================================== */

export function calculateLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // suppression
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[al][bl];
}

export function isTooSimilar(candidate: string, existingList: string[]): boolean {
  const candLower = candidate.toLowerCase();
  for (const existing of existingList) {
    const exLower = existing.toLowerCase();
    if (candLower === exLower) return true;

    // Direct substring collision if length >= 4
    if (candLower.length >= 4 && exLower.length >= 4) {
      if (candLower.includes(exLower) || exLower.includes(candLower)) {
        return true;
      }
    }

    // Levenshtein distance check for short & medium words
    const dist = calculateLevenshteinDistance(candLower, exLower);
    if (candLower.length <= 5 && dist <= 1) return true;
    if (candLower.length > 5 && dist <= 2) return true;
  }
  return false;
}

/* =====================================================================
   2. LINGUISTIC PHONETICS & ROOTS
===================================================================== */

const LANGUAGE_PHONETICS: Record<
  GenLanguageCode,
  { prefixes: string[]; suffixes: string[]; titleWords: string[]; vowels: string[]; consonants: string[] }
> = {
  auto: {
    prefixes: [],
    suffixes: [],
    titleWords: [],
    vowels: ['a', 'e', 'i', 'o', 'u', 'y'],
    consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'],
  },
  fr: {
    prefixes: ['Val', 'Mont', 'Clair', 'Beau', 'Soleil', 'Aurore', 'Bel', 'Chant', 'Font', 'Roc', 'Mir', 'Lys', 'Doux'],
    suffixes: ['val', 'mont', 'elle', 'eur', 'ance', 'ier', 'on', 'ard', 'ière', 'ac', 'ain', 'euil', 'or'],
    titleWords: ['le Brave', 'l’Audacieux', 'le Grand', 'le Sage', 'le Vaillant', 'le Juste'],
    vowels: ['a', 'e', 'i', 'o', 'u', 'é', 'è', 'eau'],
    consonants: ['v', 'l', 'm', 'r', 's', 'c', 'b', 'f', 't', 'p', 'd'],
  },
  en: {
    prefixes: ['Star', 'Swift', 'Bright', 'Iron', 'Stone', 'Oak', 'Gold', 'Silver', 'Storm', 'Shadow', 'Frost', 'Hawk'],
    suffixes: ['ford', 'wood', 'field', 'craft', 'well', 'ton', 'dale', 'stone', 'worth', 'brook', 'gate', 'crest'],
    titleWords: ['the Bold', 'the Swift', 'the Valiant', 'the Fearless', 'the Keeper', 'the Vanguard'],
    vowels: ['a', 'e', 'i', 'o', 'u', 'ea', 'ee', 'ai'],
    consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'w'],
  },
  ja: {
    prefixes: ['Kae', 'Shin', 'Ryu', 'Sora', 'Ren', 'Haru', 'Aki', 'Taka', 'Yuki', 'Kaze', 'Kira', 'Hana', 'Mio'],
    suffixes: ['maru', 'to', 'ya', 'shi', 'zen', 'jin', 'nari', 'ro', 'sora', 'ka', 'ki', 'ko', 'suke'],
    titleWords: ['le Gardien', 'l’Éveillé', 'le Maître', 'le Lame-Noire', 'l’Ombre'],
    vowels: ['a', 'i', 'u', 'e', 'o'],
    consonants: ['k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
  },
  ar: {
    prefixes: ['Al-', 'Nour', 'Tariq', 'Zayd', 'Malik', 'Rayan', 'Qas', 'Badr', 'Farid', 'Karim', 'Sami', 'Amir'],
    suffixes: ['an', 'ir', 'din', 'i', 'our', 'am', 'al', 'eh', 'im', 'as', 'id', 'oun'],
    titleWords: ['le Noble', 'le Magnanime', 'le Conquérant', 'le Juste', 'le Bienveillant'],
    vowels: ['a', 'i', 'u', 'ou', 'ai'],
    consonants: ['b', 't', 'j', 'd', 'r', 'z', 's', 'q', 'k', 'l', 'm', 'n', 'h'],
  },
  latin: {
    prefixes: ['Aurel', 'Cael', 'Sylv', 'Maxi', 'Valer', 'Cass', 'Luc', 'Mar', 'Sever', 'Jul', 'Titus', 'Octav'],
    suffixes: ['ius', 'or', 'is', 'aris', 'ia', 'on', 'ora', 'us', 'ian', 'um', 'ix', 'ex'],
    titleWords: ['Magnus', 'Victor', 'Invictus', 'Augustus', 'Felix', 'Priscus'],
    vowels: ['a', 'e', 'i', 'o', 'u', 'ae'],
    consonants: ['c', 'd', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'],
  },
  nordic: {
    prefixes: ['Thor', 'Ragnar', 'Bjorn', 'Sig', 'Erik', 'Gunn', 'Sven', 'Olaf', 'Ivar', 'Val', 'Har', 'As'],
    suffixes: ['gard', 'stein', 'son', 'grim', 'heim', 'vald', 'rik', 'ulf', 'mund', 'var', 'karl', 'brand'],
    titleWords: ['Briseciel', 'au Cœur de Pierre', 'le Grand Viking', 'Hache-Rouge', 'l’Invaincu'],
    vowels: ['a', 'e', 'i', 'o', 'u', 'y'],
    consonants: ['b', 'd', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v'],
  },
  tech: {
    prefixes: ['Neo', 'Syn', 'Omni', 'Velo', 'Kinet', 'Hyper', 'Nex', 'Zeta', 'Volt', 'Aero', 'Quantum', 'Pulse', 'Cyber'],
    suffixes: ['ix', 'ex', 'iq', 'os', 'ify', 'ly', 'io', 'on', 'um', 'ora', 'core', 'net', 'flow'],
    titleWords: ['Core', 'Prime', 'Ultra', 'Next', 'System', 'Engine', 'Stack'],
    vowels: ['a', 'e', 'i', 'o', 'u', 'y'],
    consonants: ['b', 'c', 'd', 'f', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x', 'z'],
  },
};

/* =====================================================================
   3. MULTI-STRATEGY GENERATION ENGINE
===================================================================== */

export type GenerationStrategy =
  | 'phonetic_harmony'
  | 'neologism'
  | 'portmanteau_blend'
  | 'symbolic_evocative'
  | 'punchy_minimal'
  | 'epic_compound';

/**
 * Strategy 1: Classical Syllable & Phonetic Harmony
/**
 * Intelligently combines prefix and suffix parts based on whether they are
 * independent words/phrases (space-separated) or phoneme syllables (joined).
 */
export function combineParts(p: string, s: string): string {
  const cleanP = String(p || '').trim();
  const cleanS = String(s || '').trim();
  if (!cleanP) return cleanS;
  if (!cleanS) return cleanP;

  // Apostrophe attachment (e.g. "L'Atelier", "d'Émeraude")
  if (cleanP.endsWith("'") || cleanP.endsWith("’")) {
    return cleanWord(cleanP + cleanS);
  }

  // Check if either part contains spaces or punctuation
  const pHasSpace = cleanP.includes(' ');
  const sHasSpace = cleanS.includes(' ');

  // Bound inflectional/derivative suffixes that should be glued (e.g. -ix, -ex, -ify, -ora, -ly, -ien, -ette)
  const isBoundSuffix = /^(ix|ex|iq|ify|ly|ia|um|is|us|os|or|on|en|el|ar|er|ine|elle|ette|ance|ence|ium|oid|to|ki|ya|shi|jin|ka|ro)$/i.test(
    cleanS
  );

  if (pHasSpace || sHasSpace) {
    return cleanWord(`${cleanP} ${cleanS}`);
  }

  // If both parts look like capitalized standalone words and not bound suffixes
  const isWordP = cleanP.length >= 4 || /^[A-ZÀ-ÿ][a-zà-ÿ]{2,}$/.test(cleanP);
  const isWordS = cleanS.length >= 3 && /^[A-ZÀ-ÿ]/.test(cleanS);

  if (isWordP && isWordS && !isBoundSuffix) {
    return cleanWord(`${cleanP} ${cleanS}`);
  }

  return cleanWord(cleanP + cleanS.toLowerCase());
}

/**
 * Strategy 1: Classical Syllable & Phonetic Harmony
 */
function generatePhoneticHarmony(
  d: SubcategoryData,
  length: LengthOption,
  genLang: GenLanguageCode
): string {
  const langRules = LANGUAGE_PHONETICS[genLang] || LANGUAGE_PHONETICS.auto;
  const prefixes =
    langRules.prefixes.length > 0 && Math.random() < 0.4
      ? langRules.prefixes
      : d.prefixes;
  const suffixes =
    langRules.suffixes.length > 0 && Math.random() < 0.4
      ? langRules.suffixes
      : d.suffixes;

  const p = (randomItem(prefixes) as string) || (d.prefixes[0] || 'Nova');
  const s = (randomItem(suffixes) as string) || (d.suffixes[0] || 'is');
  const m = (randomItem(d.middle || []) as string) || '';

  if (length === 'short') {
    const compactSuffix = s.length > 3 && !s.includes(' ') ? s.slice(0, 2) : s;
    return combineParts(p, compactSuffix);
  }
  if (length === 'long' && m) {
    return combineParts(combineParts(p, m), s);
  }
  return combineParts(p, s);
}

/**
 * Strategy 2: Neologism (Constructed pronounceable words from category's own vocabulary)
 */
function generateNeologism(
  d: SubcategoryData,
  length: LengthOption,
  genLang: GenLanguageCode
): string {
  const singleWords = [...d.prefixes, ...d.suffixes].filter((w) => !w.includes(' '));
  if (singleWords.length >= 2) {
    const w1 = randomItem(singleWords) || 'Nova';
    const w2 = randomItem(singleWords) || 'Velo';
    const sliceLen1 = Math.max(2, Math.min(4, Math.floor(w1.length * 0.6)));
    const sliceLen2 = Math.max(2, Math.min(4, Math.floor(w2.length * 0.5)));
    const p1 = w1.slice(0, sliceLen1);
    const p2 = w2.slice(-sliceLen2);
    return cleanWord(cap(p1 + p2.toLowerCase()));
  }
  return generatePhoneticHarmony(d, length, genLang);
}

/**
 * Strategy 3: Portmanteau Blend (Blending two distinct evocative roots)
 */
function generatePortmanteauBlend(
  d: SubcategoryData,
  genLang: GenLanguageCode
): string {
  const rootsA = d.prefixes.length > 0 ? d.prefixes : ['Nova', 'Kaly', 'Velo', 'Aero', 'Zeta', 'Sol'];
  const rootsB = d.suffixes.length > 0 ? d.suffixes : ['tech', 'flow', 'is', 'ora', 'craft', 'wave'];

  const first = (randomItem(rootsA) as string) || 'Nova';
  const second = (randomItem(rootsB) as string) || 'craft';

  // If either contains spaces or is a multi-word phrase, cleanly combine instead of slicing
  if (first.includes(' ') || second.includes(' ') || first.length > 10) {
    return combineParts(first, second);
  }

  // Smooth blending transition at intersection
  const blendPoint = Math.max(2, Math.floor(first.length * 0.7));
  const front = first.slice(0, blendPoint);
  const back = second.toLowerCase();

  return cleanWord(front + back);
}

/**
 * Strategy 4: Symbolic & Evocative Root Composition
 */
function generateSymbolicEvocative(
  generatorId: GeneratorId,
  d: SubcategoryData,
  genLang: GenLanguageCode
): string {
  const symbolicMap: Record<string, string[]> = {
    brand: ['Aura', 'Lumi', 'Pure', 'Vesta', 'Sol', 'Verve', 'Cael', 'Nobil'],
    fantasy: ['Ael', 'Myth', 'Sylv', 'Astra', 'Rune', 'Eldar', 'Ignis', 'Chrono'],
    startup: ['Veloce', 'Pulse', 'Hyper', 'Nexus', 'Vertex', 'Synt', 'Kinet', 'Apex'],
    dragon: ['Pyros', 'Drak', 'Ignar', 'Volcan', 'Brim', 'Scal', 'Vapour', 'Terror'],
    gamertag: ['Vex', 'Rift', 'Apex', 'Strike', 'Ghost', 'Zen', 'Kyo', 'Raze'],
    boss: ['Mael', 'Nox', 'Malok', 'Gor', 'Zul', 'Khar', 'Dread', 'Void'],
    weapon: ['Chante', 'Fend', 'Tranche', 'Aube', 'Givre', 'Foudre', 'Rune'],
    starship: ['Vanguard', 'Aurora', 'Titan', 'Horizon', 'Endeavour', 'Aegis'],
    cyberpunk: ['Chrome', 'Neon', 'Glitch', 'Spike', 'Wire', 'Cyber', 'Data'],
  };

  const pool = symbolicMap[generatorId] || d.prefixes;
  const root = randomItem(pool) || 'Nova';
  const suffixPool = d.suffixes.length > 0 ? d.suffixes : ['is', 'or', 'ex', 'ix', 'um', 'ia'];
  const suffix = randomItem(suffixPool) || 'is';

  return combineParts(root, suffix);
}

/**
 * Strategy 5: Punchy Minimal (Compact, 1-2 sharp syllables)
 */
function generatePunchyMinimal(d: SubcategoryData): string {
  const p = (randomItem(d.prefixes) as string) || 'Vex';
  const s = (randomItem(d.suffixes) as string) || 'o';

  // If p is a full multi-word phrase (e.g. "Théorème de", "Le Comptoir", "Food Truck")
  if (p.includes(' ') || s.includes(' ') || p.length > 8) {
    return combineParts(p, s);
  }

  // Strip leading articles like L', d' when creating compact blend
  const cleanP = p.replace(/^[LlDd]['’]/, '');
  const cleanS = s.replace(/^[LlDd]['’]/, '');

  if (cleanP.length <= 4 && cleanS.length <= 4) {
    return cleanWord(cleanP + cleanS.toLowerCase());
  }
  const shortP = cleanP.slice(0, Math.min(3, cleanP.length));
  const shortS = cleanS.slice(0, Math.min(3, cleanS.length));
  return cleanWord(cap(shortP + shortS.toLowerCase()));
}

/**
 * Clean up awkward triple letters or invalid clusters
 */
function cleanWord(str: string): string {
  return normalize(
    str
      .replace(/([aeiouAEIOU])\1{2,}/gi, '$1')
      .replace(/([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z])\1{2,}/gi, '$1$1')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/* =====================================================================
   4. INTERNAL HEURISTIC SCORER
===================================================================== */

interface ScoredCandidate {
  name: string;
  score: number;
  strategy: GenerationStrategy;
}

export function scoreCandidate(
  name: string,
  lengthOpt: LengthOption,
  genderOpt: GenderOption
): number {
  if (!name || name.length < 2) return 0;

  let score = 70; // baseline acceptable quality

  const len = name.replace(/[^A-Za-z]/g, '').length;

  // Length compliance bonus/penalty
  if (lengthOpt === 'short') {
    if (len >= 3 && len <= 6) score += 15;
    else if (len > 8) score -= 20;
  } else if (lengthOpt === 'long') {
    if (len >= 8) score += 15;
    else if (len < 6) score -= 20;
  } else {
    // Medium
    if (len >= 5 && len <= 9) score += 15;
  }

  // Pronounceability & Vowel-Consonant Balance
  const vowels = (name.match(/[aeiouyAEIOUYà-ÿ]/gi) || []).length;
  const consonants = (name.match(/[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/gi) || []).length;
  const ratio = vowels / Math.max(1, consonants);

  if (ratio >= 0.4 && ratio <= 1.4) {
    score += 15; // smooth phonetic cadence
  } else if (ratio < 0.25 || ratio > 2.5) {
    score -= 25; // hard to pronounce or awkward stutter
  }

  // Penalty for awkward consonant clusters (3 consonants in a row, unless common)
  if (/[b-df-hj-np-tv-z]{4,}/i.test(name)) {
    score -= 30;
  }

  // Gender nuance scoring
  if (genderOpt === 'female') {
    if (/[aeia]$/i.test(name) || /^(Ael|Mira|Sera|Lira|Yuna|Ela)/i.test(name)) {
      score += 10;
    }
  } else if (genderOpt === 'male') {
    if (/[or|un|an|us|ar|ok]$/i.test(name) || /^(Kael|Thar|Ryn|Aren|Marc)/i.test(name)) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}

/* =====================================================================
   5. HISTORY AND RECENT NAMES WINDOW
===================================================================== */

function getRecentNames(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(RECENT_NAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordRecentNames(names: string[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getRecentNames();
    const updated = Array.from(new Set([...names, ...current])).slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_NAMES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/* =====================================================================
   6. METADATA & PRONUNCIATION
===================================================================== */

function generatePronunciation(name: string): string {
  const clean = name.replace(/[^A-Za-zÀ-ÿ ]/g, '');
  const parts = clean.split(' ');
  const phoneticParts = parts.map((part) => {
    if (part.length <= 3) return part.toUpperCase();
    const half = Math.ceil(part.length / 2);
    return `${part.slice(0, half).toLowerCase()}-${part.slice(half).toUpperCase()}`;
  });
  return `[${phoneticParts.join(' ')}]`;
}

function buildProfessionalMetadata(
  name: string,
  generatorId: GeneratorId,
  styleLabel: string,
  length: LengthOption
): {
  strengths: string[];
  watchouts: string[];
  disclaimer?: string;
  origin: string;
} {
  const meta = GENERATORS_METADATA[generatorId];
  const isBusiness =
    meta?.category === 'business' ||
    [
      'brand',
      'business',
      'product',
      'startup',
      'shop',
      'domain',
      'app',
      'feature',
      'service',
      'slogan',
      'crypto_token',
      'software_tool',
      'ecommerce_store',
      'marketing_agency',
    ].includes(generatorId);

  const strengths: string[] = [];
  const watchouts: string[] = [];

  if (length === 'short') {
    strengths.push('Excellente mémorisation immédiate', 'Idéal sur petits écrans, avatars et callouts');
    watchouts.push('Les noms courts sont très demandés sur les extensions .com');
  } else if (length === 'long') {
    strengths.push('Grande richesse narrative', 'Forte distinction face à la concurrence');
    watchouts.push('Testez la lisibilité rapide sur supports imprimés et en affichage réduit');
  } else {
    strengths.push('Équilibre optimal entre originalité et fluidité', 'Prononciation universelle aisée');
    watchouts.push('Vérifiez l’absence d’homonymes proches dans votre univers');
  }

  if (isBusiness) {
    strengths.push('Potentiel d’impact commercial et marque ombrelle');
    watchouts.push('Effectuez une recherche de disponibilité officielle (INPI, EUIPO, USPTO)');
  } else {
    strengths.push(`Fidèle à l’archétype ${styleLabel}`, 'Immersion thématique immédiate');
  }

  const disclaimer = isBusiness
    ? 'Avertissement juridique : Les propositions sont fournies à titre d’inspiration créative. La disponibilité de marque ou de domaine doit faire l’objet d’une vérification officielle.'
    : undefined;

  const origin = `Forge NameForge • Archétype ${styleLabel}`;

  return { strengths, watchouts, disclaimer, origin };
}

/* =====================================================================
   7. MAIN EXPORTED FUNCTION
===================================================================== */

export interface GenerateOptions {
  generator?: GeneratorId;
  generatorId?: GeneratorId;
  style?: string;
  length?: LengthOption;
  format?: FormatOption;
  gender?: GenderOption;
  genLanguage?: GenLanguageCode;
  quantity?: number;
  keyword?: string;
}

export function generateNames(options: GenerateOptions): GeneratedName[] {
  const targetGenerator = options.generator || options.generatorId || 'fantasy';
  const targetStyle = options.style || 'default';
  const {
    length = 'medium',
    format = 'title',
    gender = 'any',
    genLanguage = 'auto',
    quantity = 9,
    keyword = '',
  } = options;

  const resolved = resolveStyleData(targetGenerator, targetStyle, SUBCATEGORIES_DATA);
  const meta = GENERATORS_METADATA[targetGenerator];
  const categoryFamily = meta?.category || 'creative';
  const isFantasyOrLore = categoryFamily === 'fantasy';

  const out: GeneratedName[] = [];
  const seenInBatch: string[] = [];
  const recentNames = getRecentNames();

  const strategies: GenerationStrategy[] = [
    'phonetic_harmony',
    'neologism',
    'portmanteau_blend',
    'symbolic_evocative',
    'punchy_minimal',
    'epic_compound',
  ];

  let candidatePool: ScoredCandidate[] = [];
  let attempts = 0;
  const maxAttempts = quantity * 150;
  const cleanKw = keyword.trim().replace(/[^a-zA-ZÀ-ÿ0-9-]/g, '');

  while (candidatePool.length < quantity * 4 && attempts < maxAttempts) {
    attempts++;
    const strategy = strategies[attempts % strategies.length];
    let baseName = '';

    if (cleanKw && Math.random() < 0.65) {
      const mode = Math.random();
      const suf = randomItem(resolved.suffixes) || '';
      const pref = randomItem(resolved.prefixes) || '';
      const titleW = randomItem(resolved.titles) || '';
      const kwCap = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);

      if (mode < 0.35 && suf) {
        baseName = `${kwCap}${suf.toLowerCase()}`;
      } else if (mode < 0.65 && pref) {
        baseName = `${pref}${cleanKw.toLowerCase()}`;
      } else if (titleW) {
        baseName = `${kwCap} ${titleW}`;
      } else {
        baseName = `${kwCap}${suf ? suf.toLowerCase() : ''}`;
      }
    } else {

    switch (strategy) {
      case 'phonetic_harmony':
        baseName = generatePhoneticHarmony(resolved, length, genLanguage);
        break;
      case 'neologism':
        baseName = generateNeologism(resolved, length, genLanguage);
        break;
      case 'portmanteau_blend':
        baseName = generatePortmanteauBlend(resolved, genLanguage);
        break;
      case 'symbolic_evocative':
        baseName = generateSymbolicEvocative(targetGenerator, resolved, genLanguage);
        break;
      case 'punchy_minimal':
        baseName = generatePunchyMinimal(resolved);
        break;
      case 'epic_compound': {
        const part1 = generatePhoneticHarmony(resolved, 'short', genLanguage);
        const part2 = generatePhoneticHarmony(resolved, 'short', genLanguage);
        if (part1.includes(' ') || part2.includes(' ')) {
          baseName = part1;
        } else {
          baseName = combineParts(part1, part2);
        }
        break;
      }
    }
  }

    if (!baseName || baseName.length < 2) continue;

    // Apply Format
    let formattedName = baseName;
    if (format === 'full') {
      const surname = generatePhoneticHarmony(resolved, 'medium', genLanguage);
      if (surname.toLowerCase() !== baseName.toLowerCase()) {
        formattedName = combineParts(baseName, surname);
      }
    } else if (format === 'group') {
      const defaultGroups =
        categoryFamily === 'business'
          ? ['Atelier', 'Studio', 'Maison', 'Collectif', 'Groupe', 'Agence', 'Boutique']
          : categoryFamily === 'innovation'
          ? ['Lab', 'Engine', 'System', 'Network', 'Core', 'Project', 'Platform']
          : categoryFamily === 'fantasy'
          ? ['Ordre', 'Clan', 'Guilde', 'Cercle', 'Légion', 'Maison']
          : ['Collectif', 'Studio', 'Club', 'Troupe', 'Cercle', 'Équipe'];

      const g =
        (randomItem(resolved.groupTypes || defaultGroups) as string) ||
        defaultGroups[0];
      formattedName = `${g} ${baseName}`;
    } else if (format === 'compound') {
      const secondary = generatePunchyMinimal(resolved);
      formattedName = combineParts(baseName, secondary);
    } else {
      // Title format (only apply if the category explicitly provides titles or is high fantasy)
      if (resolved.titles && resolved.titles.length > 0 && Math.random() < 0.28) {
        const title = (randomItem(resolved.titles) as string) || '';
        if (title) {
          formattedName = combineParts(baseName, title);
        }
      } else if (isFantasyOrLore && Math.random() < 0.22) {
        const langRules = LANGUAGE_PHONETICS[genLanguage] || LANGUAGE_PHONETICS.auto;
        const titlesPool =
          langRules.titleWords.length > 0 && Math.random() < 0.6
            ? langRules.titleWords
            : ['le Brave', 'l’Ancien', 'le Silencieux', 'le Juste', 'le Gardien'];
        const title = (randomItem(titlesPool) as string) || 'le Brave';
        formattedName = combineParts(baseName, title);
      }
    }

    // Gender start adaptations (only when defined for this subcategory or when fantasy)
    if (gender === 'female' && !formattedName.includes(' ') && resolved.femaleStarts && resolved.femaleStarts.length > 0) {
      const fPrefix = randomItem(resolved.femaleStarts);
      if (fPrefix) {
        formattedName = cleanWord(fPrefix + (formattedName.length > 4 ? formattedName.slice(3) : formattedName));
      }
    } else if (gender === 'male' && !formattedName.includes(' ') && resolved.maleStarts && resolved.maleStarts.length > 0) {
      const mPrefix = randomItem(resolved.maleStarts);
      if (mPrefix) {
        formattedName = cleanWord(mPrefix + (formattedName.length > 4 ? formattedName.slice(3) : formattedName));
      }
    }

    const score = scoreCandidate(formattedName, length, gender);
    if (score >= 65) {
      candidatePool.push({ name: formattedName, score, strategy });
    }
  }

  // Sort candidate pool by quality score descending
  candidatePool.sort((a, b) => b.score - a.score);

  // Diverse Selection Phase (incorporating Levenshtein anti-similarity filter)
  const usedStrategies = new Set<GenerationStrategy>();

  for (const cand of candidatePool) {
    if (out.length >= quantity) break;

    // Check exact & similarity collision with current batch
    if (isTooSimilar(cand.name, seenInBatch)) {
      continue;
    }

    // Check recent history collision if possible
    if (recentNames.some((r) => r.toLowerCase() === cand.name.toLowerCase())) {
      continue;
    }

    seenInBatch.push(cand.name);
    usedStrategies.add(cand.strategy);

    const desc =
      (randomItem(resolved.descriptions) as string) ||
      '✨ Un nom exclusif façonné avec soin par la forge NameForge.';

    const meta = buildProfessionalMetadata(cand.name, targetGenerator, resolved.label || targetStyle, length);

    out.push({
      name: cand.name,
      description: desc,
      style: resolved.label || targetStyle,
      icon: resolved.icon || '✨',
      bestFor: resolved.bestFor || 'projets créatifs et professionnels',
      tone: resolved.tone || 'Distinctif • mémorable • percutant',
      generatorId: targetGenerator,
      pronunciation: generatePronunciation(cand.name),
      strengths: meta.strengths,
      watchouts: meta.watchouts,
      disclaimer: meta.disclaimer,
      origin: meta.origin,
    });
  }

  // Update sliding window of recent names
  if (out.length > 0) {
    recordRecentNames(out.map((x) => x.name));
    addGenerationHistory(out);
  }

  return out;
}
