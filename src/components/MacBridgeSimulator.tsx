import React, { useState, useEffect, useMemo } from 'react';
import { MIDIPacketLog, CoreMIDIDevice, AppTheme } from '../types';
import {
  Cpu,
  Terminal,
  Trash2,
  Wifi,
  WifiOff,
  Disc,
  RefreshCw,
  CheckCircle2,
  Activity,
  Zap,
  Radio,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface MacBridgeSimulatorProps {
  logs: MIDIPacketLog[];
  isConnected: boolean;
  theme?: AppTheme;
  onToggleConnection: () => void;
  onClearLogs: () => void;
  selectedDestination: string;
  onSelectDestination: (dest: string) => void;
  latencyMs: number;
}

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
  {
    id: 'dest-logic-ext',
    name: 'Logic Pro External MIDI Router',
    type: 'plugin',
    isOnline: true,
  },
];

export const MacBridgeSimulator: React.FC<MacBridgeSimulatorProps> = ({
  logs,
  isConnected,
  theme = 'stage-night',
  onToggleConnection,
  onClearLogs,
  selectedDestination,
  onSelectDestination,
  latencyMs,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [simulateJitterSpike, setSimulateJitterSpike] = useState(false);

  // Rolling latency history buffer for real-time jitter visualizer
  const [latencyHistory, setLatencyHistory] = useState<number[]>([
    1.4, 1.8, 1.6, 2.1, 1.7, 1.5, 1.9, 2.3, 1.8, 1.6, 2.0, 1.9, 1.7, 2.2, 1.8, 1.5, 2.0, 1.7, 1.9, 2.1, 1.8, 1.6, 1.9, 2.0,
  ]);

  const isLight = theme === 'studio-bright';
  const lastLog = logs[0];

  // Periodic heartbeat / ping simulation for live Wi-Fi latency jitter graph
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setLatencyHistory((prev) => {
        let base = latencyMs || 1.8;
        // Natural slight Wi-Fi variance (±0.4ms) or simulated spike
        let jitterVariation = (Math.random() - 0.5) * 0.7;
        if (simulateJitterSpike && Math.random() > 0.6) {
          jitterVariation += Math.random() * 8.5; // Simulate stage RF traffic interference
        }
        const nextVal = Math.max(0.7, Number((base + jitterVariation).toFixed(1)));
        return [...prev.slice(1), nextVal];
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isConnected, latencyMs, simulateJitterSpike]);

  // Compute jitter metrics from rolling buffer
  const stats = useMemo(() => {
    if (!isConnected || latencyHistory.length === 0) {
      return { current: 0, min: 0, max: 0, avg: 0, jitter: 0, status: 'DISCONNECTED' };
    }
    const current = latencyHistory[latencyHistory.length - 1];
    const min = Math.min(...latencyHistory);
    const max = Math.max(...latencyHistory);
    const sum = latencyHistory.reduce((acc, v) => acc + v, 0);
    const avg = Number((sum / latencyHistory.length).toFixed(1));

    // Calculate jitter as mean absolute difference between successive packet latencies
    let diffSum = 0;
    for (let i = 1; i < latencyHistory.length; i++) {
      diffSum += Math.abs(latencyHistory[i] - latencyHistory[i - 1]);
    }
    const jitter = Number((diffSum / (latencyHistory.length - 1)).toFixed(2));

    let status = 'ULTRA STABLE';
    if (jitter > 4 || max > 12) status = 'STAGE JITTER DETECTED';
    else if (jitter > 1.5 || max > 6) status = 'GOOD (LIVE SAFE)';

    return { current, min, max, avg, jitter, status };
  }, [latencyHistory, isConnected]);

  const handleDestinationChange = (newDest: string) => {
    onSelectDestination(newDest);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  return (
    <div
      id="cloud-bridge-two-simulator"
      className={`rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-2xl transition-colors ${
        isLight
          ? 'bg-white border-2 border-slate-300 text-slate-900'
          : 'bg-[#0e121a] border border-zinc-800/90 text-zinc-100'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b pb-3 ${
          isLight ? 'border-slate-200' : 'border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-mono">
              Cloud Bridge Two • Mac MIDI
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                }`}
              >
                UDP 50001
              </span>
            </h2>
            <p className={`text-[11px] font-medium tracking-tight font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Bonjour: <code className={isLight ? 'text-blue-600 font-bold' : 'text-blue-300'}>_guitarfoot._udp</code>
            </p>
          </div>
        </div>

        <button
          onClick={onToggleConnection}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
            isConnected
              ? isLight
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40 shadow-sm shadow-emerald-500/10'
              : isLight
                ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="font-mono">LIVE ({stats.current.toFixed(1)}ms)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-mono">OFFLINE</span>
            </>
          )}
        </button>
      </div>

      {/* REAL-TIME LATENCY JITTER VISUALIZER FOR LIVE WI-FI STABILITY */}
      <div
        id="latency-jitter-visualizer"
        className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a0f] border-zinc-800/80'
        }`}
      >
        {/* Visualizer Header: Telemetry Badges & Stability Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                Real-Time Latency Jitter
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    stats.jitter < 1.5
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : stats.jitter < 4
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {stats.status}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulateJitterSpike(!simulateJitterSpike)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 font-mono ${
                simulateJitterSpike
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                  : isLight
                  ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Toggle simulated RF / 2.4GHz Wi-Fi congestion to stress test bridge jitter tolerance"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{simulateJitterSpike ? 'Jitter Stress Active' : 'Simulate RF Spike'}</span>
            </button>
          </div>
        </div>

        {/* Live Rolling Latency Sparkline & Jitter Waveform */}
        <div
          className={`p-2.5 rounded-lg border relative overflow-hidden flex flex-col justify-end h-24 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#05070a] border-zinc-850'
          }`}
        >
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-1.5 opacity-20">
            <div className="border-b border-dashed border-zinc-500 w-full flex justify-between text-[8px] font-mono">
              <span>10ms threshold</span>
            </div>
            <div className="border-b border-dashed border-zinc-500 w-full flex justify-between text-[8px] font-mono">
              <span>5ms stage safe</span>
            </div>
            <div className="border-b border-dashed border-zinc-500 w-full flex justify-between text-[8px] font-mono">
              <span>0ms</span>
            </div>
          </div>

          {/* Dynamic SVG Jitter Path & Bars */}
          <div className="relative z-10 flex items-end justify-between h-full gap-1 pt-2">
            {latencyHistory.map((val, idx) => {
              const maxScale = 15; // Max 15ms
              const heightPercent = Math.min(100, Math.max(10, (val / maxScale) * 100));
              const isHigh = val > 8;
              const isMed = val > 4;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isHigh
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : isMed
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/40'
                        : isLight
                        ? 'bg-emerald-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -top-6 text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                    {val}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency & Jitter Metrics Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div
            className={`p-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e121a] border-zinc-800/70'
            }`}
          >
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">Current Ping</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
              {stats.current.toFixed(1)} <span className="text-[9px] font-normal text-zinc-400">ms</span>
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e121a] border-zinc-800/70'
            }`}
          >
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">Jitter Variance</span>
            <span className="text-xs sm:text-sm font-extrabold text-indigo-400">
              ±{stats.jitter.toFixed(2)} <span className="text-[9px] font-normal text-zinc-400">ms</span>
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e121a] border-zinc-800/70'
            }`}
          >
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">Min / Max</span>
            <span className="text-xs sm:text-sm font-extrabold text-zinc-200">
              {stats.min.toFixed(1)} / {stats.max.toFixed(1)} <span className="text-[9px] font-normal text-zinc-400">ms</span>
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e121a] border-zinc-800/70'
            }`}
          >
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">Packet Drop</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
              0.0% <span className="text-[9px] font-normal text-zinc-400">Loss</span>
            </span>
          </div>
        </div>

        {/* Wi-Fi Optimization Advice */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-blue-400" />
            Wi-Fi: 5GHz Stage Band (Low interference)
          </span>
          <span className="text-emerald-400 font-bold">QoS Priority: Audio/MIDI</span>
        </div>
      </div>

      {/* Target DAW / CoreMIDI Output Selector */}
      <div
        className={`p-3 rounded-xl border flex flex-col gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a0f] border-zinc-800/70'
        }`}
      >
        <div className="flex items-center justify-between">
          <label
            className={`text-xs font-bold flex items-center gap-1.5 font-mono ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-purple-500" />
            CoreMIDI Output Device:
          </label>
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer font-mono ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Rescan CoreMIDI destinations"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-blue-500' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
          </button>
        </div>

        <select
          value={selectedDestination}
          onChange={(e) => handleDestinationChange(e.target.value)}
          className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer font-mono ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800'
              : 'bg-[#121620] border-zinc-700/80 text-zinc-200'
          }`}
        >
          {detectedMidiDevices.map((dev) => (
            <option key={dev.id} value={dev.name}>
              {dev.name} {dev.isOnline ? '' : '(Offline)'}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between text-[11px] pt-0.5 font-mono">
          <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>
            Routes MIDI directly to Logic Pro, DAWs & hardware.
          </span>
          <span
            className={`flex items-center gap-1 font-bold ${
              isLight ? 'text-emerald-700' : 'text-emerald-400/90'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {justSaved ? 'Saved to Preferences!' : 'UserDefaults Saved'}
          </span>
        </div>
      </div>

      {/* Real-time MIDI Command Display */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`p-3 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a0f] border-zinc-800/70'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block mb-1 font-mono ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            Last Event
          </span>
          <div className="text-xs font-bold truncate">
            {lastLog ? (
              <span className={isLight ? 'text-blue-600' : 'text-blue-400'}>
                {lastLog.description}
              </span>
            ) : (
              <span className={isLight ? 'text-slate-400' : 'text-zinc-400'}>
                Awaiting trigger...
              </span>
            )}
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a0f] border-zinc-800/70'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block mb-1 font-mono ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            Raw Hex Bytes
          </span>
          <div className="text-xs font-bold truncate text-purple-500 font-mono">
            {lastLog ? lastLog.rawHex : '0x00 0x00 0x00'}
          </div>
        </div>
      </div>

      {/* Live Activity Packet Monitor */}
      <div
        className={`rounded-xl border p-3 flex flex-col ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a0f] border-zinc-800/70'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-bold flex items-center gap-1.5 font-mono ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            Live Stream Monitor ({logs.length})
          </span>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer font-mono ${
                isLight ? 'text-slate-500 hover:text-rose-600' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="h-36 overflow-y-auto space-y-1.5 text-[11px] pr-1 font-mono">
          {logs.length === 0 ? (
            <div
              className={`text-center py-8 text-xs ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}
            >
              Trigger any of the 8 switches to inspect real-time packets...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-[#10141c] border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[10px] shrink-0 font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                    {log.timestamp}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.type === 'PRESET_CHANGE'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : isLight
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-blue-500/15 text-blue-400'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className={`truncate font-medium ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                    {log.description}
                  </span>
                </div>
                <span className="text-purple-500 text-[10px] font-bold shrink-0 ml-2 font-mono">
                  {log.rawHex}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
