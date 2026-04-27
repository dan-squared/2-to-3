"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Cursor, Square, Hand } from '@phosphor-icons/react';

export default function Editor2D() {
  const { shapes, mode, setMode, selectedId, setSelected, addShape, updateShape, theme } = useStore();
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanMap = useRef({ x: 0, y: 0 });

  const [dragShapeId, setDragShapeId] = useState<string | null>(null);
  const dragOffsetMap = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      const direction = e.deltaY > 0 ? -1 : 1;
      setZoom(z => Math.max(0.1, Math.min(10, z * Math.pow(zoomFactor, direction))));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
  
  // Theme derived colors
  const gridLineColor = theme === 'dark' ? '#27272a' : '#e5e7eb';
  
  const getCoords = (e: React.PointerEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    return {
      x: (e.clientX - rect.left - cx - pan.x) / zoom,
      y: (e.clientY - rect.top - cy - pan.y) / zoom
    };
  };

  const snap = (v: number) => Math.round(v / 10) * 10;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2 || mode === 'pan') {
      setIsPanning(true);
      lastPanMap.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    
    const coords = getCoords(e);
    
    if (mode === 'select') {
      if (!dragShapeId) {
        setSelected(null);
      }
      return;
    }
    
    if (mode === 'draw') {
      setIsDrawing(true);
      setStartPos(coords);
      setCurrentPos(coords);
      e.currentTarget.setPointerCapture(e.pointerId);
      setSelected(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanMap.current.x;
      const dy = e.clientY - lastPanMap.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanMap.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (dragShapeId && mode === 'select') {
      const coords = getCoords(e);
      const newX = snap(coords.x - dragOffsetMap.current.x);
      const newY = snap(coords.y - dragOffsetMap.current.y);
      updateShape(dragShapeId, { x: newX, y: newY });
      return;
    }
    
    if (!isDrawing) return;
    setCurrentPos(getCoords(e));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }

    if (dragShapeId) {
      setDragShapeId(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const sStartX = snap(startPos.x);
    const sStartY = snap(startPos.y);
    const sCurX = snap(currentPos.x);
    const sCurY = snap(currentPos.y);
    
    const x = Math.min(sStartX, sCurX);
    const y = Math.min(sStartY, sCurY);
    const width = Math.abs(sCurX - sStartX);
    const depth = Math.abs(sCurY - sStartY);
    
    if (width > 0 && depth > 0) {
      const newId = crypto.randomUUID();
      const lastColor = shapes.length > 0 ? shapes[shapes.length - 1].color : '#4a9eff';
      const lastTexture = shapes.length > 0 ? shapes[shapes.length - 1].textureStyle : 'horizontal';
      addShape({
        id: newId,
        x,
        y,
        width,
        depth,
        height: 50,
        color: lastColor,
        textureStyle: lastTexture
      });
      setSelected(newId);
      setMode('select');
    }
  };

  const snapStartX = snap(startPos.x);
  const snapStartY = snap(startPos.y);
  const snapCurX = snap(currentPos.x);
  const snapCurY = snap(currentPos.y);
  const drawX = Math.min(snapStartX, snapCurX);
  const drawY = Math.min(snapStartY, snapCurY);
  const drawW = Math.abs(snapCurX - snapStartX);
  const drawH = Math.abs(snapCurY - snapStartY);

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col">
      {/* 2D Toolbar */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <button 
          onClick={() => setMode('select')}
          className={`p-2 rounded-lg transition-colors ${mode === 'select' ? 'bg-blue-500 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white'}`}
          title="Select & Move (V)"
        >
          <Cursor weight={mode === 'select' ? 'fill' : 'bold'} size={20} />
        </button>
        <button 
          onClick={() => setMode('draw')}
          className={`p-2 rounded-lg transition-colors ${mode === 'draw' ? 'bg-blue-500 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white'}`}
          title="Draw Rectangle (R)"
        >
          <Square weight={mode === 'draw' ? 'fill' : 'bold'} size={20} />
        </button>
        <button 
          onClick={() => setMode('pan')}
          className={`p-2 rounded-lg transition-colors ${mode === 'pan' ? 'bg-blue-500 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white'}`}
          title="Pan Canvas (Space)"
        >
          <Hand weight={mode === 'pan' ? 'fill' : 'bold'} size={20} />
        </button>
      </div>

      <svg
        ref={svgRef}
        className={`w-full h-full touch-none ${mode === 'pan' ? 'cursor-grab' : (mode === 'draw' ? 'cursor-crosshair' : 'cursor-default')}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <defs>
          <pattern id="grid_pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            {/* Minor grid lines (every 10 units) */}
            <path d="M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30" fill="none" stroke={gridLineColor} strokeOpacity="0.25" strokeWidth="0.5"/>
            {/* Major grid lines (every 40 units) */}
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridLineColor} strokeOpacity="0.6" strokeWidth="1"/>
          </pattern>
        </defs>
        
        <g style={{ transform: `translate(calc(50% + ${pan.x}px), calc(50% + ${pan.y}px)) scale(${zoom})` }}>
          <rect x="-50000" y="-50000" width="100000" height="100000" fill="url(#grid_pattern)" />
          
          {shapes.map((shape) => {
            const isSelected = selectedId === shape.id;
            const color = shape.color || '#4a9eff';
            return (
              <g key={shape.id}>
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.depth}
                  fill={isSelected ? `${color}66` : `${color}22`}
                  stroke={isSelected ? (theme === 'dark' ? '#ffffff' : '#000000') : color}
                  strokeWidth={isSelected ? 3 / zoom : 1 / zoom}
                  className={mode === 'select' ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                  onPointerDown={(e) => {
                    if (mode === 'select') {
                      e.stopPropagation();
                      setSelected(shape.id);
                      setDragShapeId(shape.id);
                      const coords = getCoords(e);
                      dragOffsetMap.current = {
                        x: coords.x - shape.x,
                        y: coords.y - shape.y
                      };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }
                  }}
                />
              </g>
            )
          })}

          {isDrawing && mode === 'draw' && (
            <rect
              x={drawX}
              y={drawY}
              width={drawW}
              height={drawH}
              fill="rgba(74, 158, 255, 0.2)"
              stroke="#4a9eff"
              strokeWidth={2 / zoom}
              strokeDasharray="4 4"
            />
          )}
        </g>
      </svg>
    </div>
  );
}
