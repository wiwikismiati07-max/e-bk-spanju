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
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(16,185,129)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(16,185,129)]',
    solidBg: 'bg-emerald-500 text-white border-emerald-600',
    accentLine: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
  },
  indigo: {
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    border: 'border-indigo-500',
    text: 'text-indigo-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(99,102,241)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(99,102,241)]',
    solidBg: 'bg-indigo-600 text-white border-indigo-700',
    accentLine: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-400/20'
  },
  cyan: {
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(6,182,212)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(6,182,212)]',
    solidBg: 'bg-cyan-500 text-slate-900 border-cyan-600',
    accentLine: 'bg-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20'
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500',
    text: 'text-amber-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(245,158,11)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(245,158,11)]',
    solidBg: 'bg-amber-500 text-slate-950 border-amber-600',
    accentLine: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-400/20'
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    border: 'border-rose-500',
    text: 'text-rose-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(244,63,94)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(244,63,94)]',
    solidBg: 'bg-rose-500 text-white border-rose-600',
    accentLine: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-400/20'
  } as const,
  purple: {
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    border: 'border-purple-500',
    text: 'text-purple-400',
    deepShadow: 'shadow-[0_4px_0_0_rgb(168,85,247)]',
    deepShadowHover: 'hover:shadow-[0_6px_0_0_rgb(168,85,247)]',
    solidBg: 'bg-purple-600 text-white border-purple-700',
    accentLine: 'bg-purple-500',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-400/20'
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
