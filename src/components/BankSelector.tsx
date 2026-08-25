import React from 'react';
import { Bank, AppTheme } from '../types';
import { Layers, FolderPlus } from 'lucide-react';

interface BankSelectorProps {
  banks: Bank[];
  activeBankId: string;
  theme?: AppTheme;
  onSelectBank: (bankId: string) => void;
  onOpenBankManager: () => void;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  banks,
  activeBankId,
  theme = 'stage-night',
  onSelectBank,
}) => {
  const isLight = theme === 'studio-bright';

  return (
    <div
      id="bank-selector-bar"
      className={`flex items-center justify-between px-3 sm:px-4 md:px-6 py-1.5 border-b select-none transition-colors w-full ${
        isLight ? 'bg-slate-100/95 border-slate-300' : 'bg-[#0c0f16] border-zinc-800/80'
      }`}
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
        <span
          className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden xs:inline">BANKS:</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {banks.map((bank) => {
            const isSelected = bank.id === activeBankId;
            return (
              <button
                key={bank.id}
                id={`bank-btn-${bank.id}`}
                onClick={() => onSelectBank(bank.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold tracking-tight transition-all duration-150 flex items-center gap-1.5 border cursor-pointer shrink-0 active:scale-95 ${
                  isSelected
                    ? isLight
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                      : 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-md shadow-blue-500/15 ring-1 ring-blue-500/30'
                    : isLight
                      ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-transform"
                  style={{
                    backgroundColor: isSelected && isLight ? '#ffffff' : (bank.colorTag || '#3B82F6'),
                    boxShadow: isSelected ? `0 0 6px ${bank.colorTag || '#3B82F6'}` : 'none',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
                <span className="whitespace-nowrap">{bank.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
