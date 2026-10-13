import {
  FormatOption,
  GenderOption,
  GeneratedName,
  GeneratorId,
  LengthOption,
  SubcategoryData,
} from '../types';
import { SUBCATEGORIES_DATA } from '../data/subcategories';
import { resolveStyleData } from '../data/styles';
import { addGenerationHistory } from './storage';

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
      .replace(/[^A-Za-zÀ-ÿ0-9' -]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function buildBase(d: SubcategoryData, length: LengthOption): string {
  const p = (randomItem(d.prefixes) as string) || 'Ael';
  const s = (randomItem(d.suffixes) as string) || 'dor';
  const m = (randomItem(d.middle || []) as string) || '';

  let n = '';
  if (length === 'short') {
    n = p + (s.length > 4 ? s.slice(0, Math.max(2, Math.ceil(s.length / 2))) : s);
  } else if (length === 'long') {
    n = p + (m || '') + s;
  } else {
    n = p + s;
  }

  // Prevent awkward triplicated letters
  n = normalize(
    n
      .replace(/([aeiou])\1{2,}/gi, '$1')
      .replace(/([A-Za-z])\1{2,}/gi, '$1$1')
  );
  return n;
}

function generateSingleName(
  d: SubcategoryData,
  length: LengthOption,
  format: FormatOption,
  gender: GenderOption
): string {
  let n = buildBase(d, length);

  if (format === 'full') {
    let last = buildBase(d, length === 'short' ? 'medium' : length);
    let guard = 0;
    while (last === n && guard++ < 5) {
      last = buildBase(d, length === 'short' ? 'medium' : length);
    }
    n = n + ' ' + last;
  } else if (format === 'group') {
    const g =
      (randomItem(d.groupTypes || ['Clan', 'House', 'Order', 'Guild', 'Realm']) as string) ||
      'House';
    n = g + ' ' + n;
  } else {
    // Single / Title format
    if (Math.random() < 0.32) {
      const title =
        (randomItem(
          d.titles || ['the Brave', 'the Ancient', 'the Silent', 'the Wise', 'the Guardian']
        ) as string) || 'the Brave';
      n = n + ' ' + title;
    }
  }

  if (gender === 'female') {
    const fPrefix =
      (randomItem(
        d.femaleStarts || ['Ael', 'Ela', 'Lira', 'Mira', 'Sera', 'Nyla', 'Yuna', 'Aria']
      ) as string) || 'Ael';
    n = fPrefix + (n.length > 4 ? n.slice(Math.min(3, n.length - 1)) : n);
  } else if (gender === 'male') {
    const mPrefix =
      (randomItem(
        d.maleStarts || ['Kael', 'Ryn', 'Thar', 'Aren', 'Darin', 'Kian']
      ) as string) || 'Kael';
    n = mPrefix + (n.length > 4 ? n.slice(Math.min(3, n.length - 1)) : n);
  }

  return normalize(n);
}

export interface GenerateOptions {
  generator: GeneratorId;
  style: string;
  length?: LengthOption;
  format?: FormatOption;
  gender?: GenderOption;
  quantity?: number;
}

export function generateNames(options: GenerateOptions): GeneratedName[] {
  const {
    generator,
    style,
    length = 'medium',
    format = 'title',
    gender = 'any',
    quantity = 9,
  } = options;

  const resolved = resolveStyleData(generator, style, SUBCATEGORIES_DATA);
  const out: GeneratedName[] = [];
  const seen = new Set<string>();
  let tries = 0;
  const maxTries = quantity * 150;

  while (out.length < quantity && tries < maxTries) {
    tries++;
    const nameStr = generateSingleName(resolved, length, format, gender);
    if (!nameStr || seen.has(nameStr)) continue;
    seen.add(nameStr);

    const desc =
      (randomItem(resolved.descriptions) as string) ||
      '✨ A unique NameForge name shaped for this archetype.';

    out.push({
      name: nameStr,
      description: desc,
      style: resolved.label || style,
      icon: resolved.icon || '✨',
      bestFor: resolved.bestFor || 'characters and fictional worlds',
      tone: resolved.tone || 'Distinctive • memorable • thematic',
      generatorId: generator,
    });
  }

  // Record into generation history
  if (out.length > 0) {
    addGenerationHistory(out);
  }

  return out;
}
