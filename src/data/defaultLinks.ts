import { SavedLink } from '../types';

export const DEFAULT_LINKS: SavedLink[] = [
  {
    id: '1',
    title: 'OpenStreetMap (World Map)',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=95.0%2C-11.0%2C141.0%2C6.0&layer=mapnik',
    category: 'Sains & Peta',
    color: 'emerald',
    icon: 'Map'
  },
  {
    id: '2',
    title: 'Wikipedia Mobile',
    url: 'https://id.m.wikipedia.org',
    category: 'Informasi',
    color: 'indigo',
    icon: 'Globe'
  },
  {
    id: '3',
    title: 'Tailwind Play Sandbox',
    url: 'https://play.tailwindcss.com',
    category: 'Developer',
    color: 'cyan',
    icon: 'Code'
  },
  {
    id: '4',
    title: 'Calculator 3D Built-In',
    url: 'local://calculator',
    category: 'Utilitas',
    color: 'amber',
    icon: 'Calculator'
  },
  {
    id: '5',
    title: 'Papan Gambar 3D (Canvas)',
    url: 'local://sketch',
    category: 'Kreatif',
    color: 'rose',
    icon: 'Palette'
  }
];

export const CATEGORIES = [
  'Semua',
  'Informasi',
  'Sains & Peta',
  'Developer',
  'Utilitas',
  'Kreatif',
  'Lainnya'
];
