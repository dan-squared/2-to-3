import { create } from 'zustand';

export interface Shape {
  id: string;
  x: number;
  y: number; // Represents the 'z' axis in 3D (depth)
  width: number;
  depth: number; // depth refers to the height of the 2D bounding box
  height: number; // Actual extrusion height in 3D
  color?: string;
  textureStyle?: 'none' | 'horizontal' | 'vertical';
}

interface AppState {
  shapes: Shape[];
  selectedId: string | null;
  mode: 'draw' | 'select' | 'pan';
  showEditor2D: boolean;
  theme: 'dark' | 'light';
  glassmorphism: boolean;
  isPlaying: boolean;
  playProgress: number;
  setMode: (mode: 'draw' | 'select' | 'pan') => void;
  setShowEditor2D: (show: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setGlassmorphism: (val: boolean) => void;
  setIsPlaying: (val: boolean) => void;
  setPlayProgress: (val: number) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  removeShape: (id: string) => void;
  setSelected: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  shapes: [
    {
      id: '1',
      x: -50,
      y: -50,
      width: 100,
      depth: 100,
      height: 80,
      color: '#4a9eff',
      textureStyle: 'horizontal'
    }
  ],
  selectedId: null,
  mode: 'draw',
  showEditor2D: true,
  theme: 'dark',
  glassmorphism: true,
  isPlaying: false,
  playProgress: 1,
  setMode: (mode) => set({ mode }),
  setShowEditor2D: (show) => set({ showEditor2D: show }),
  setTheme: (theme) => set({ theme }),
  setGlassmorphism: (val) => set({ glassmorphism: val }),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setPlayProgress: (val) => set({ playProgress: val }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  removeShape: (id) => set((state) => ({ shapes: state.shapes.filter(s => s.id !== id) })),
  setSelected: (selectedId) => set({ selectedId })
}));
