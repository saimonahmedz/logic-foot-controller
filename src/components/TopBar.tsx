import React from 'react';
import { Radio, Code2, BookOpen, Volume2, VolumeX, Sliders, Sun, Moon, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppTheme, Preset } from '../types';

export interface ActiveToneInfo {
  toneName: string;
  subLabel?: string;
  isEngaged: boolean;
  actionType: string; // 'TAP' | 'HOLD' | 'RELEASE' | 'PRESET' | 'BANK'
  timestamp: number;
}

interface TopBarProps {
  currentPreset: Preset;
  activeToneInfo: ActiveToneInfo | null;
  isConnected: boolean;
  latencyMs: number;
  audioFeedback: boolean;
  currentTheme: AppTheme;
  onToggleAudio: () => void;
  onToggleThemeQuick: () => void;
  onOpenSettings: () => void;
  onOpenCodeExplorer: () => void;
  onOpenGuide: () => void;
  onOpenPresetManager: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPreset,
  activeToneInfo,
  isConnected,
  latencyMs,
  audioFeedback,
  currentTheme,
  onToggleAudio,
  onToggleThemeQuick,
  onOpenSettings,
  onOpenCodeExplorer,
  onOpenGuide,
  onOpenPresetManager,
}) => {
  const isLightTheme = currentTheme === 'studio-bright';

  // Check if a tone was pressed recently (within last 8 seconds)
  const isRecentTone = activeToneInfo && Date.now() - activeToneInfo.timestamp < 8000;

  return (
    <header className="px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 select-none sticky top-0 z-30 transition-colors w-full">
      {/* Left: Guitar Controller Brand + Box next to Guitar Controller */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-[75%] sm:max-w-none">
        {/* Guitar Controller Category Box */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
            isLightTheme
              ? 'bg-slate-100/90 border-slate-300 text-slate-900 shadow-sm'
              : 'bg-[#10141d] border-zinc-800/90 text-zinc-100'
          }`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              isLightTheme
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30 text-blue-400'
            }`}
          >
            <span className="text-sm sm:text-base leading-none">🎸</span>
          </div>

          <div className="hidden xs:block sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[11px] sm:text-xs font-bold tracking-tight uppercase leading-none">
                GUITAR FOOT
              </h1>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
                title={isConnected ? 'Connected to Mac Bridge' : 'Offline'}
              />
            </div>
            <span
              className={`text-[9px] font-semibold block leading-tight ${
                isLightTheme ? 'text-slate-500' : 'text-zinc-400'
              }`}
            >
              iOS Controller
            </span>
          </div>
        </div>

        {/* Clean Box Next to Guitar Controller (Clean Tab with dynamic tone feedback) */}
        <button
          id="preset-and-tone-box"
          onClick={onOpenPresetManager}
          className={`text-left px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer group shadow-sm flex flex-col justify-center min-w-[140px] sm:min-w-[200px] max-w-[240px] sm:max-w-[320px] ${
            isLightTheme
              ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900 hover:border-blue-500'
              : 'bg-[#0e121a] hover:bg-[#121622] border-zinc-800/90 text-zinc-100 hover:border-zinc-700'
          }`}
          title="Click to Switch Preset or configure Global Program Change (PC)"
        >
          {/* Top Row: Clean Preset Tab Label with Selector Icon */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] sm:text-xs font-extrabold tracking-tight truncate group-hover:text-blue-500 transition-colors">
                {currentPreset.name}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border hidden sm:inline ${
                  isLightTheme
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}
              >
                PRESET
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-y-0.5 ${
                isLightTheme ? 'text-slate-400' : 'text-zinc-500'
              }`}
            />
          </div>

          {/* Under the Name: Dynamic Tone & Switch status (No persistent cluttered numbers!) */}
          <div className="mt-0.5 truncate text-[10px] sm:text-[11px] leading-tight">
            {isRecentTone && activeToneInfo ? (
              /* Dynamic Tone Appearance when Pressed */
              <div className="flex items-center gap-1.5 animate-fadeIn truncate">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    activeToneInfo.isEngaged
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span
                  className={`font-bold truncate ${
                    activeToneInfo.isEngaged
                      ? isLightTheme
                        ? 'text-emerald-700 font-bold'
                        : 'text-emerald-400 font-bold'
                      : isLightTheme
                        ? 'text-slate-600'
                        : 'text-zinc-300'
                  }`}
                >
                  Tone: {activeToneInfo.toneName}
                </span>
                <span
                  className={`text-[9px] font-semibold px-1 rounded ${
                    isLightTheme ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {activeToneInfo.isEngaged ? 'ENGAGED' : 'OFF'}
                </span>
              </div>
            ) : (
              /* Clean Default State Under the Name (Without raw MIDI numbers) */
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`truncate font-medium ${
                    isLightTheme ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  {currentPreset.globalProgramChange?.isEnabled
                    ? `Global PC Synced • Tap to change`
                    : `Tap to switch preset`}
                </span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Right Actions Bar: Touch-Friendly for iPhone */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Lighting Mode Switcher (Stage Night <-> Studio Bright) */}
        <button
          onClick={onToggleThemeQuick}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isLightTheme
              ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
          title={isLightTheme ? 'Switch to Stage Night Theme' : 'Switch to Studio Bright Theme'}
        >
          {isLightTheme ? (
            <Sun className="w-4 h-4 text-amber-600" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Audio Click Feedback Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            audioFeedback
              ? isLightTheme
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-blue-600/15 border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/10'
              : isLightTheme
                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
          title={audioFeedback ? 'Stomp Relay Audio On' : 'Stomp Relay Audio Off'}
        >
          {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings & Appearance Modal Trigger */}
        <button
          onClick={onOpenSettings}
          className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
            isLightTheme
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
          }`}
          title="Open Rig & Appearance Settings"
        >
          <Sliders className="w-4 h-4 text-blue-500" />
          <span className="hidden md:inline">Settings</span>
        </button>

        {/* Setup & Logic Pro Guide Button */}
        <button
          onClick={onOpenGuide}
          className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm hidden xs:flex ${
            isLightTheme
              ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="hidden md:inline">Guide</span>
        </button>

        {/* View Swift Code / Export ZIP Button */}
        <button
          onClick={onOpenCodeExplorer}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-95 shrink-0"
          title="Swift iOS & Mac Bridge Source"
        >
          <Code2 className="w-4 h-4" />
          <span className="hidden sm:inline">Swift</span>
        </button>
      </div>
    </header>
  );
};
