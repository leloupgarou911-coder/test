export type GeneratorId =
  | 'fantasy'
  | 'anime'
  | 'rpg'
  | 'gaming'
  | 'dragon'
  | 'elf'
  | 'kingdom'
  | 'sci-fi'
  | 'vampire'
  | 'warrior'
  | 'wizard';

export type LengthOption = 'short' | 'medium' | 'long';
export type FormatOption = 'title' | 'full' | 'group';
export type GenderOption = 'any' | 'female' | 'male';

export interface GeneratedName {
  name: string;
  description: string;
  style: string;
  icon: string;
  bestFor: string;
  tone: string;
  generatorId: GeneratorId;
}

export interface NamedCollection {
  id: string;
  name: string;
  description: string;
  color?: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  name: string;
  generator: GeneratorId | string;
  style: string;
  tone: string;
  description: string;
  bestFor: string;
  generatedAt: string;
}

export interface SavedNameEntry {
  id: string;
  name: string;
  generator: GeneratorId | string;
  style: string;
  saved: boolean;
  liked: boolean;
  note: string;
  collectionId?: string;
  rating?: number;
  createdAt: string;
}

export interface StyleOption {
  key: string;
  label: string;
  icon?: string;
}

export interface SubcategoryData {
  label: string;
  icon: string;
  bestFor: string;
  prefixes: string[];
  suffixes: string[];
  middle?: string[];
  descriptions: string[];
  groupTypes?: string[];
  titles?: string[];
  femaleStarts?: string[];
  maleStarts?: string[];
  tone?: string;
  styleKey?: string;
}

export interface GeneratorMeta {
  id: GeneratorId;
  title: string;
  shortTitle: string;
  icon: string;
  badge: string;
  h1a: string;
  h1b: string;
  description: string;
  generatorTitle: string;
  generatorSubtitle: string;
  category: 'fantasy' | 'fiction' | 'gaming' | 'worldbuilding';
  advantages?: string[];
  limits?: string[];
  guideTitle: string;
  guide: { h: string; p: string }[];
  cardsTitle: string;
  cards: { icon: string; h: string; p: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  footer: string;
  professionalDetails?: {
    title: string;
    intro: string;
    cards: [string, string, string][];
    steps: string[];
  };
}

export interface StorageStats {
  total: number;
  saved: number;
  liked: number;
  notes: number;
  generators: number;
  collections: number;
  history: number;
}

export interface ExportBundle {
  version: number;
  appName: string;
  exportedAt: string;
  names: SavedNameEntry[];
  collections: NamedCollection[];
  history: HistoryEntry[];
}

export interface ImportResult {
  success: boolean;
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}
