import React from 'react';
import { Tv, CornerDownLeft, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, X } from 'lucide-react';
import { useTVRemote } from '../store/TVRemoteContext';

export const TVRemoteGuide: React.FC = () => {
  const { isTVMode, toggleTVMode } = useTVRemote();

  if (!isTVMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9980] bg-black/85 backdrop-blur-md border-t border-red-600/40 text-zinc-300 py-1.5 px-4 pointer-events-auto transition-all animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        
        {/* Left: TV Mode Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30 text-[11px] uppercase tracking-wider">
            <Tv className="w-3 h-3 text-red-500" />
            <span>TV Remote Mode</span>
          </div>
        </div>

        {/* Center: D-pad Key Guide */}
        <div className="hidden sm:flex items-center gap-5 text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px]">
              ▲ ▼ ◀ ▶
            </span>
            <span>Navigate</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px]">
              OK / ENTER
            </span>
            <span>Select</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px]">
              BACK / ESC
            </span>
            <span>Return</span>
          </div>
        </div>

        {/* Right: Exit / Toggle */}
        <button
          onClick={toggleTVMode}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Exit TV Remote Mode"
        >
          <span>Exit TV Mode</span>
          <X className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
};
