export type MIDIType = 'NOTE' | 'CC' | 'PC';

export type SwitchMode = 'Toggle' | 'Momentary';

export type AppTheme = 'stage-night' | 'studio-bright' | 'amber-glow' | 'high-contrast-neon';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  lightingEnvironment: string;
  description: string;
  badge: string;
  previewBg: string;
  previewAccent: string;
  previewBorder: string;
  previewText: string;
}

export interface LogicProConfig {
  channel: number;
  trackUpCC: number;
  trackDownCC: number;
  trackMode: 'CC' | 'PC' | 'NOTE';
  currentTrackIndex: number;
  tracks: string[];
}

export interface BridgeSettings {
  selectedDestination: string;
  bonjourPort: number;
  simulatedLatencyMs: number;
  autoReconnect: boolean;
}

export interface RigSettings {
  theme: AppTheme;
  largeStageFont: boolean;
  vibrantGlow: boolean;
  audioFeedback: boolean;
  hapticFeedback: boolean;
  hapticStyle?: 'crisp' | 'firm' | 'double' | 'soft';
  stompVolume: number; // 0.1 - 1.0
  holdThresholdMs: number; // e.g. 450ms
  logicPro?: LogicProConfig;
  bridge?: BridgeSettings;
}

export interface ActionMIDIConfig {
  isEnabled: boolean;
  midiType: MIDIType;
  channel: number; // 1-16
  number: number;  // 0-127
  onValue: number; // 0-127
  offValue: number; // 0-127
}

export interface FootswitchConfig {
  id: string;
  index: number; // 0-7
  name: string;
  subLabel: string;
  mode: SwitchMode;
  ledColorHex: string;
  tapAction: ActionMIDIConfig;
  longPressAction: ActionMIDIConfig;
}

export interface Bank {
  id: string;
  name: string;
  description: string;
  colorTag: string;
  switches: FootswitchConfig[];
}

export interface GlobalProgramChangeConfig {
  isEnabled: boolean;
  channel: number; // 1-16
  programNumber: number; // 0-127
}

export interface Preset {
  id: string;
  name: string;
  details: string;
  globalProgramChange: GlobalProgramChangeConfig;
  banks: Bank[];
  defaultBankId: string;
}

export interface CoreMIDIDevice {
  id: string;
  name: string;
  type: 'virtual' | 'hardware' | 'iac' | 'plugin';
  isOnline: boolean;
}

export interface MIDIPacketLog {
  id: string;
  timestamp: string;
  timeMs: number;
  type: 'SWITCH_TAP' | 'SWITCH_HOLD' | 'SWITCH_RELEASE' | 'DIRECT_MIDI' | 'BANK_CHANGE' | 'PRESET_CHANGE' | 'PING_PONG';
  switchName?: string;
  switchIndex?: number;
  midiType: MIDIType;
  channel: number;
  number: number;
  value: number;
  isNoteOn?: boolean;
  rawHex: string;
  description: string;
  latencyMs: number;
}
