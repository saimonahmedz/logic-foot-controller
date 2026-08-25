import React, { useState } from 'react';
import { AppTheme, LogicProConfig } from '../types';
import { ChevronUp, ChevronDown, Music2, SlidersVertical, CheckCircle2 } from 'lucide-react';

interface LogicProTrackControllerProps {
  config?: LogicProConfig;
  theme?: AppTheme;
  onTrackUp: () => void;
  onTrackDown: () => void;
  onSelectTrackDirect?: (index: number) => void;
  onOpenSettings?: () => void;
}

const DEFAULT_TRACKS = [
  '01: Lead Overdrive (Archetype)',
  '02: Rhythm High-Gain (AmpliTube)',
  '03: Ambient Swell & Shimmer',
  '04: Clean Acoustic Piezo',
  '05: Rotary Organ & Octave',
  '06: Bass & Sub Synth Drive',
  '07: Vocal FX & Harmonizer',
  '08: Backing Track Stem Bus',
];

export const LogicProTrackController: React.FC<LogicProTrackControllerProps> = ({
  config = {
    channel: 1,
    trackUpCC: 48,
    trackDownCC: 49,
    trackMode: 'CC',
    currentTrackIndex: 0,
    tracks: DEFAULT_TRACKS,
  },
  theme = 'stage-night',
  onTrackUp,
  onTrackDown,
  onSelectTrackDirect,
  onOpenSettings,
}) => {
  const [upPressed, setUpPressed] = useState(false);
  const [downPressed, setDownPressed] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);

  const isLight = theme === 'studio-bright';
  const isNeon = theme === 'high-contrast-neon';

  const tracks = config.tracks && config.tracks.length > 0 ? config.tracks : DEFAULT_TRACKS;
  const currentIdx = Math.max(0, Math.min(tracks.length - 1, config.currentTrackIndex || 0));
  const currentTrackName = tracks[currentIdx] || `Track ${currentIdx + 1}`;

  const handleUpClick = () => {
    setUpPressed(true);
    setTimeout(() => setUpPressed(false), 180);
    onTrackUp();
  };

  const handleDownClick = () => {
    setDownPressed(true);
    setTimeout(() => setDownPressed(false), 180);
    onTrackDown();
  };

  return (
    <div
      id="logic-pro-side-controller"
      className={`rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 border shadow-lg ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900'
          : isNeon
          ? 'bg-black border-zinc-800 text-zinc-100 ring-1 ring-cyan-500/30'
          : 'bg-[#0e121a] border-zinc-800/90 text-zinc-100'
      }`}
    >
      {/* Header with Logic Pro Badge & Active Track Display */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2.5 pb-2 border-b border-inherit">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border text-xs ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold tracking-tight uppercase leading-none">
                  LOGIC PRO
                </span>
                <span
                  className={`text-[8px] font-bold px-1 py-0.2 rounded border ${
                    isLight
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                  }`}
                >
                  CH {config.channel}
                </span>
              </div>
              <span
                className={`text-[9px] font-semibold leading-none ${
                  isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
              >
                Track Stepper
              </span>
            </div>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`p-1 rounded-md text-xs cursor-pointer transition-colors ${
                isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'
              }`}
              title="Configure Logic Pro MIDI routing in Settings"
            >
              <SlidersVertical className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Current Active Track Card */}
        <div
          onClick={() => setShowTrackList(!showTrackList)}
          className={`p-2 rounded-xl border transition-all cursor-pointer mb-3 group ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
              : 'bg-[#090b10] hover:bg-[#10141e] border-zinc-800/80 text-zinc-200'
          }`}
          title="Click to view full Logic Pro track list"
        >
          <div className="flex items-center justify-between gap-1 text-[9px] font-bold uppercase tracking-wider mb-0.5 text-indigo-400">
            <span>ACTIVE TRACK [{currentIdx + 1}/{tracks.length}]</span>
            <span className="text-[8px] opacity-75">CC#{config.trackUpCC}/{config.trackDownCC}</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold truncate text-inherit group-hover:text-indigo-400 transition-colors">
            {currentTrackName}
          </p>
        </div>

        {/* Expandable Quick Track Selector */}
        {showTrackList && (
          <div
            className={`mb-3 max-h-36 overflow-y-auto no-scrollbar rounded-xl border p-1 flex flex-col gap-0.5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}
          >
            {tracks.map((trk, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onSelectTrackDirect) onSelectTrackDirect(i);
                  setShowTrackList(false);
                }}
                className={`text-left px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  i === currentIdx
                    ? isLight
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-indigo-600/30 text-indigo-200'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-700'
                    : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="truncate">{trk}</span>
                {i === currentIdx && <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dual Stepped Knock Pedals: UP and DOWN */}
      <div className="flex sm:flex-col gap-2 pt-1">
        {/* Track UP Knock */}
        <button
          id="logic-track-up-knock"
          onClick={handleUpClick}
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-75 cursor-pointer shadow-md active:scale-95 ${
            isLight
              ? upPressed
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-inner'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : upPressed
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-inner'
              : 'bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-100 border-zinc-800/90'
          }`}
          style={{
            transform: upPressed ? 'translateY(2px)' : 'none',
          }}
          title={`Step Up to Previous Logic Pro Track (MIDI CC #${config.trackUpCC})`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 border ${
              isLight
                ? upPressed
                  ? 'bg-white text-indigo-600 border-white'
                  : 'bg-white text-indigo-600 border-slate-300 shadow-sm'
                : upPressed
                ? 'bg-white text-indigo-600 border-white'
                : 'bg-zinc-800 text-indigo-400 border-zinc-700'
            }`}
          >
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase leading-none">
            TRACK UP
          </span>
          <span
            className={`text-[8px] font-mono mt-0.5 ${
              isLight ? (upPressed ? 'text-indigo-100' : 'text-slate-500') : (upPressed ? 'text-indigo-100' : 'text-zinc-400')
            }`}
          >
            CC #{config.trackUpCC}
          </span>
        </button>

        {/* Track DOWN Knock */}
        <button
          id="logic-track-down-knock"
          onClick={handleDownClick}
          className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-75 cursor-pointer shadow-md active:scale-95 ${
            isLight
              ? downPressed
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-inner'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : downPressed
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-inner'
              : 'bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-100 border-zinc-800/90'
          }`}
          style={{
            transform: downPressed ? 'translateY(2px)' : 'none',
          }}
          title={`Step Down to Next Logic Pro Track (MIDI CC #${config.trackDownCC})`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 border ${
              isLight
                ? downPressed
                  ? 'bg-white text-indigo-600 border-white'
                  : 'bg-white text-indigo-600 border-slate-300 shadow-sm'
                : downPressed
                ? 'bg-white text-indigo-600 border-white'
                : 'bg-zinc-800 text-indigo-400 border-zinc-700'
            }`}
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase leading-none">
            TRACK DOWN
          </span>
          <span
            className={`text-[8px] font-mono mt-0.5 ${
              isLight ? (downPressed ? 'text-indigo-100' : 'text-slate-500') : (downPressed ? 'text-indigo-100' : 'text-zinc-400')
            }`}
          >
            CC #{config.trackDownCC}
          </span>
        </button>
      </div>
    </div>
  );
};
