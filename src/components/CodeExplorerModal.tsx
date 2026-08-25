import React, { useState } from 'react';
import { swiftSourceFiles, SwiftFileEntry } from '../data/swiftSourceFiles';
import JSZip from 'jszip';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
} from 'lucide-react';

interface CodeExplorerModalProps {
  onClose: () => void;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<SwiftFileEntry>(swiftSourceFiles[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const root = zip.folder('GuitarFootController');

      if (root) {
        swiftSourceFiles.forEach((file) => {
          root.file(file.path, file.content);
        });

        // Add README and logic guide
        root.file(
          'README.md',
          `# GuitarFootController\n\nNon-Xcode Standalone Swift & SwiftUI Wireless Foot Controller for iOS & Mac MIDI Bridge.\n\nRun:\n./build.sh mac-run\n`
        );
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GuitarFootController_Swift_Source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#090b10] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wide flex items-center gap-2">
                Standalone Swift Source Repository
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  NO XCODE REQUIRED
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Pure Swift Package Manager (SPM) architecture for iOS & macOS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Archiving ZIP...' : 'Download Full Project (ZIP)'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-Pane Body */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-72 border-r border-zinc-800/80 bg-[#090b10] p-3 overflow-y-auto space-y-3 shrink-0 custom-scrollbar overscroll-contain touch-pan-y">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block px-2">
              Swift Source Files ({swiftSourceFiles.length})
            </span>

            <div className="space-y-1">
              {swiftSourceFiles.map((file) => {
                const isSelected = file.path === selectedFile.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-mono text-xs flex items-center gap-2 transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#06080d] overflow-hidden">
            {/* File Path & Copy Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d1017] border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{selectedFile.path}</span>
                <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                  — {selectedFile.description}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/80"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Block */}
            <div className="flex-1 min-h-0 p-4 overflow-auto font-mono text-xs text-zinc-300 leading-relaxed select-text custom-scrollbar overscroll-contain touch-pan-y">
              <pre className="whitespace-pre">{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
