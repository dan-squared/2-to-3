"use client";

import React, { useEffect } from 'react';
import Editor2D from '@/components/Editor2D';
import View3D from '@/components/View3D';
import PropertiesPanel from '@/components/PropertiesPanel';
import { useStore } from '@/store/useStore';
import { CornersOut, CornersIn, Blueprint, Sun, Moon, PlayCircle, StopCircle } from '@phosphor-icons/react';

export default function Home() {
  const { showEditor2D, setShowEditor2D, theme, setTheme, isPlaying, setIsPlaying, setPlayProgress } = useStore();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setPlayProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setPlayProgress(1);
    }
  };

  return (
    <main className={`w-full h-screen overflow-hidden relative font-sans selection:bg-blue-500/30 ${theme === 'dark' ? 'dark bg-zinc-950' : 'bg-zinc-50'}`}>
      {/* 3D View Engine goes FULL screen */}
      <section className="absolute inset-0 z-0 bg-transparent">
        <View3D />
      </section>

      {/* Floating Top Controls */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={() => setShowEditor2D(!showEditor2D)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 text-sm font-medium tracking-tight rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all"
        >
          {showEditor2D ? <CornersIn weight="bold" size={16} /> : <Blueprint weight="bold" size={16} />}
          {showEditor2D ? 'Close Plan' : 'Plan View'}
        </button>
        <button
          onClick={handlePlayToggle}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-tight rounded-xl border backdrop-blur-xl shadow-lg hover:scale-105 active:scale-95 transition-all ${
            isPlaying 
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-900/50 hover:bg-red-500/20' 
              : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          {isPlaying ? <StopCircle weight="fill" size={16} /> : <PlayCircle weight="fill" size={16} />}
          {isPlaying ? 'Stop Growth' : 'Preview Growth'}
        </button>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-3 py-2.5 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 text-sm font-medium tracking-tight rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          title="Toggle Fullscreen"
        >
          <CornersOut weight="bold" size={16} />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 px-3 py-2.5 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 text-sm font-medium tracking-tight rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun weight="bold" size={16} /> : <Moon weight="fill" size={16} />}
        </button>
      </div>

      {/* Floating 2D Editor Panel (Plan View) */}
      <div 
        className={`absolute top-20 left-4 bottom-4 w-[400px] bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col z-10 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-left ${
          showEditor2D ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[110%] opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex-1 relative">
          <Editor2D />
        </div>
      </div>

      {/* Element Properties */}
      <PropertiesPanel />
    </main>
  );
}
