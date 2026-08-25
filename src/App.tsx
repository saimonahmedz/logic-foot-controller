import React, { useState, useEffect } from 'react';
import { FootswitchConfig, Bank, Preset, MIDIPacketLog, RigSettings, AppTheme } from './types';
import { defaultPresets, defaultPreset } from './data/defaultRig';
import { getThemeClasses } from './data/themes';
import { audioSynth } from './services/audioClickSynth';
import { haptic } from './services/hapticFeedback';
import { TopBar, ActiveToneInfo } from './components/TopBar';
import { BankSelector } from './components/BankSelector';
import { FootswitchButton } from './components/FootswitchButton';
import { MacBridgeSimulator } from './components/MacBridgeSimulator';
import { LogicProTrackController } from './components/LogicProTrackController';
import { PresetManagerModal } from './components/PresetManagerModal';
import { SwitchConfigModal } from './components/SwitchConfigModal';
import { BankManagerModal } from './components/BankManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { Sliders, Radio, Activity, RefreshCw, Layers, Cpu, Music2 } from 'lucide-react';

const DEFAULT_LOGIC_PRO = {
  channel: 1,
  trackUpCC: 48,
  trackDownCC: 49,
  trackMode: 'CC' as const,
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

const DEFAULT_SETTINGS: RigSettings = {
  theme: 'stage-night',
  largeStageFont: true,
  vibrantGlow: true,
  audioFeedback: false,
  hapticFeedback: true,
  hapticStyle: 'crisp',
  stompVolume: 0.75,
  holdThresholdMs: 450,
  logicPro: DEFAULT_LOGIC_PRO,
  bridge: {
    selectedDestination: 'dest-virtual',
    bonjourPort: 5004,
    simulatedLatencyMs: 2,
    autoReconnect: true,
  },
};

export default function App() {
  // Rig Settings & Appearance State
  const [settings, setSettings] = useState<RigSettings>(() => {
    const saved = localStorage.getItem('guitarfoot_rig_settings_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          audioFeedback: false,
          hapticFeedback: parsed.hapticFeedback !== undefined ? parsed.hapticFeedback : true,
          hapticStyle: parsed.hapticStyle || 'crisp',
          largeStageFont: parsed.largeStageFont !== undefined ? parsed.largeStageFont : true,
          vibrantGlow: parsed.vibrantGlow !== undefined ? parsed.vibrantGlow : true,
        };
      } catch {}
    }
    const savedV2 = localStorage.getItem('guitarfoot_rig_settings_v2');
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          audioFeedback: false,
          hapticFeedback: parsed.hapticFeedback !== undefined ? parsed.hapticFeedback : true,
          hapticStyle: parsed.hapticStyle || 'crisp',
          largeStageFont: parsed.largeStageFont !== undefined ? parsed.largeStageFont : true,
          vibrantGlow: parsed.vibrantGlow !== undefined ? parsed.vibrantGlow : true,
        };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // Presets State
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('guitarfoot_presets_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return defaultPresets;
  });

  const [activePresetId, setActivePresetId] = useState<string>(() => {
    const savedId = localStorage.getItem('guitarfoot_active_preset_id_v3');
    if (savedId && presets.some((p) => p.id === savedId)) {
      return savedId;
    }
    return presets[0]?.id || defaultPreset.id;
  });

  const currentPreset = presets.find((p) => p.id === activePresetId) || presets[0] || defaultPreset;

  // Active Bank State (derived from current preset)
  const [activeBankId, setActiveBankId] = useState<string>(() => {
    const savedActive = localStorage.getItem('guitarfoot_active_bank_id_v3');
    if (savedActive && currentPreset.banks.some((b) => b.id === savedActive)) {
      return savedActive;
    }
    return currentPreset.defaultBankId || currentPreset.banks[0]?.id || 'bank-live';
  });

  // Active Tone & Dynamic Feedback (Shown in the top tab under the name when tone is pressed)
  const [activeToneInfo, setActiveToneInfo] = useState<ActiveToneInfo | null>(null);

  // Switch On/Off States (Dictionary mapping bankId -> boolean[8])
  const [switchStatesByBank, setSwitchStatesByBank] = useState<Record<string, boolean[]>>(() => {
    const savedStates = localStorage.getItem('guitarfoot_switch_states_v3');
    if (savedStates) {
      try {
        const parsed = JSON.parse(savedStates);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      } catch {}
    }
    return {};
  });

  // Mobile View Switcher for iPhone: 'pedalboard' | 'bridge'
  const [mobileTab, setMobileTab] = useState<'pedalboard' | 'bridge'>('pedalboard');

  // Network Simulation State
  const [isConnected, setIsConnected] = useState(true);
  const [latencyMs, setLatencyMs] = useState(1.1);
  const [packetLogs, setPacketLogs] = useState<MIDIPacketLog[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>(() => {
    const saved = localStorage.getItem('guitarfoot_selected_midi_dest_v3');
    return saved || 'GuitarFoot Virtual Source (DAW / Logic Pro / AmpliTube 5)';
  });

  // Modals
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FootswitchConfig | null>(null);
  const [isBankManagerOpen, setIsBankManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeExplorerOpen, setIsCodeExplorerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('guitarfoot_rig_settings_v3', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('guitarfoot_presets_v3', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem('guitarfoot_active_preset_id_v3', activePresetId);
  }, [activePresetId]);

  useEffect(() => {
    localStorage.setItem('guitarfoot_active_bank_id_v3', activeBankId);
  }, [activeBankId]);

  useEffect(() => {
    localStorage.setItem('guitarfoot_switch_states_v3', JSON.stringify(switchStatesByBank));
  }, [switchStatesByBank]);

  useEffect(() => {
    localStorage.setItem('guitarfoot_selected_midi_dest_v3', selectedDestination);
  }, [selectedDestination]);

  // Current active bank & switches
  const currentBank = currentPreset.banks.find((b) => b.id === activeBankId) || currentPreset.banks[0] || defaultPresets[0].banks[0];
  const switchOnStates = switchStatesByBank[activeBankId] || Array(8).fill(false);
  const themeClasses = getThemeClasses(settings.theme);

  // Helper to format raw hex bytes
  const getRawHex = (type: string, channel: number, number: number, val: number, isNoteOn = true) => {
    const ch = (channel - 1) & 0x0f;
    if (type === 'NOTE') {
      const status = (isNoteOn ? 0x90 : 0x80) | ch;
      return `0x${status.toString(16).toUpperCase()} 0x${number.toString(16).toUpperCase().padStart(2, '0')} 0x${(isNoteOn ? val : 0).toString(16).toUpperCase().padStart(2, '0')}`;
    }
    if (type === 'CC') {
      const status = 0xb0 | ch;
      return `0x${status.toString(16).toUpperCase()} 0x${number.toString(16).toUpperCase().padStart(2, '0')} 0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
    }
    if (type === 'PC') {
      const status = 0xc0 | ch;
      return `0x${status.toString(16).toUpperCase()} 0x${number.toString(16).toUpperCase().padStart(2, '0')}`;
    }
    return '0x00 0x00';
  };

  // Dispatch Global Program Change when Preset changes
  const handleSelectPreset = (presetId: string) => {
    const targetPreset = presets.find((p) => p.id === presetId);
    if (!targetPreset) return;

    setActivePresetId(presetId);
    const targetBankId = targetPreset.defaultBankId || targetPreset.banks[0]?.id;
    if (targetBankId) {
      setActiveBankId(targetBankId);
    }

    if (settings.audioFeedback) {
      audioSynth.playHoldChime(settings.stompVolume);
    }
    if (settings.hapticFeedback !== false) {
      haptic.triggerBankChange();
    }

    // Automatically trigger Global Program Change (PC) if enabled in preset settings
    if (targetPreset.globalProgramChange?.isEnabled && isConnected) {
      const pc = targetPreset.globalProgramChange;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const hex = getRawHex('PC', pc.channel, pc.programNumber, 127);
      const desc = `[GLOBAL PC SYNC] Preset "${targetPreset.name}" → Program #${String(pc.programNumber).padStart(2, '0')} (Ch ${pc.channel})`;

      const newLog: MIDIPacketLog = {
        id: `pkt-preset-${Date.now()}`,
        timestamp: timeStr,
        timeMs: Date.now(),
        type: 'PRESET_CHANGE',
        midiType: 'PC',
        channel: pc.channel,
        number: pc.programNumber,
        value: 127,
        rawHex: hex,
        description: desc,
        latencyMs: 0.9,
      };

      setPacketLogs((prev) => [newLog, ...prev.slice(0, 99)]);
      setLatencyMs(0.9);

      // Update tone status to highlight the synchronized preset & Global PC
      setActiveToneInfo({
        toneName: `${targetPreset.name} (PC #${String(pc.programNumber).padStart(2, '0')})`,
        isEngaged: true,
        actionType: 'PRESET',
        timestamp: Date.now(),
      });
    } else {
      setActiveToneInfo({
        toneName: targetPreset.name,
        isEngaged: true,
        actionType: 'PRESET',
        timestamp: Date.now(),
      });
    }
  };

  // Helper to update active bank switch states and persist immediately
  const updateActiveBankSwitchStates = (updater: (prevStates: boolean[]) => boolean[]) => {
    setSwitchStatesByBank((prevMap) => {
      const currentStates = prevMap[activeBankId] || Array(8).fill(false);
      const nextStates = updater(currentStates);
      const updatedMap = {
        ...prevMap,
        [activeBankId]: nextStates,
      };
      localStorage.setItem('guitarfoot_switch_states_v3', JSON.stringify(updatedMap));
      return updatedMap;
    });
  };

  // Quick toggle theme
  const handleToggleThemeQuick = () => {
    const nextTheme: AppTheme = settings.theme === 'studio-bright' ? 'stage-night' : 'studio-bright';
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
  };

  // Dispatch MIDI Packet for Switch Actions
  const emitMidiEvent = (
    type: 'SWITCH_TAP' | 'SWITCH_HOLD' | 'SWITCH_RELEASE' | 'BANK_CHANGE',
    config: FootswitchConfig,
    isTap: boolean,
    turnOn: boolean
  ) => {
    if (!isConnected) return;

    const action = isTap ? config.tapAction : config.longPressAction;
    if (!action.isEnabled && type !== 'SWITCH_RELEASE') return;

    const targetValue = turnOn ? action.onValue : action.offValue;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

    // Simulate jitter (0.8ms - 1.8ms)
    const jitter = 0.8 + Math.random() * 0.9;
    setLatencyMs(jitter);

    const isNoteOn = action.midiType === 'NOTE' ? turnOn : true;
    const hex = getRawHex(action.midiType, action.channel, action.number, targetValue, isNoteOn);

    const desc = `${config.name} (${type === 'SWITCH_HOLD' ? 'HOLD' : type === 'SWITCH_RELEASE' ? 'REL' : 'TAP'}) → ${action.midiType} Ch${action.channel} #${action.number} [${turnOn ? 'ON' : 'OFF'}]`;

    const newLog: MIDIPacketLog = {
      id: `pkt-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      timeMs: Date.now(),
      type,
      switchName: config.name,
      switchIndex: config.index,
      midiType: action.midiType,
      channel: action.channel,
      number: action.number,
      value: targetValue,
      isNoteOn,
      rawHex: hex,
      description: desc,
      latencyMs: jitter,
    };

    setPacketLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    // Dynamic Tone update: appears under the name in the top box when tone changes!
    setActiveToneInfo({
      toneName: config.name,
      subLabel: config.subLabel,
      isEngaged: turnOn,
      actionType: type === 'SWITCH_HOLD' ? 'HOLD' : 'TAP',
      timestamp: Date.now(),
    });
  };

  // Logic Pro Track Stepping Handlers
  const handleLogicTrackUp = () => {
    const logicConfig = settings.logicPro || DEFAULT_LOGIC_PRO;
    const tracks = logicConfig.tracks && logicConfig.tracks.length > 0 ? logicConfig.tracks : DEFAULT_LOGIC_PRO.tracks;
    const currentIdx = logicConfig.currentTrackIndex || 0;
    const nextIdx = currentIdx > 0 ? currentIdx - 1 : tracks.length - 1;

    const newSettings: RigSettings = {
      ...settings,
      logicPro: {
        ...logicConfig,
        currentTrackIndex: nextIdx,
      },
    };
    setSettings(newSettings);

    const channel = logicConfig.channel || 1;
    const ccNum = logicConfig.trackUpCC || 48;
    const hex = getRawHex('CC', channel, ccNum, 127);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const trackName = tracks[nextIdx] || `Track ${nextIdx + 1}`;
    const newLog: MIDIPacketLog = {
      id: `pkt-logic-up-${Date.now()}`,
      timestamp: timeStr,
      timeMs: Date.now(),
      type: 'DIRECT_MIDI',
      switchName: 'Logic Pro Track UP Knock',
      midiType: 'CC',
      channel,
      number: ccNum,
      value: 127,
      rawHex: hex,
      description: `Logic Pro Track Step UP → [${nextIdx + 1}]: ${trackName} (CC#${ccNum})`,
      latencyMs: 0.9,
    };
    setPacketLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (settings.audioFeedback) {
      audioSynth.playClick(true, false, settings.stompVolume);
    }

    setActiveToneInfo({
      toneName: trackName,
      subLabel: `Logic Pro Track ${nextIdx + 1}`,
      isEngaged: true,
      actionType: 'LOGIC_TRACK',
      timestamp: Date.now(),
    });
  };

  const handleLogicTrackDown = () => {
    const logicConfig = settings.logicPro || DEFAULT_LOGIC_PRO;
    const tracks = logicConfig.tracks && logicConfig.tracks.length > 0 ? logicConfig.tracks : DEFAULT_LOGIC_PRO.tracks;
    const currentIdx = logicConfig.currentTrackIndex || 0;
    const nextIdx = currentIdx < tracks.length - 1 ? currentIdx + 1 : 0;

    const newSettings: RigSettings = {
      ...settings,
      logicPro: {
        ...logicConfig,
        currentTrackIndex: nextIdx,
      },
    };
    setSettings(newSettings);

    const channel = logicConfig.channel || 1;
    const ccNum = logicConfig.trackDownCC || 49;
    const hex = getRawHex('CC', channel, ccNum, 127);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const trackName = tracks[nextIdx] || `Track ${nextIdx + 1}`;
    const newLog: MIDIPacketLog = {
      id: `pkt-logic-down-${Date.now()}`,
      timestamp: timeStr,
      timeMs: Date.now(),
      type: 'DIRECT_MIDI',
      switchName: 'Logic Pro Track DOWN Knock',
      midiType: 'CC',
      channel,
      number: ccNum,
      value: 127,
      rawHex: hex,
      description: `Logic Pro Track Step DOWN → [${nextIdx + 1}]: ${trackName} (CC#${ccNum})`,
      latencyMs: 0.9,
    };
    setPacketLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (settings.audioFeedback) {
      audioSynth.playClick(true, false, settings.stompVolume);
    }

    setActiveToneInfo({
      toneName: trackName,
      subLabel: `Logic Pro Track ${nextIdx + 1}`,
      isEngaged: true,
      actionType: 'LOGIC_TRACK',
      timestamp: Date.now(),
    });
  };

  const handleSelectLogicTrackDirect = (trackIndex: number) => {
    const logicConfig = settings.logicPro || DEFAULT_LOGIC_PRO;
    const tracks = logicConfig.tracks && logicConfig.tracks.length > 0 ? logicConfig.tracks : DEFAULT_LOGIC_PRO.tracks;
    const validIdx = Math.max(0, Math.min(tracks.length - 1, trackIndex));

    const newSettings: RigSettings = {
      ...settings,
      logicPro: {
        ...logicConfig,
        currentTrackIndex: validIdx,
      },
    };
    setSettings(newSettings);

    const channel = logicConfig.channel || 1;
    const hex = getRawHex('PC', channel, validIdx, 0);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const trackName = tracks[validIdx] || `Track ${validIdx + 1}`;
    const newLog: MIDIPacketLog = {
      id: `pkt-logic-direct-${Date.now()}`,
      timestamp: timeStr,
      timeMs: Date.now(),
      type: 'DIRECT_MIDI',
      switchName: 'Logic Track Direct Select',
      midiType: 'PC',
      channel,
      number: validIdx,
      value: 0,
      rawHex: hex,
      description: `Logic Pro Direct Switch → [${validIdx + 1}]: ${trackName}`,
      latencyMs: 1.0,
    };
    setPacketLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (settings.audioFeedback) {
      audioSynth.playHoldChime(settings.stompVolume);
    }
    if (settings.hapticFeedback !== false) {
      haptic.triggerPressDown(settings.hapticStyle || 'crisp');
    }

    setActiveToneInfo({
      toneName: trackName,
      subLabel: `Logic Pro Track ${validIdx + 1}`,
      isEngaged: true,
      actionType: 'LOGIC_TRACK',
      timestamp: Date.now(),
    });
  };

  // Switch Press Down
  const handlePressDown = (index: number) => {
    const config = currentBank.switches[index];
    if (!config) return;

    if (settings.audioFeedback) {
      audioSynth.playClick(true, config.mode === 'Momentary', settings.stompVolume);
    }

    if (config.mode === 'Momentary') {
      updateActiveBankSwitchStates((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      emitMidiEvent('SWITCH_TAP', config, true, true);
    }
  };

  // Switch Press Up
  const handlePressUp = (index: number) => {
    const config = currentBank.switches[index];
    if (!config) return;

    if (config.mode === 'Toggle') {
      let newState = true;
      updateActiveBankSwitchStates((prev) => {
        const next = [...prev];
        newState = !next[index];
        next[index] = newState;
        return next;
      });
      emitMidiEvent('SWITCH_TAP', config, true, newState);
    } else if (config.mode === 'Momentary') {
      updateActiveBankSwitchStates((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      emitMidiEvent('SWITCH_RELEASE', config, true, false);
    }

    if (settings.audioFeedback) {
      audioSynth.playClick(false, false, settings.stompVolume);
    }
  };

  // Switch Long Press / Hold
  const handleLongPress = (index: number) => {
    const config = currentBank.switches[index];
    if (!config || !config.longPressAction.isEnabled) return;

    if (settings.audioFeedback) {
      audioSynth.playHoldChime(settings.stompVolume);
    }
    emitMidiEvent('SWITCH_HOLD', config, false, true);
  };

  // Bank Selection Handler
  const handleSelectBank = (bankId: string) => {
    setActiveBankId(bankId);
    if (settings.hapticFeedback !== false) {
      haptic.triggerBankChange();
    }
    const target = currentPreset.banks.find((b) => b.id === bankId);
    if (target && isConnected) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setPacketLogs((prev) => [
        {
          id: `pkt-bank-${Date.now()}`,
          timestamp: timeStr,
          timeMs: Date.now(),
          type: 'BANK_CHANGE',
          midiType: 'PC',
          channel: 1,
          number: 0,
          value: 0,
          rawHex: '0xC0 0x00',
          description: `Bank Switched to '${target.name}'`,
          latencyMs: 1.0,
        },
        ...prev.slice(0, 99),
      ]);

      setActiveToneInfo({
        toneName: `Bank: ${target.name}`,
        isEngaged: true,
        actionType: 'BANK',
        timestamp: Date.now(),
      });
    }
  };

  // Save updated Switch Config
  const handleSaveSwitchConfig = (updated: FootswitchConfig) => {
    const updatedPresets = presets.map((p) => {
      if (p.id === activePresetId) {
        return {
          ...p,
          banks: p.banks.map((b) => {
            if (b.id === activeBankId) {
              return {
                ...b,
                switches: b.switches.map((sw) => (sw.id === updated.id ? updated : sw)),
              };
            }
            return b;
          }),
        };
      }
      return p;
    });
    setPresets(updatedPresets);
  };

  // Update banks inside current preset
  const handleUpdateBanksForCurrentPreset = (updatedBanks: Bank[]) => {
    const updatedPresets = presets.map((p) => {
      if (p.id === activePresetId) {
        return {
          ...p,
          banks: updatedBanks,
        };
      }
      return p;
    });
    setPresets(updatedPresets);
  };

  const handleResetFactory = () => {
    setPresets(defaultPresets);
    setActivePresetId(defaultPresets[0].id);
    setActiveBankId(defaultPresets[0].defaultBankId);
    setSwitchStatesByBank({});
    setSettings(DEFAULT_SETTINGS);
    localStorage.clear();
  };

  const isLight = themeClasses.isLight;

  return (
    <div className={`min-h-[100dvh] ${themeClasses.pageBg} flex flex-col font-sans select-none antialiased transition-colors duration-200`}>
      {/* Top Stage Bar */}
      <div className={themeClasses.topBarBg}>
        <TopBar
          currentPreset={currentPreset}
          activeToneInfo={activeToneInfo}
          isConnected={isConnected}
          latencyMs={latencyMs}
          audioFeedback={settings.audioFeedback}
          currentTheme={settings.theme}
          onToggleAudio={() => setSettings((s) => ({ ...s, audioFeedback: !s.audioFeedback }))}
          onToggleThemeQuick={handleToggleThemeQuick}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCodeExplorer={() => setIsCodeExplorerOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenPresetManager={() => setIsPresetModalOpen(true)}
        />
      </div>

      {/* Bank Quick Selector (Second Line) */}
      <BankSelector
        banks={currentPreset.banks}
        activeBankId={activeBankId}
        theme={settings.theme}
        onSelectBank={handleSelectBank}
      />

      {/* Main Content Area: Page 1 (Rig & Logic Pro) or Page 2 (Cloud Bridge Two) */}
      <main className="flex-1 p-2.5 sm:p-3.5 md:p-5 max-w-7xl mx-auto w-full pb-8">
        {mobileTab === 'pedalboard' ? (
          /* PAGE 1: 8-Switch Live Pedalboard Rig (Compact & Left-Aligned) + Logic Pro Stepper */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 items-start">
            {/* 8-Footswitch Landscape Rig - Compact & Aligned to Left */}
            <section className="lg:col-span-7 xl:col-span-7 flex flex-col gap-2.5">
              <div
                id="live-rig-box"
                className={`${themeClasses.rigContainerBg} rounded-xl p-2.5 sm:p-3 md:p-3.5 transition-all duration-200 shadow-xl border ${
                  isLight ? 'border-slate-200' : 'border-zinc-800/80'
                }`}
              >
                {/* Rig Title Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: currentBank.colorTag || '#3B82F6' }}
                    />
                    <h2 className={`text-xs sm:text-sm font-extrabold tracking-wider uppercase font-mono ${themeClasses.rigTitleText}`}>
                      {currentBank.name} RIG
                    </h2>
                    <span className={`text-[11px] hidden sm:inline tracking-tight font-medium ${themeClasses.rigSubText}`}>
                      — {currentBank.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {switchOnStates.some(Boolean) && (
                      <button
                        onClick={() => updateActiveBankSwitchStates(() => Array(8).fill(false))}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-slate-100 text-amber-700 border-amber-300 hover:bg-amber-100'
                            : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 border-zinc-800 hover:border-amber-500/40'
                        }`}
                        title="Turn all active switches OFF for this bank"
                      >
                        ALL OFF
                      </button>
                    )}
                    <span
                      className={`text-[9px] font-bold tracking-wider hidden sm:inline font-mono ${
                        isLight ? 'text-slate-500' : 'text-zinc-500'
                      }`}
                    >
                      8-SWITCH MATRIX
                    </span>
                  </div>
                </div>

                {/* 8-Footswitch Responsive Matrix (2x4 on mobile, 4x2 on landscape/tablet/desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 items-stretch auto-rows-fr">
                  {currentBank.switches.map((config) => (
                    <FootswitchButton
                      key={config.id}
                      config={config}
                      isOn={switchOnStates[config.index]}
                      theme={settings.theme}
                      largeFont={settings.largeStageFont}
                      vibrantGlow={settings.vibrantGlow}
                      hapticFeedback={settings.hapticFeedback !== false}
                      hapticStyle={settings.hapticStyle || 'crisp'}
                      holdThresholdMs={settings.holdThresholdMs}
                      onPressDown={handlePressDown}
                      onPressUp={handlePressUp}
                      onLongPress={handleLongPress}
                      onConfigure={(cfg) => setEditingConfig(cfg)}
                    />
                  ))}
                </div>

                {/* Stage Quick Tip Footer */}
                <div
                  className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between text-[10px] font-mono gap-1.5 transition-colors ${
                    isLight ? 'border-slate-200 text-slate-600' : 'border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <span className="font-medium">
                    💡 Tap to toggle • Hold {settings.holdThresholdMs / 1000}s for secondary
                  </span>
                  <span className="text-blue-500 font-bold">Network UDP @ 50001</span>
                </div>
              </div>
            </section>

            {/* Side Column: Logic Pro Track Controller with Dual Up/Down Knocks */}
            <section className="lg:col-span-5 xl:col-span-5">
              <LogicProTrackController
                config={settings.logicPro || DEFAULT_LOGIC_PRO}
                theme={settings.theme}
                isConnected={isConnected}
                onTrackUp={handleLogicTrackUp}
                onTrackDown={handleLogicTrackDown}
                onSelectTrackDirect={handleSelectLogicTrackDirect}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </section>
          </div>
        ) : (
          /* PAGE 2: Cloud Bridge Two - Full Mac MIDI Bridge Inspector & Jitter Visualizer */
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setMobileTab('pedalboard')}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                ← Back to Live Rig
              </button>
              <span className="text-xs font-mono text-zinc-400">
                Cloud Bridge Two Active
              </span>
            </div>

            <MacBridgeSimulator
              logs={packetLogs}
              isConnected={isConnected}
              theme={settings.theme}
              onToggleConnection={() => setIsConnected(!isConnected)}
              onClearLogs={() => setPacketLogs([])}
              selectedDestination={selectedDestination}
              onSelectDestination={setSelectedDestination}
              latencyMs={latencyMs}
            />
          </div>
        )}
      </main>

      {/* Preset Library & Global Program Change (PC) Modal */}
      {isPresetModalOpen && (
        <PresetManagerModal
          presets={presets}
          activePresetId={activePresetId}
          theme={settings.theme}
          onSelectPreset={handleSelectPreset}
          onUpdatePresets={setPresets}
          onClose={() => setIsPresetModalOpen(false)}
        />
      )}

      {/* Switch Config Modal */}
      {editingConfig && (
        <SwitchConfigModal
          config={editingConfig}
          onSave={handleSaveSwitchConfig}
          onClose={() => setEditingConfig(null)}
        />
      )}

      {/* Bank Manager Modal */}
      {isBankManagerOpen && (
        <BankManagerModal
          banks={currentPreset.banks}
          activeBankId={activeBankId}
          onSelectBank={handleSelectBank}
          onUpdateBanks={handleUpdateBanksForCurrentPreset}
          onClose={() => setIsBankManagerOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          banks={currentPreset.banks}
          onImportBanks={(imported) => {
            handleUpdateBanksForCurrentPreset(imported);
            setActiveBankId(imported[0]?.id || 'bank-live');
          }}
          onResetFactory={handleResetFactory}
          onOpenBankManager={() => setIsBankManagerOpen(true)}
          activeView={mobileTab}
          onSelectView={(v) => {
            setMobileTab(v);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Swift Code Explorer */}
      {isCodeExplorerOpen && (
        <CodeExplorerModal onClose={() => setIsCodeExplorerOpen(false)} />
      )}

      {/* DAW Setup Guide */}
      {isGuideOpen && <SetupGuideModal onClose={() => setIsGuideOpen(false)} />}
    </div>
  );
}
