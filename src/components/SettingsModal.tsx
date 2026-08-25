import React, { useState } from 'react';
import { AppTheme, RigSettings, Bank, CoreMIDIDevice } from '../types';
import { THEME_OPTIONS } from '../data/themes';
import { haptic } from '../services/hapticFeedback';
import {
  X,
  Sliders,
  Palette,
  Volume2,
  Clock,
  RotateCcw,
  Download,
  Upload,
  Check,
  Sun,
  Moon,
  Flame,
  Zap,
  Sparkles,
  Type,
  Eye,
  CheckCircle2,
  Cpu,
  Music2,
  Wifi,
  Radio,
  Layers,
  FolderPlus,
  Tv,
  Smartphone,
} from 'lucide-react';

const detectedMidiDevices: CoreMIDIDevice[] = [
  {
    id: 'dest-virtual',
    name: 'GuitarFoot Virtual Source (DAW / Logic Pro / AmpliTube 5)',
    type: 'virtual',
    isOnline: true,
  },
  {
    id: 'dest-iac-1',
    name: 'IAC Driver Bus 1 (macOS Internal MIDI Inter-App)',
    type: 'iac',
    isOnline: true,
  },
  {
    id: 'dest-logic-ext',
    name: 'Logic Pro External MIDI Router',
    type: 'plugin',
    isOnline: true,
  },
  {
    id: 'dest-amplitube',
    name: 'AmpliTube 5 Standalone / VST3 Input',
    type: 'plugin',
    isOnline: true,
  },
  {
    id: 'dest-neuraldsp',
    name: 'Neural DSP Archetype MIDI Port',
    type: 'plugin',
    isOnline: true,
  },
  {
    id: 'dest-scarlett',
    name: 'Focusrite Scarlett USB MIDI Out',
    type: 'hardware',
    isOnline: true,
  },
  {
    id: 'dest-quadcortex',
    name: 'Neural DSP Quad Cortex MIDI (USB)',
    type: 'hardware',
    isOnline: false,
  },
];

interface SettingsModalProps {
  settings: RigSettings;
  onUpdateSettings: (newSettings: RigSettings) => void;
  banks: Bank[];
  onImportBanks: (imported: Bank[]) => void;
  onResetFactory: () => void;
  onClose: () => void;
  onOpenBankManager?: () => void;
  activeView?: 'pedalboard' | 'bridge';
  onSelectView?: (view: 'pedalboard' | 'bridge') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  banks,
  onImportBanks,
  onResetFactory,
  onClose,
  onOpenBankManager,
  activeView = 'pedalboard',
  onSelectView,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'audio' | 'bridge' | 'rig'>('appearance');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const logicPro = settings.logicPro || {
    channel: 1,
    trackUpCC: 48,
    trackDownCC: 49,
    trackMode: 'CC',
    currentTrackIndex: 0,
    tracks: [
      '01: Lead Overdrive (Archetype)',
      '02: Rhythm High-Gain (AmpliTube)',
      '03: Ambient Swell & Shimmer',
      '04: Clean Acoustic Piezo',
      '05: Rotary Organ & Octave',
      '06: Bass & Sub Synth Drive',
      '07: Vocal FX & Harmonizer',
      '08: Backing Track Stem Bus',
    ],
  };

  const bridge = settings.bridge || {
    selectedDestination: 'dest-virtual',
    bonjourPort: 5004,
    simulatedLatencyMs: 2,
    autoReconnect: true,
  };

  const handleUpdateLogicPro = (partial: Partial<typeof logicPro>) => {
    onUpdateSettings({
      ...settings,
      logicPro: {
        ...logicPro,
        ...partial,
      },
    });
  };

  const handleUpdateBridge = (partial: Partial<typeof bridge>) => {
    onUpdateSettings({
      ...settings,
      bridge: {
        ...bridge,
        ...partial,
      },
    });
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    onUpdateSettings({ ...settings, theme: newTheme });
  };

  const handleExportRig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      version: 2,
      exportDate: new Date().toISOString(),
      settings,
      banks,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guitarfoot-rig-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.banks) && parsed.banks.length > 0) {
            onImportBanks(parsed.banks);
            if (parsed.settings) {
              onUpdateSettings({ ...settings, ...parsed.settings });
            }
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            onImportBanks(parsed);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          } else {
            setImportError('Invalid rig configuration file format.');
          }
        } catch {
          setImportError('Failed to parse JSON file.');
        }
      };
    }
  };

  const getThemeIcon = (id: AppTheme) => {
    switch (id) {
      case 'studio-bright':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'amber-glow':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'high-contrast-neon':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'stage-night':
      default:
        return <Moon className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-2 sm:p-4 md:p-6 custom-scrollbar overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-2 sm:py-4 w-full pointer-events-none">
        <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto pointer-events-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#090b10]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wide">
                  Rig & System Settings
                </h2>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Stage views, bank manager, high-contrast themes, and Mac MIDI bridge
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TOP SECTION IN SETTINGS: ACTIVE VIEW SELECTOR (The two boxes from line 3) */}
          <div className="px-5 py-3.5 bg-[#07090e] border-b border-zinc-800/80">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Active Display Mode & Page Selector
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Box 1: Page 1 Live Rig & Logic */}
              <button
                onClick={() => {
                  if (onSelectView) onSelectView('pedalboard');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between font-mono ${
                  activeView === 'pedalboard'
                    ? 'bg-blue-950/40 border-blue-500 text-blue-200 ring-1 ring-blue-500/40 shadow-md shadow-blue-950/50'
                    : 'bg-[#0d1017] border-zinc-800 text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎸</span>
                  <div>
                    <span className="text-xs font-bold block">Page 1: Live Rig & Logic</span>
                    <span className="text-[10px] text-zinc-400 block">8-Switch pedalboard & Logic stepper</span>
                  </div>
                </div>
                {activeView === 'pedalboard' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                )}
              </button>

              {/* Box 2: Page 2 Cloud Bridge Two */}
              <button
                onClick={() => {
                  if (onSelectView) onSelectView('bridge');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between font-mono ${
                  activeView === 'bridge'
                    ? 'bg-blue-950/40 border-blue-500 text-blue-200 ring-1 ring-blue-500/40 shadow-md shadow-blue-950/50'
                    : 'bg-[#0d1017] border-zinc-800 text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">☁️</span>
                  <div>
                    <span className="text-xs font-bold block">Page 2: Cloud Bridge Two</span>
                    <span className="text-[10px] text-zinc-400 block">Latency jitter visualizer & Mac logs</span>
                  </div>
                </div>
                {activeView === 'bridge' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation (Sticky Header so user can switch tabs at any scroll position) */}
          <div className="sticky top-0 z-20 flex items-center gap-1.5 px-5 pt-3 pb-2.5 bg-[#0a0d14]/95 backdrop-blur border-b border-zinc-800/80 overflow-x-auto no-scrollbar shadow-sm">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'appearance'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'audio'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio & Haptics</span>
            </button>

            <button
              onClick={() => setActiveTab('bridge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'bridge'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Mac Bridge & Logic Pro</span>
            </button>

            <button
              onClick={() => setActiveTab('rig')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'rig'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Banks & Backup</span>
            </button>
          </div>

          {/* Tab Content (Natural flow without trapped inner scroll) */}
          <div className="p-4 sm:p-5 space-y-5">
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Appearance Introduction Banner */}
              <div className="bg-[#080a0f] p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> High-Contrast Lighting Modes
                  </span>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Select a theme optimized for your stage or studio environment to eliminate glare and maximize foot-distance readability.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>Real-Time Preview</span>
                </div>
              </div>

              {/* Theme Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = settings.theme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-b from-blue-950/30 to-[#0a0d14] ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/50'
                          : 'border-zinc-800 bg-[#080a0f] hover:border-zinc-700 hover:bg-[#0c0f16]'
                      }`}
                    >
                      {/* Theme Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                            {getThemeIcon(theme.id)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-100 font-mono">
                                {theme.name}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {theme.lightingEnvironment}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>

                      {/* Theme Description */}
                      <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                        {theme.description}
                      </p>

                      {/* Color Palette Preview Swatches */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-850">
                        {[theme.previewBg, theme.previewAccent, theme.previewBorder, theme.previewText].map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-md border border-white/10 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage Visual Toggles */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                  Stage Typography & Glow
                </h4>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e121a] border border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 font-mono block">
                        Extra Large Stage Font
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Enhances patch label sizes for standing distance readability
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.largeStageFont}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, largeStageFont: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e121a] border border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 font-mono block">
                        Vibrant LED Glow Halo
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Adds colored atmospheric halos to engaged footswitches
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vibrantGlow}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, vibrantGlow: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Web Vibration API Haptic Feedback */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-emerald-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100 font-mono block">
                          Tactile Haptic Feedback (Web Vibration API)
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {haptic.getSupported() ? 'Hardware Supported' : 'Web API Ready'}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Provides distinct physical tactile pulses on tap, hold, and bank switch without audio clicks
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hapticFeedback !== false}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, hapticFeedback: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {settings.hapticFeedback !== false && (
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">Tactile Pulse Profile</span>
                      <span className="text-emerald-400 font-bold uppercase text-[11px]">
                        {settings.hapticStyle || 'crisp'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'crisp', label: 'Crisp Stomp', dur: '22ms pulse', desc: 'Standard tactile click' },
                        { id: 'firm', label: 'Deep Thump', dur: '35ms pulse', desc: 'Heavy physical impact' },
                        { id: 'double', label: 'Double Pulse', dur: '15+20ms', desc: 'Distinct twin click' },
                        { id: 'soft', label: 'Soft Tap', dur: '12ms pulse', desc: 'Subtle micro pulse' },
                      ].map((item) => {
                        const isSelected = (settings.hapticStyle || 'crisp') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({ ...settings, hapticStyle: item.id as any });
                              haptic.triggerPressDown(item.id as any);
                            }}
                            className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                                : 'bg-[#0d1117] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-[11px] font-bold font-mono">{item.label}</div>
                            <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{item.dur}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Test pulse on this device:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          haptic.triggerPressDown(settings.hapticStyle || 'crisp');
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-emerald-400" />
                        Test Haptic Pulse
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stompbox Audio Feedback */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 font-mono block">
                        Stompbox Audio Feedback
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Mechanical relay audio click (Keep disabled for 100% silent haptic-only operation)
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audioFeedback}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, audioFeedback: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {settings.audioFeedback && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">Stomp Volume</span>
                      <span className="text-blue-400 font-bold">
                        {Math.round(settings.stompVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={settings.stompVolume}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          stompVolume: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Long Press Hold Threshold */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 font-mono block">
                        Long-Press Hold Threshold
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Time required to engage secondary actions or tuner mute
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {settings.holdThresholdMs} ms ({(settings.holdThresholdMs / 1000).toFixed(2)}s)
                  </span>
                </div>

                <input
                  type="range"
                  min="250"
                  max="1000"
                  step="50"
                  value={settings.holdThresholdMs}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      holdThresholdMs: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Fast (250ms)</span>
                  <span>Standard (450ms)</span>
                  <span>Deliberate (1000ms)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bridge' && (
            <div className="space-y-5">
              {/* Mac Bridge CoreMIDI Destination */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    macOS CoreMIDI Destination
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Bridged
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Select which virtual port, DAW track input, or plugin host receives MIDI packets from the iPhone foot controller.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {detectedMidiDevices.map((device) => {
                    const isSelected = (bridge.selectedDestination || 'dest-virtual') === device.id;
                    return (
                      <div
                        key={device.id}
                        onClick={() => handleUpdateBridge({ selectedDestination: device.id })}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-blue-200 ring-1 ring-blue-500/30'
                            : 'bg-[#0e121a] border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              device.isOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                            }`}
                          />
                          <div>
                            <span className="text-xs font-bold font-mono block">
                              {device.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              Type: {device.type} • {device.isOnline ? 'Available' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logic Pro MIDI Routing & Knock Stepper Controls */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5" />
                    Logic Pro Track Stepper MIDI Mapping
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Up / Down Controls
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Configure the MIDI CC numbers and channel sent by the dual Track Up / Track Down knocks to step through Logic Pro tracks.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#0e121a] border border-zinc-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 font-mono">
                      Logic Pro Channel
                    </label>
                    <select
                      value={logicPro.channel}
                      onChange={(e) => handleUpdateLogicPro({ channel: parseInt(e.target.value, 10) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-100"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                        <option key={ch} value={ch}>
                          MIDI Channel {ch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e121a] border border-zinc-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 font-mono">
                      Track UP Knock CC#
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="127"
                      value={logicPro.trackUpCC}
                      onChange={(e) => handleUpdateLogicPro({ trackUpCC: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-100"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e121a] border border-zinc-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 font-mono">
                      Track DOWN Knock CC#
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="127"
                      value={logicPro.trackDownCC}
                      onChange={(e) => handleUpdateLogicPro({ trackDownCC: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-100"
                    />
                  </div>
                </div>

                {/* Custom Track Names List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-zinc-300 font-mono">
                    Logic Pro Track Labels ({logicPro.tracks.length} Tracks)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {logicPro.tracks.map((trk, i) => (
                      <input
                        key={i}
                        type="text"
                        value={trk}
                        onChange={(e) => {
                          const updated = [...logicPro.tracks];
                          updated[i] = e.target.value;
                          handleUpdateLogicPro({ tracks: updated });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0e121a] border border-zinc-800 text-xs font-mono text-zinc-200 focus:border-indigo-500 outline-none"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bonjour Network & Latency */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Network & Bonjour Wireless Bridge
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#0e121a] border border-zinc-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 font-mono">
                      Bonjour Port (UDP/TCP)
                    </label>
                    <input
                      type="number"
                      value={bridge.bonjourPort}
                      onChange={(e) => handleUpdateBridge({ bonjourPort: parseInt(e.target.value, 10) || 5004 })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-100"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e121a] border border-zinc-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300 font-mono">
                      Simulated Bridge Latency ({bridge.simulatedLatencyMs} ms)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={bridge.simulatedLatencyMs}
                      onChange={(e) => handleUpdateBridge({ simulatedLatencyMs: parseInt(e.target.value, 10) })}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rig' && (
            <div className="space-y-4">
              {/* MANAGE RIG BANKS BOX (Moved from second line into Settings) */}
              <div
                id="settings-manage-banks-box"
                className="bg-[#080a0f] p-4 rounded-xl border border-blue-500/30 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4" />
                    Manage Rig Banks & Presets
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    {banks.length} ACTIVE BANKS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Create custom banks for different setlists, reorder banks, customize bank color tags, or rename pedalboard groups.
                </p>
                {onOpenBankManager && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBankManager();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Open Full Bank Manager Modal</span>
                  </button>
                )}
              </div>

              {/* Backup / Export Rig */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  Backup Rig Configuration
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Download all custom banks, footswitch MIDI CC/PC mappings, and appearance settings as a backup JSON file.
                </p>
                <button
                  onClick={handleExportRig}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border border-zinc-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rig Backup (.json)</span>
                </button>
              </div>

              {/* Restore / Import Rig */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  Restore & Import Rig Setup
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Import a saved .json rig file to restore your bank mappings and configuration.
                </p>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border border-zinc-700">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose JSON File</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                  {importSuccess && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Rig imported successfully!
                    </span>
                  )}
                  {importError && (
                    <span className="text-xs font-mono text-rose-400">{importError}</span>
                  )}
                </div>
              </div>

              {/* Factory Reset */}
              <div className="bg-[#1a0f12] p-4 rounded-xl border border-rose-900/40 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Factory Reset
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Reset all banks, footswitch configurations, and switch states back to default factory stage presets.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all banks and settings to factory defaults?')) {
                      onResetFactory();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-1.5 bg-rose-700/60 hover:bg-rose-600 text-rose-100 font-mono text-xs font-bold rounded-lg transition-colors border border-rose-600/50 cursor-pointer"
                >
                  Reset to Factory Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#090b10] flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-zinc-500">
            Selected Theme: <strong className="text-zinc-300">{THEME_OPTIONS.find((t) => t.id === settings.theme)?.name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-blue-600/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
