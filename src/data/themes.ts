import { AppTheme, ThemeOption } from '../types';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'stage-night',
    name: 'Stage Night',
    lightingEnvironment: 'Dark Stages & Clubs',
    description: 'Deep anti-glare obsidian with vibrant neon LED jewels and soft ambient glow. Minimizes eye fatigue in dark venues.',
    badge: 'DARK STAGE',
    previewBg: '#06080d',
    previewAccent: '#38bdf8',
    previewBorder: '#1e293b',
    previewText: '#f8fafc',
  },
  {
    id: 'studio-bright',
    name: 'Studio Bright',
    lightingEnvironment: 'Bright Studios & Daylight',
    description: 'Crisp high-contrast light theme with rich slate borders, dark typography, and vivid saturated LED status.',
    badge: 'DAYLIGHT / STUDIO',
    previewBg: '#f8fafc',
    previewAccent: '#0284c7',
    previewBorder: '#cbd5e1',
    previewText: '#0f172a',
  },
  {
    id: 'amber-glow',
    name: 'Amber Glow',
    lightingEnvironment: 'Warm Stage Lighting',
    description: 'Vintage tube-amplifier aesthetic with rich warm charcoal, glowing amber LEDs, and brass accents.',
    badge: 'VINTAGE TUBE',
    previewBg: '#120d09',
    previewAccent: '#f59e0b',
    previewBorder: '#451a03',
    previewText: '#fef3c7',
  },
  {
    id: 'high-contrast-neon',
    name: 'High-Contrast Cyber',
    lightingEnvironment: 'Maximum Floor Distance',
    description: 'Pure OLED black background with ultra-vivid lime & electric cyan borders for instant foot-distance readability.',
    badge: 'MAX CONTRAST',
    previewBg: '#000000',
    previewAccent: '#10b981',
    previewBorder: '#064e3b',
    previewText: '#ffffff',
  },
];

export interface ThemeClasses {
  pageBg: string;
  topBarBg: string;
  topBarBorder: string;
  topBarText: string;
  bankSelectorBg: string;
  bankSelectorBorder: string;
  rigContainerBg: string;
  rigContainerBorder: string;
  rigTitleText: string;
  rigSubText: string;
  cardBorder: string;
  tipFooterBg: string;
  tipFooterBorder: string;
  tipFooterText: string;
  macBridgeBg: string;
  macBridgeBorder: string;
  macBridgeHeaderBg: string;
  macBridgeText: string;
  macBridgeConsoleBg: string;
  modalBg: string;
  modalBorder: string;
  modalHeaderBg: string;
  modalText: string;
  isLight: boolean;
}

export function getThemeClasses(theme: AppTheme): ThemeClasses {
  switch (theme) {
    case 'studio-bright':
      return {
        pageBg: 'bg-slate-100 text-slate-900',
        topBarBg: 'bg-white/95 border-b border-slate-300 shadow-sm',
        topBarBorder: 'border-slate-300',
        topBarText: 'text-slate-900',
        bankSelectorBg: 'bg-slate-200/90 border-b border-slate-300',
        bankSelectorBorder: 'border-slate-300',
        rigContainerBg: 'bg-white border-2 border-slate-300 shadow-xl',
        rigContainerBorder: 'border-slate-300',
        rigTitleText: 'text-slate-950',
        rigSubText: 'text-slate-600',
        cardBorder: 'border-slate-300',
        tipFooterBg: 'bg-slate-100/80',
        tipFooterBorder: 'border-slate-300',
        tipFooterText: 'text-slate-600',
        macBridgeBg: 'bg-white border-2 border-slate-300 shadow-xl',
        macBridgeBorder: 'border-slate-300',
        macBridgeHeaderBg: 'bg-slate-50 border-b border-slate-300',
        macBridgeText: 'text-slate-900',
        macBridgeConsoleBg: 'bg-slate-900 text-emerald-400 border border-slate-800',
        modalBg: 'bg-white border-2 border-slate-300 text-slate-900',
        modalBorder: 'border-slate-300',
        modalHeaderBg: 'bg-slate-100 border-b border-slate-300',
        modalText: 'text-slate-900',
        isLight: true,
      };

    case 'amber-glow':
      return {
        pageBg: 'bg-[#0f0b08] text-amber-50',
        topBarBg: 'bg-[#18110c]/95 border-b border-amber-900/60 shadow-lg',
        topBarBorder: 'border-amber-900/60',
        topBarText: 'text-amber-100',
        bankSelectorBg: 'bg-[#140e0a] border-b border-amber-950',
        bankSelectorBorder: 'border-amber-950',
        rigContainerBg: 'bg-[#17110c] border border-amber-800/40 shadow-2xl shadow-amber-950/30',
        rigContainerBorder: 'border-amber-800/40',
        rigTitleText: 'text-amber-200',
        rigSubText: 'text-amber-400/70',
        cardBorder: 'border-amber-900/50',
        tipFooterBg: 'bg-[#100c09]',
        tipFooterBorder: 'border-amber-900/40',
        tipFooterText: 'text-amber-400/80',
        macBridgeBg: 'bg-[#17110c] border border-amber-800/40 shadow-2xl',
        macBridgeBorder: 'border-amber-800/40',
        macBridgeHeaderBg: 'bg-[#120d09] border-b border-amber-900/50',
        macBridgeText: 'text-amber-100',
        macBridgeConsoleBg: 'bg-[#0a0705] text-amber-300 border border-amber-900/60',
        modalBg: 'bg-[#17110c] border border-amber-700/50 text-amber-50',
        modalBorder: 'border-amber-700/50',
        modalHeaderBg: 'bg-[#120d09] border-b border-amber-900/60',
        modalText: 'text-amber-100',
        isLight: false,
      };

    case 'high-contrast-neon':
      return {
        pageBg: 'bg-black text-white',
        topBarBg: 'bg-black/95 border-b-2 border-emerald-500/60 shadow-lg',
        topBarBorder: 'border-emerald-500/60',
        topBarText: 'text-white',
        bankSelectorBg: 'bg-zinc-950 border-b-2 border-emerald-950',
        bankSelectorBorder: 'border-emerald-950',
        rigContainerBg: 'bg-zinc-950 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/40',
        rigContainerBorder: 'border-emerald-500/50',
        rigTitleText: 'text-white',
        rigSubText: 'text-emerald-400',
        cardBorder: 'border-emerald-500/40',
        tipFooterBg: 'bg-black',
        tipFooterBorder: 'border-emerald-900/60',
        tipFooterText: 'text-emerald-300',
        macBridgeBg: 'bg-zinc-950 border-2 border-cyan-500/50 shadow-2xl',
        macBridgeBorder: 'border-cyan-500/50',
        macBridgeHeaderBg: 'bg-black border-b border-cyan-900/80',
        macBridgeText: 'text-white',
        macBridgeConsoleBg: 'bg-black text-cyan-300 border-2 border-cyan-500/40',
        modalBg: 'bg-zinc-950 border-2 border-emerald-500 text-white',
        modalBorder: 'border-emerald-500',
        modalHeaderBg: 'bg-black border-b-2 border-emerald-500',
        modalText: 'text-white',
        isLight: false,
      };

    case 'stage-night':
    default:
      return {
        pageBg: 'bg-[#06080d] bg-radial-[at_top_center] from-[#0d121c] to-[#06080d] text-zinc-100',
        topBarBg: 'bg-[#090b10]/95 backdrop-blur-md border-b border-zinc-800/80',
        topBarBorder: 'border-zinc-800/80',
        topBarText: 'text-zinc-100',
        bankSelectorBg: 'bg-[#0c0f16] border-b border-zinc-800/80',
        bankSelectorBorder: 'border-zinc-800/80',
        rigContainerBg: 'bg-[#0a0d14] border border-zinc-800/90 shadow-2xl backdrop-blur-sm',
        rigContainerBorder: 'border-zinc-800/90',
        rigTitleText: 'text-zinc-100',
        rigSubText: 'text-zinc-500',
        cardBorder: 'border-zinc-800/80',
        tipFooterBg: 'bg-[#080a0f]',
        tipFooterBorder: 'border-zinc-800/80',
        tipFooterText: 'text-zinc-400',
        macBridgeBg: 'bg-[#0e121a] border border-zinc-800/90 shadow-2xl',
        macBridgeBorder: 'border-zinc-800/90',
        macBridgeHeaderBg: 'bg-[#080a0f] border-b border-zinc-800/80',
        macBridgeText: 'text-zinc-100',
        macBridgeConsoleBg: 'bg-[#06080d] text-emerald-400 border border-zinc-800/80',
        modalBg: 'bg-[#0e121a] border border-zinc-800 text-zinc-100',
        modalBorder: 'border-zinc-800',
        modalHeaderBg: 'bg-[#090b10] border-b border-zinc-800/80',
        modalText: 'text-zinc-100',
        isLight: false,
      };
  }
}
