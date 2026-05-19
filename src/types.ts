export interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: string;
  color?: string; // Hex color or Tailwind color class key
  icon?: string;  // Lucide icon identifier
}

export type ThemeAccent = 'emerald' | 'amber' | 'indigo' | 'rose' | 'cyan' | 'purple';

export interface ThemeConfig {
  id: ThemeAccent;
  name: string;
  primary: string;
  primaryHover: string;
  glow: string;
  border3d: string;
  shadow3d: string;
  bgGradient: string;
}

export interface Siswa {
  id?: string;
  nis: string;
  nama: string;
  kelas: string;
  created_at?: string;
}
