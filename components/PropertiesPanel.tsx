"use client";

import React from 'react';
import { useStore } from '../store/useStore';
import { Trash, Cube, Palette, SlidersHorizontal, Sparkle } from '@phosphor-icons/react';

export default function PropertiesPanel() {
  const { shapes, selectedId, updateShape, removeShape, setSelected, theme, glassmorphism, setGlassmorphism } = useStore();

  const shape = shapes.find(s => s.id === selectedId);

  // Global settings when no shape is selected
  if (!shape) {
    return (
      <div className={`absolute bottom-6 right-6 w-[280px] backdrop-blur-2xl rounded-2xl border shadow-2xl z-50 p-4 transition-all ${theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200/50 text-zinc-900'}`}>
        <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${theme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200/50'}`}>
          <SlidersHorizontal weight="bold" className="text-zinc-400" />
          <h3 className="font-medium text-sm">Global Settings</h3>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Sparkle weight="fill" className={glassmorphism ? "text-blue-500" : "text-zinc-400"} />
            Glassmorphism & Glow
          </label>
          <button 
            onClick={() => setGlassmorphism(!glassmorphism)}
            className={`w-10 h-6 rounded-full transition-colors relative ${glassmorphism ? 'bg-blue-500' : (theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-300')}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${glassmorphism ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute bottom-6 right-6 w-80 backdrop-blur-2xl rounded-2xl border shadow-2xl z-50 p-5 transition-all ${theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200/50 text-zinc-900'}`}>
      <div className={`flex items-center justify-between mb-5 pb-4 border-b ${theme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200/50'}`}>
        <h3 className="font-medium flex items-center gap-2">
          <Cube weight="duotone" size={20} className="text-blue-500" />
          Extrusion Properties
        </h3>
        <button 
          onClick={() => {
            removeShape(shape.id);
            setSelected(null);
          }}
          className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-500 hover:text-red-600 hover:bg-red-50'}`}
          title="Delete Shape"
        >
          <Trash weight="bold" size={16} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Height (Y)</label>
            <span className={`text-xs font-mono font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>{shape.height}</span>
          </div>
          <input
            type="range"
            min="10"
            max="400"
            value={shape.height}
            onChange={(e) => updateShape(shape.id, { height: parseInt(e.target.value) })}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:shadow-[-400px_0_0_400px_#3b82f6]`}
          />
        </div>

        <div>
          <label className={`text-xs font-medium flex items-center gap-1.5 mb-2 block ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Palette weight="fill" size={14} /> Material Design
          </label>
          <div className="flex gap-2 items-center">
            <div className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border ${theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'}`}>
              <input
                type="color"
                value={shape.color || '#4a9eff'}
                onChange={(e) => updateShape(shape.id, { color: e.target.value })}
                className="absolute -inset-2 w-12 h-12 cursor-pointer"
              />
            </div>
            <select
              value={shape.textureStyle || 'none'}
              onChange={(e) => updateShape(shape.id, { textureStyle: e.target.value as 'none' | 'horizontal' | 'vertical' })}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition-all ${theme === 'dark' ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800 focus:border-blue-500' : 'bg-zinc-100/50 border border-zinc-200/50 text-zinc-800 hover:bg-zinc-100 focus:bg-zinc-100 focus:border-blue-500'}`}
            >
              <option value="none">Solid Fill</option>
              <option value="horizontal">Horizontal Grid</option>
              <option value="vertical">Vertical Grid</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-zinc-950/30 border-zinc-800/50' : 'bg-white/50 border-zinc-200/50'}`}>
            <label className={`text-[10px] font-semibold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Width</label>
            <input
              type="number"
              value={Math.round(shape.width)}
              onChange={(e) => updateShape(shape.id, { width: parseInt(e.target.value) || 10 })}
              className="w-full bg-transparent text-sm font-mono font-medium outline-none mt-0.5"
            />
          </div>
          <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-zinc-950/30 border-zinc-800/50' : 'bg-white/50 border-zinc-200/50'}`}>
            <label className={`text-[10px] font-semibold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Depth</label>
            <input
              type="number"
              value={Math.round(shape.depth)}
              onChange={(e) => updateShape(shape.id, { depth: parseInt(e.target.value) || 10 })}
              className="w-full bg-transparent text-sm font-mono font-medium outline-none mt-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
