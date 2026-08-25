import React, { useState } from 'react';
import { X, BookOpen, Terminal, CheckCircle2, Music } from 'lucide-react';

interface SetupGuideModalProps {
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'daw' | 'cli'>('daw');

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in p-2 sm:p-4 md:p-6 custom-scrollbar overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-2 sm:py-4 w-full pointer-events-none">
        <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#090b10] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wide">
                Live Performance & DAW Integration Guide
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector (Sticky) */}
          <div className="sticky top-0 z-20 flex border-b border-zinc-800/80 bg-[#0c0f16]/95 backdrop-blur px-5 pt-2 shrink-0">
            <button
              onClick={() => setTab('daw')}
              className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                tab === 'daw'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="w-4 h-4" /> Logic Pro & AmpliTube Setup
            </button>
            <button
              onClick={() => setTab('cli')}
              className={`px-4 py-2 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                tab === 'cli'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-4 h-4" /> Standalone Build Commands
            </button>
          </div>

          {/* Guide Content (Flows naturally) */}
          <div className="p-4 sm:p-6 space-y-6 text-sm text-zinc-300">
          {tab === 'daw' ? (
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> Step 1: Start Mac MIDI Bridge
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Run <code className="text-zinc-200 bg-black/60 px-1.5 py-0.5 rounded font-mono border border-white/5">./build.sh mac-run</code> on your Mac. The bridge creates a CoreMIDI virtual source named <strong className="text-emerald-400">"GuitarFoot Bridge"</strong> and broadcasts on UDP port 50001 over local Wi-Fi.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> Step 2: Connect iPhone / iPad
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ensure the iPhone is on the same local Wi-Fi network. Launch the iOS app; Bonjour immediately discovers the Mac and establishes a low-latency UDP socket (&lt; 2 ms RTT).
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> Step 3: Map in Logic Pro & Plugins
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  In <strong>Logic Pro</strong>, verify <code className="text-zinc-200 bg-black/60 px-1.5 py-0.5 rounded font-mono border border-white/5">GuitarFoot Bridge</code> is checked under MIDI Inputs. In <strong>AmpliTube 5</strong>, <strong>Guitar Rig</strong>, or <strong>Neural DSP</strong>, right-click any stompbox (e.g. Overdrive, Delay) and select <strong>MIDI Learn</strong>, then tap the footswitch on your iPhone!
                </p>
              </div>

              {/* MIDI Mapping Reference Table */}
              <div className="space-y-2 pt-2">
                <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Default Footswitch Mapping
                </h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-[#080a0f] text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2.5">Switch</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Mode</th>
                        <th className="p-2.5">Tap Action</th>
                        <th className="p-2.5">Hold Action (0.45s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-[#0d1017]">
                      <tr>
                        <td className="p-2.5 font-bold text-cyan-400">SW 1</td>
                        <td className="p-2.5 text-zinc-100">CLEAN</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">Program Change #01</td>
                        <td className="p-2.5 text-purple-300">CC #10</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-400">SW 2</td>
                        <td className="p-2.5 text-zinc-100">CRUNCH</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">Program Change #02</td>
                        <td className="p-2.5 text-purple-300">CC #11</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-400">SW 3</td>
                        <td className="p-2.5 text-zinc-100">RHYTHM</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">Program Change #03</td>
                        <td className="p-2.5 text-purple-300">CC #12</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-purple-400">SW 4</td>
                        <td className="p-2.5 text-zinc-100">SOLO</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">MIDI Note #39 (Vel 127)</td>
                        <td className="p-2.5 text-purple-300">CC #23</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-teal-400">SW 5</td>
                        <td className="p-2.5 text-zinc-100">DELAY</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">CC #28</td>
                        <td className="p-2.5 text-purple-300">CC #64 (Tap Tempo)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-400">SW 6</td>
                        <td className="p-2.5 text-zinc-100">REVERB</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">CC #29</td>
                        <td className="p-2.5 text-purple-300">CC #65</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-pink-400">SW 7</td>
                        <td className="p-2.5 text-zinc-100">BOOST</td>
                        <td className="p-2.5 text-zinc-400">Momentary</td>
                        <td className="p-2.5 text-zinc-300">CC #30 (Mom)</td>
                        <td className="p-2.5 text-purple-300">CC #31</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-zinc-400">SW 8</td>
                        <td className="p-2.5 text-zinc-100">MUTE</td>
                        <td className="p-2.5 text-zinc-400">Toggle</td>
                        <td className="p-2.5 text-zinc-300">CC #07 (Val 0/127)</td>
                        <td className="p-2.5 text-purple-300">CC #84 (Tuner)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h3 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                  1. Launch macOS MIDI Bridge (No Xcode)
                </h3>
                <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5">
{`cd GuitarFootController
./build.sh mac-run

# Or directly with Swift Package Manager:
swift run MacMIDIBridge`}
                </pre>
              </div>

              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h3 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                  2. Create standalone .app bundle
                </h3>
                <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5">
{`./build.sh mac-app
# Generates dist/MacMIDIBridge.app`}
                </pre>
              </div>

              <div className="bg-[#080a0f] p-4 rounded-xl border border-zinc-800/80 space-y-3">
                <h3 className="text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                  3. Run Automated Unit Tests
                </h3>
                <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5">
{`./build.sh test
# Tests CoreMIDI Note ON/OFF, CC, Program Change byte encoders and UDP packet serialization`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
