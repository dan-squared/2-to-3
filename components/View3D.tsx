"use client";

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges, Grid } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore, Shape } from '../store/useStore';
import * as THREE from 'three';

let baseHorizTex: THREE.CanvasTexture | null = null;
let baseVertTex: THREE.CanvasTexture | null = null;

const initTextures = () => {
  if (typeof document === 'undefined' || baseHorizTex) return;
  
  let c = document.createElement('canvas'); c.width = 16; c.height = 16;
  let ctx = c.getContext('2d')!;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, 16, 1.5);
  baseHorizTex = new THREE.CanvasTexture(c);
  baseHorizTex.wrapS = baseHorizTex.wrapT = THREE.RepeatWrapping;
  baseHorizTex.minFilter = THREE.LinearMipmapLinearFilter;

  c = document.createElement('canvas'); c.width = 16; c.height = 16;
  ctx = c.getContext('2d')!;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, 1.5, 16);
  baseVertTex = new THREE.CanvasTexture(c);
  baseVertTex.wrapS = baseVertTex.wrapT = THREE.RepeatWrapping;
  baseVertTex.minFilter = THREE.LinearMipmapLinearFilter;
};

const Shape3D = ({ shape, isSelected, onSelect, theme, glassmorphism, playProgress }: { shape: Shape, isSelected: boolean, onSelect: () => void, theme: string, glassmorphism: boolean, playProgress: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = shape.color || "#4a9eff";

  initTextures();

  const activeBaseTex = shape.textureStyle === 'horizontal' ? baseHorizTex : shape.textureStyle === 'vertical' ? baseVertTex : null;

  const localTex = useMemo(() => {
    if (!activeBaseTex) return null;
    const t = activeBaseTex.clone();
    t.needsUpdate = true;
    return t;
  }, [activeBaseTex]);

  useFrame((state, delta) => {
    if (meshRef.current && groupRef.current) {
      const targetHeightTarget = Math.max(0.01, shape.height * playProgress);
      const currentHeight = THREE.MathUtils.damp(meshRef.current.scale.y, targetHeightTarget, 8, delta);
      meshRef.current.scale.y = currentHeight;
      meshRef.current.position.y = currentHeight / 2;

      const targetX = shape.x + shape.width / 2;
      const targetZ = shape.y + shape.depth / 2;
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 10, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 10, delta);

      if (localTex) {
         if (shape.textureStyle === 'horizontal') {
            localTex.repeat.set(1, currentHeight / 5);
         } else if (shape.textureStyle === 'vertical') {
            localTex.repeat.set(Math.max(shape.width, shape.depth) / 5, 1);
         }
      }
    }
  });

  const isDark = theme === 'dark';
  const blendMode = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
  
  const sideOpacity = isSelected ? 0.8 : 0.4;
  const topOpacity = isSelected ? 0.4 : 0.15;
  const edgeColor = isSelected ? (isDark ? "#ffffff" : "#000000") : color;
  const edgeOpacity = isDark ? 1.0 : 0.3; // Softer edges in light theme

  const Material = glassmorphism ? 'meshPhysicalMaterial' : 'meshStandardMaterial';
  
  const materialProps = {
    color,
    transparent: true,
    blending: blendMode,
    depthWrite: false,
    roughness: glassmorphism ? 0.1 : 0.2,
    metalness: glassmorphism ? 0.8 : 0.6,
    transmission: glassmorphism ? 0.9 : 0,
    ior: 1.5,
    thickness: 2,
    clearcoat: glassmorphism ? 1 : 0
  };

  return (
    <group 
      ref={groupRef}
      position={[shape.x + shape.width / 2, 0, shape.y + shape.depth / 2]}
    >
      <mesh
        ref={meshRef}
        scale={[1, 0.01, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <boxGeometry args={[shape.width, 1, shape.depth]} />
        
        {/* Right (0) */}
        <Material attach="material-0" {...materialProps} opacity={sideOpacity} map={localTex || undefined} />
        {/* Left (1) */}
        <Material attach="material-1" {...materialProps} opacity={sideOpacity} map={localTex || undefined} />
        {/* Top (2) */}
        <Material attach="material-2" {...materialProps} opacity={topOpacity} />
        {/* Bottom (3) */}
        <Material attach="material-3" {...materialProps} opacity={topOpacity} />
        {/* Front (4) */}
        <Material attach="material-4" {...materialProps} opacity={sideOpacity} map={localTex || undefined} />
        {/* Back (5) */}
        <Material attach="material-5" {...materialProps} opacity={sideOpacity} map={localTex || undefined} />

        <Edges
          linewidth={isSelected ? (isDark ? 2 : 1) : (isDark ? 1 : 0.5)}
          threshold={15}
          color={edgeColor}
          transparent={!isDark}
          opacity={edgeOpacity}
        />
      </mesh>
    </group>
  );
};

// Global Animation Controller
const AnimationController = () => {
  const { isPlaying, setIsPlaying, playProgress, setPlayProgress } = useStore();
  useFrame((state, delta) => {
    if (isPlaying) {
      if (playProgress < 1) {
        setPlayProgress(Math.min(1, playProgress + delta * 0.4));
      } else {
        setIsPlaying(false);
      }
    }
  });
  return null;
}

export default function View3D() {
  const { shapes, selectedId, setSelected, theme, glassmorphism, playProgress } = useStore();

  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full relative outline-none" style={{ backgroundColor: isDark ? '#050505' : '#f8fafc' }}>
      <Canvas
        camera={{ position: [-150, 150, 200], fov: 45 }}
        onPointerMissed={() => setSelected(null)}
        gl={{ powerPreference: "high-performance", antialias: false }}
      >
        <AnimationController />
        
        <ambientLight intensity={isDark ? 0.6 : 0.8} />
        <directionalLight position={[100, 200, 100]} intensity={isDark ? 1.5 : 1.0} />
        <directionalLight position={[-100, -200, -100]} intensity={isDark ? 0.2 : 0.5} />
        
        <Grid
          infiniteGrid
          fadeDistance={2000}
          cellColor={isDark ? "#222222" : "#e2e8f0"}
          sectionColor={isDark ? "#333333" : "#cbd5e1"}
          cellThickness={1}
          sectionThickness={1.5}
          position={[0, 0, 0]}
        />
        
        {shapes.map(shape => (
          <Shape3D
            key={shape.id}
            shape={shape}
            isSelected={selectedId === shape.id}
            onSelect={() => setSelected(shape.id)}
            theme={theme}
            glassmorphism={glassmorphism}
            playProgress={playProgress}
          />
        ))}

        {glassmorphism && isDark && (
          <EffectComposer disableNormalPass multisampling={4}>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} />
          </EffectComposer>
        )}

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
