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

export interface AgendaBK {
  id?: string;
  tanggal: string;
  hari: string;
  uraian_1: string;
  uraian_2: string;
  uraian_3: string;
  uraian_4: string;
  uraian_5: string;
  uraian_6: string;
  uraian_7: string;
  uraian_8: string;
  sasaran: string;
  link_dokumentasi: string;
  keterangan: string;
  created_at?: string;
}
