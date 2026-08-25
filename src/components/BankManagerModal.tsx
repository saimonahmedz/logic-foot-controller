import React, { useState } from 'react';
import { Bank } from '../types';
import { createDefaultEightSwitches } from '../data/defaultRig';
import { X, Plus, Copy, Trash2, Edit3, Check, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface BankManagerModalProps {
  banks: Bank[];
  activeBankId: string;
  onSelectBank: (id: string) => void;
  onUpdateBanks: (updatedBanks: Bank[]) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#38BDF8', // Sky Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#A855F7', // Purple
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const BankManagerModal: React.FC<BankManagerModalProps> = ({
  banks,
  activeBankId,
  onSelectBank,
  onUpdateBanks,
  onClose,
}) => {
  const [newBankName, setNewBankName] = useState('');
  const [newBankDesc, setNewBankDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBankName.trim().toUpperCase();
    if (!name) return;

    const newBank: Bank = {
      id: `bank-${Date.now()}`,
      name,
      description: newBankDesc.trim() || 'Custom Rig Bank',
      colorTag: selectedColor,
      switches: createDefaultEightSwitches(),
    };

    const updated = [...banks, newBank];
    onUpdateBanks(updated);
    onSelectBank(newBank.id);
    setNewBankName('');
    setNewBankDesc('');
  };

  const handleDuplicate = (bank: Bank) => {
    const copy: Bank = {
      ...bank,
      id: `bank-${Date.now()}`,
      name: `${bank.name} (COPY)`,
      switches: bank.switches.map((sw) => ({
        ...sw,
        id: `sw-${Date.now()}-${sw.index}`,
        tapAction: { ...sw.tapAction },
        longPressAction: { ...sw.longPressAction },
      })),
    };
    onUpdateBanks([...banks, copy]);
  };

  const handleDelete = (bankId: string) => {
    if (banks.length <= 1) return;
    const updated = banks.filter((b) => b.id !== bankId);
    onUpdateBanks(updated);
    if (activeBankId === bankId) {
      onSelectBank(updated[0].id);
    }
    setDeleteConfirmId(null);
  };

  const startRename = (bank: Bank) => {
    setEditingId(bank.id);
    setEditName(bank.name);
  };

  const saveRename = (bankId: string) => {
    if (!editName.trim()) return;
    const updated = banks.map((b) =>
      b.id === bankId ? { ...b, name: editName.trim().toUpperCase() } : b
    );
    onUpdateBanks(updated);
    setEditingId(null);
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
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight font-mono">
                  Bank Manager ({banks.length})
                </h2>
                <p className="text-xs text-zinc-400 font-medium font-mono">
                  Organize 8-switch layouts for verses, choruses & solos
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

          {/* Content Body */}
          <div className="p-4 sm:p-5 space-y-4 text-sm">
          {/* Bank List */}
          <div className="space-y-2">
            {banks.map((bank) => {
              const isActive = bank.id === activeBankId;
              const isEditing = editingId === bank.id;
              const isDeleting = deleteConfirmId === bank.id;

              return (
                <div
                  key={bank.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#141926] border-blue-500/80 ring-1 ring-blue-500/30'
                      : 'bg-[#0a0d14] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Details */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: bank.colorTag || '#3B82F6',
                          boxShadow: isActive ? `0 0 8px ${bank.colorTag || '#3B82F6'}` : 'none',
                        }}
                      />

                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#121620] border border-blue-500 rounded-lg px-2 py-1 text-xs text-zinc-100 font-bold w-full focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveRename(bank.id)}
                            className="p-1 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => onSelectBank(bank.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-100 uppercase tracking-tight truncate">
                              {bank.name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {bank.description || '8 Custom Footswitches'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startRename(bank)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          title="Rename Bank"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(bank)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          title="Duplicate Bank"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {banks.length > 1 && (
                          <button
                            onClick={() => setDeleteConfirmId(isDeleting ? null : bank.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Bank"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectBank(bank.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all ml-1 cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete Confirmation Bar */}
                  {isDeleting && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs animate-fade-in">
                      <span className="text-rose-400 font-semibold text-[11px]">Delete this bank?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(bank.id)}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-500"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Bank Form */}
          <form
            onSubmit={handleCreateBank}
            className="p-3.5 rounded-xl border border-dashed border-zinc-800 bg-[#07090e] space-y-3"
          >
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Bank
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full bg-[#121620] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 font-bold focus:outline-none focus:border-blue-500"
                  placeholder="e.g. ACOUSTIC"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  value={newBankDesc}
                  onChange={(e) => setNewBankDesc(e.target.value)}
                  className="w-full bg-[#121620] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Fingerpicking Shimmer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Color Tag</label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-5 h-5 rounded-full border transition-all cursor-pointer"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#ffffff' : 'transparent',
                      transform: selectedColor === color ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newBankName.trim()}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Bank
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#090b10] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
