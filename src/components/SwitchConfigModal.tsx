import React, { useState } from 'react';
import { FootswitchConfig, MIDIType, SwitchMode } from '../types';
import { X, Check, Sliders, Music, Zap, Sparkles } from 'lucide-react';

interface SwitchConfigModalProps {
  config: FootswitchConfig;
  onSave: (updated: FootswitchConfig) => void;
  onClose: () => void;
}

const colorPalette = [
  '#0284C7', '#2563EB', '#4F46E5', '#7C3AED', '#9333EA',
  '#DB2777', '#DC2626', '#EA580C', '#D97706', '#059669',
  '#0891B2', '#0D9488', '#475569'
];

export const SwitchConfigModal: React.FC<SwitchConfigModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<FootswitchConfig>({
    ...config,
    tapAction: { ...config.tapAction },
    longPressAction: { ...config.longPressAction },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md transition-all p-2 sm:p-4 md:p-6 custom-scrollbar overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-2 sm:py-4 w-full pointer-events-none">
        <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#090b10] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight font-mono">
                Configure Footswitch {formData.index + 1}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content (Flows naturally so everything scrolls up at once) */}
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 text-sm">
          {/* General Info */}
          <div className="space-y-3 bg-[#080a0f] p-3.5 rounded-xl border border-zinc-800/80">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Identity & Appearance
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Switch Label</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-100 font-bold focus:outline-none focus:border-blue-500 transition-colors text-xs"
                  placeholder="e.g. SOLO"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Sub-Label</label>
                <input
                  type="text"
                  value={formData.subLabel}
                  onChange={(e) => setFormData({ ...formData, subLabel: e.target.value })}
                  className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. NOTE #39"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Switch Mode</label>
                <div className="flex bg-[#121620] p-1 rounded-xl border border-zinc-700/80">
                  {(['Toggle', 'Momentary'] as SwitchMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formData.mode === mode
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">LED Color</label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {colorPalette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, ledColorHex: hex })}
                      className="w-5 h-5 rounded-full shrink-0 border transition-all cursor-pointer"
                      style={{
                        backgroundColor: hex,
                        borderColor: formData.ledColorHex === hex ? '#fff' : 'transparent',
                        boxShadow: formData.ledColorHex === hex ? `0 0 8px ${hex}` : 'none',
                        transform: formData.ledColorHex === hex ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tap Action */}
          <div className="space-y-3 bg-[#080a0f] p-3.5 rounded-xl border border-zinc-800/80">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Tap Action MIDI Configuration
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">MIDI Type</label>
                <select
                  value={formData.tapAction.midiType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tapAction: { ...formData.tapAction, midiType: e.target.value as MIDIType },
                    })
                  }
                  className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="NOTE">MIDI Note</option>
                  <option value="CC">CC</option>
                  <option value="PC">PC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Channel</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={formData.tapAction.channel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tapAction: { ...formData.tapAction, channel: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {formData.tapAction.midiType === 'NOTE'
                    ? 'Note #'
                    : formData.tapAction.midiType === 'CC'
                    ? 'CC #'
                    : 'PC #'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={127}
                  value={formData.tapAction.number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tapAction: { ...formData.tapAction, number: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {formData.tapAction.midiType !== 'PC' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">ON Value (0-127)</label>
                  <input
                    type="number"
                    min={0}
                    max={127}
                    value={formData.tapAction.onValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tapAction: { ...formData.tapAction, onValue: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">OFF Value (0-127)</label>
                  <input
                    type="number"
                    min={0}
                    max={127}
                    value={formData.tapAction.offValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tapAction: { ...formData.tapAction, offValue: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Long Press Action */}
          <div className="space-y-3 bg-[#080a0f] p-3.5 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Long Press Action (0.45s Hold)
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.longPressAction.isEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longPressAction: { ...formData.longPressAction, isEnabled: e.target.checked },
                    })
                  }
                  className="rounded bg-[#121620] border-zinc-700 text-purple-600 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs font-semibold text-zinc-300">Enabled</span>
              </label>
            </div>

            {formData.longPressAction.isEnabled && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Type</label>
                    <select
                      value={formData.longPressAction.midiType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longPressAction: {
                            ...formData.longPressAction,
                            midiType: e.target.value as MIDIType,
                          },
                        })
                      }
                      className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="NOTE">MIDI Note</option>
                      <option value="CC">CC</option>
                      <option value="PC">PC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Channel</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={formData.longPressAction.channel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longPressAction: {
                            ...formData.longPressAction,
                            channel: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Number</label>
                    <input
                      type="number"
                      min={0}
                      max={127}
                      value={formData.longPressAction.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longPressAction: {
                            ...formData.longPressAction,
                            number: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full bg-[#121620] border border-zinc-700/80 rounded-xl px-2.5 py-2 text-zinc-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" /> Save Switch
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};
