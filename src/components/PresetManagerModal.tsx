import React, { useState } from 'react';
import { Preset, AppTheme } from '../types';
import { X, Sparkles, Plus, Check, Sliders, Radio, Music2, ArrowRight } from 'lucide-react';

interface PresetManagerModalProps {
  presets: Preset[];
  activePresetId: string;
  theme?: AppTheme;
  onSelectPreset: (presetId: string) => void;
  onUpdatePresets: (presets: Preset[]) => void;
  onClose: () => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  presets,
  activePresetId,
  theme = 'stage-night',
  onSelectPreset,
  onUpdatePresets,
  onClose,
}) => {
  const isLight = theme === 'studio-bright';

  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    details: string;
    globalPcEnabled: boolean;
    channel: number;
    programNumber: number;
  }>({
    name: '',
    details: '',
    globalPcEnabled: true,
    channel: 1,
    programNumber: 1,
  });

  const handleStartEdit = (preset: Preset) => {
    setEditingPresetId(preset.id);
    setEditForm({
      name: preset.name,
      details: preset.details,
      globalPcEnabled: preset.globalProgramChange?.isEnabled ?? true,
      channel: preset.globalProgramChange?.channel ?? 1,
      programNumber: preset.globalProgramChange?.programNumber ?? 1,
    });
  };

  const handleSaveEdit = () => {
    if (!editingPresetId) return;
    const updated = presets.map((p) => {
      if (p.id === editingPresetId) {
        return {
          ...p,
          name: editForm.name.trim() || p.name,
          details: editForm.details.trim() || p.details,
          globalProgramChange: {
            isEnabled: editForm.globalPcEnabled,
            channel: editForm.channel,
            programNumber: editForm.programNumber,
          },
        };
      }
      return p;
    });
    onUpdatePresets(updated);
    setEditingPresetId(null);
  };

  const handleCreateNewPreset = () => {
    const newId = `preset-${Date.now()}`;
    const nextProgram = (presets.length * 10) % 128;
    const basePreset = presets[0];
    const newPreset: Preset = {
      id: newId,
      name: `NEW PRESET ${presets.length + 1}`,
      details: 'Custom performance patch with instant Global Program Change hardware sync',
      globalProgramChange: {
        isEnabled: true,
        channel: 1,
        programNumber: nextProgram,
      },
      banks: basePreset ? JSON.parse(JSON.stringify(basePreset.banks)) : [],
      defaultBankId: basePreset?.defaultBankId || 'bank-live',
    };
    const updated = [...presets, newPreset];
    onUpdatePresets(updated);
    onSelectPreset(newId);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md transition-all p-2 sm:p-4 md:p-6 custom-scrollbar overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-2 sm:py-4 w-full pointer-events-none">
        <div
          className={`w-full max-w-xl rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden border transition-all pointer-events-auto ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-[#0f131c] border-zinc-800 text-zinc-100'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800/80 bg-[#141924]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  isLight
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                }`}
              >
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                  Preset Library & Global PC Sync
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Switching presets instantly sends a Global Program Change (PC) to your Mac DAW & rig
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 space-y-3.5">
          {/* Preset list */}
          <div className="space-y-2.5">
            {presets.map((preset) => {
              const isSelected = preset.id === activePresetId;
              const isEditing = preset.id === editingPresetId;
              const pcConfig = preset.globalProgramChange;

              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-md'
                        : 'bg-blue-950/30 border-blue-500/70 ring-1 ring-blue-500/30 shadow-lg shadow-blue-950/40'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-[#121722] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          onSelectPreset(preset.id);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm tracking-tight">{preset.name}</span>
                          {isSelected && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                                isLight
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              }`}
                            >
                              <Check className="w-3 h-3" /> ACTIVE PRESET
                            </span>
                          )}

                          {pcConfig?.isEnabled ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isLight
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              Global PC: #{String(pcConfig.programNumber).padStart(2, '0')} (Ch {pcConfig.channel})
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isLight
                                  ? 'bg-slate-200 text-slate-600 border-slate-300'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              Global PC: Disabled
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {preset.details}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          <span className={isLight ? 'text-slate-500 font-semibold' : 'text-zinc-400 font-semibold'}>
                            {preset.banks.length} Banks ({preset.banks.map((b) => b.name).join(', ')})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(preset)}
                          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                          }`}
                          title="Configure Preset & Global PC"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit PC</span>
                        </button>

                        {!isSelected && (
                          <button
                            onClick={() => {
                              onSelectPreset(preset.id);
                              onClose();
                            }}
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <span>Load</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Inline Preset & Global PC Editor */
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                          Edit Preset Settings & Global PC
                        </h4>
                        <button
                          onClick={() => setEditingPresetId(null)}
                          className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'} hover:underline`}
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                            Preset Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-blue-500 ${
                              isLight
                                ? 'bg-white border-slate-300 text-slate-900'
                                : 'bg-[#0a0d14] border-zinc-700 text-zinc-100'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                            Description / Patch Details
                          </label>
                          <input
                            type="text"
                            value={editForm.details}
                            onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-blue-500 ${
                              isLight
                                ? 'bg-white border-slate-300 text-slate-900'
                                : 'bg-[#0a0d14] border-zinc-700 text-zinc-100'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Global Program Change (PC) Settings Box */}
                      <div
                        className={`p-3 rounded-lg border flex flex-col gap-2.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-[#080b11] border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.globalPcEnabled}
                              onChange={(e) =>
                                setEditForm({ ...editForm, globalPcEnabled: e.target.checked })
                              }
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <span>Enable Global Program Change (PC) on Selection</span>
                          </label>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              editForm.globalPcEnabled
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {editForm.globalPcEnabled ? 'AUTO-SYNC ACTIVE' : 'OFF'}
                          </span>
                        </div>

                        {editForm.globalPcEnabled && (
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className={`text-[11px] font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                MIDI Channel (1 - 16)
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={16}
                                value={editForm.channel}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    channel: Math.min(16, Math.max(1, parseInt(e.target.value) || 1)),
                                  })
                                }
                                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-blue-500 font-bold ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                                    : 'bg-[#121620] border-zinc-700 text-zinc-100'
                                }`}
                              />
                            </div>

                            <div>
                              <label className={`text-[11px] font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                                Program Number (0 - 127)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={127}
                                value={editForm.programNumber}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    programNumber: Math.min(
                                      127,
                                      Math.max(0, parseInt(e.target.value) || 0)
                                    ),
                                  })
                                }
                                className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-blue-500 font-bold ${
                                  isLight
                                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                                    : 'bg-[#121620] border-zinc-700 text-zinc-100'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                          Transmits MIDI command <code className="text-blue-500 font-bold">0x{((0xc0 | (editForm.channel - 1))).toString(16).toUpperCase()} 0x{editForm.programNumber.toString(16).toUpperCase().padStart(2, '0')}</code> immediately when this preset is selected.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingPresetId(null)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Preset Button */}
          <button
            onClick={handleCreateNewPreset}
            className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 bg-slate-50'
                : 'border-zinc-800 text-zinc-400 hover:border-blue-500/60 hover:text-blue-400 bg-zinc-900/40'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Preset with Global PC</span>
          </button>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-zinc-800/80 bg-[#141924] text-zinc-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Hardware & DAW Sync Enabled
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
