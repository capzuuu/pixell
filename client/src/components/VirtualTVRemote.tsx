import React, { useState } from 'react';
import {
  Tv,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Undo2,
  Home,
  Search,
  Bookmark,
  Play,
  Pause,
  Maximize2,
  X,
  Volume2,
  Volume1,
  VolumeX,
  Sliders,
  Power
} from 'lucide-react';
import { useTVRemote } from '../store/TVRemoteContext';

export const VirtualTVRemote: React.FC = () => {
  const {
    isTVMode,
    toggleTVMode,
    isVirtualRemoteOpen,
    toggleVirtualRemote,
    triggerRemoteKey,
    hudMessage,
  } = useTVRemote();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  return (
    <>
      {/* HUD Floating Toast on Smart TV action */}
      {hudMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-black/90 text-white rounded-full border border-red-500/40 shadow-2xl backdrop-blur-md">
            {hudMessage.icon && <span className="text-xl">{hudMessage.icon}</span>}
            <span className="text-sm font-semibold tracking-wide">{hudMessage.text}</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2">
        <button
          onClick={toggleVirtualRemote}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-2xl transition-all duration-300 border ${
            isTVMode
              ? 'bg-[#E50914] text-white border-red-400/50 shadow-red-600/30'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-700/60 backdrop-blur-md'
          } hover:scale-105 active:scale-95`}
          title="Smart TV Remote Control"
        >
          <Tv className={`w-4 h-4 ${isTVMode ? 'animate-pulse text-white' : 'text-zinc-300'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
            {isTVMode ? 'TV Mode Active' : 'Remote'}
          </span>
        </button>
      </div>

      {/* On-Screen Smart Remote Overlay */}
      {isVirtualRemoteOpen && (
        <div className="fixed bottom-20 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-200">
          <div className="w-72 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black rounded-3xl border border-zinc-800 shadow-2xl shadow-black/90 p-4 text-white select-none backdrop-blur-xl">
            
            {/* Remote Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#E50914]" />
                <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase">
                  Pixell Remote
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTVMode}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase transition-colors ${
                    isTVMode
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                  }`}
                  title="Toggle 10ft TV UI Mode"
                >
                  {isTVMode ? 'TV Mode: ON' : 'TV Mode: OFF'}
                </button>
                <button
                  onClick={toggleVirtualRemote}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => triggerRemoteKey('home')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white"
                title="Home"
              >
                <Home className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-medium">Home</span>
              </button>
              <button
                onClick={() => triggerRemoteKey('search')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white"
                title="Search"
              >
                <Search className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-medium">Search</span>
              </button>
              <button
                onClick={() => triggerRemoteKey('watchlist')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white"
                title="My List"
              >
                <Bookmark className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-medium">My List</span>
              </button>
              <button
                onClick={() => triggerRemoteKey('back')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white"
                title="Back"
              >
                <Undo2 className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-medium">Back</span>
              </button>
            </div>

            {/* Circular D-Pad Navigation Controller */}
            <div className="relative w-44 h-44 mx-auto my-2 rounded-full bg-zinc-900/90 border border-zinc-700/60 shadow-inner flex items-center justify-center">
              {/* Up */}
              <button
                onClick={() => triggerRemoteKey('up')}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-t-full transition-colors"
                title="Up"
              >
                <ChevronUp className="w-6 h-6" />
              </button>

              {/* Down */}
              <button
                onClick={() => triggerRemoteKey('down')}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-b-full transition-colors"
                title="Down"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              {/* Left */}
              <button
                onClick={() => triggerRemoteKey('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-l-full transition-colors"
                title="Left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Right */}
              <button
                onClick={() => triggerRemoteKey('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 rounded-r-full transition-colors"
                title="Right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Center OK Button */}
              <button
                onClick={() => triggerRemoteKey('ok')}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E50914] to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-400/40 transition-all"
                title="Select / OK"
              >
                OK
              </button>
            </div>

            {/* Media & Playback Controls */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
              <button
                onClick={() => triggerRemoteKey('playpause')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                onClick={() => triggerRemoteKey('fullscreen')}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold transition-all"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full</span>
              </button>

              <button
                onClick={() => triggerRemoteKey('back')}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold transition-all"
                title="Back"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Smart TV Remote Key Hints */}
            <div className="mt-3 text-[10px] text-zinc-500 text-center flex items-center justify-center gap-2">
              <span>Use Physical Remote or Keyboard Arrows</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
