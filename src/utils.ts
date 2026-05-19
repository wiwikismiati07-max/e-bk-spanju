import { 
  Map, 
  Globe, 
  Code, 
  Calculator, 
  Palette, 
  Link, 
  Book, 
  Music, 
  Video, 
  Gamepad2, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import React from 'react';

// Map string values to Lucide icons dynamically
export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Map,
  Globe,
  Code,
  Calculator,
  Palette,
  Link,
  Book,
  Music,
  Video,
  Gamepad2,
  Layers,
  ArrowUpRight,
  Sparkles,
  HelpCircle
};

export const COLOR_THEMES = {
  emerald: {
    bg: 'bg-emerald-50/80 text-emerald-800 border-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(16,185,129,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(16,185,129,0.25)]',
    solidBg: 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-555',
    accentLine: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/40'
  },
  indigo: {
    bg: 'bg-indigo-50/80 text-indigo-800 border-indigo-100',
    border: 'border-indigo-400',
    text: 'text-indigo-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(99,102,241,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(99,102,241,0.25)]',
    solidBg: 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-555',
    accentLine: 'bg-indigo-505',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/40'
  },
  cyan: {
    bg: 'bg-cyan-50/80 text-cyan-900 border-cyan-100',
    border: 'border-cyan-400',
    text: 'text-cyan-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(6,182,212,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(6,182,212,0.25)]',
    solidBg: 'bg-cyan-600 text-slate-950 border-cyan-700 hover:bg-cyan-555',
    accentLine: 'bg-cyan-400',
    badge: 'bg-cyan-50 text-cyan-900 border-cyan-200/40'
  },
  amber: {
    bg: 'bg-amber-50/80 text-amber-900 border-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(245,158,11,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(245,158,11,0.25)]',
    solidBg: 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-450',
    accentLine: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-900 border-amber-200/40'
  },
  rose: {
    bg: 'bg-rose-50/80 text-rose-800 border-rose-100',
    border: 'border-rose-400',
    text: 'text-rose-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(244,63,94,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(244,63,94,0.25)]',
    solidBg: 'bg-rose-600 text-white border-rose-700 hover:bg-rose-555',
    accentLine: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-800 border-rose-200/40'
  } as const,
  purple: {
    bg: 'bg-purple-50/80 text-purple-800 border-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-700',
    deepShadow: 'shadow-[0_4px_0_0_rgba(168,85,247,0.15)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgba(168,85,247,0.25)]',
    solidBg: 'bg-purple-600 text-white border-purple-700 hover:bg-purple-555',
    accentLine: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-800 border-purple-200/40'
  }
};

export type ThemeKey = keyof typeof COLOR_THEMES;

export function getSafeEmbedUrl(url: string): string {
  if (!url) return '';
  // Check if standard website but missing http/https, default to https
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('local://')) {
    return `https://${url}`;
  }
  return url;
}
