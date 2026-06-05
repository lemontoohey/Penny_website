'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { useUiStore } from '@/store/useUiStore';

// Atmospheric void shader — wine-red, lightened base, boosted particles and ambient glow.
const ArchivalCanvasMaterial = shaderMaterial(
  {
    uTime: 0,
    uScroll: 0,
    uVelocity: 0,
    uMobile: 0,
    uResolution: new THREE.Vector2(),
    // Atmosphere — wine-red palette, lightened base (Fix 1)
    uColorBase:    new THREE.Color('#8B2035'),  // void mid-red (was #6B1428)
    uColorPaper:   new THREE.Color('#9e2642'),  // paper tooth highlight
    uColorPG7:     new THREE.Color('#2a0510'),  // near-black wine for band base
    uColorMagenta: new THREE.Color('#7A1835'),  // zinnia-deep for band/glow mix
    uColorGlow:    new THREE.Color('#D4487A'),  // zinnia-mid velocity glow
    uReduceMotion: 0,
    // Particle sparkles — warm reds
    uColorViolet1: new THREE.Color('#DC4664'),
    uColorViolet2: new THREE.Color('#C82D4B'),
    uColorViolet3: new THREE.Color('#F56E82'),
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    precision mediump float;
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform float uMobile;
    uniform vec2 uResolution;
    uniform vec3 uColorBase;
    uniform vec3 uColorPaper;
    uniform vec3 uColorPG7;
    uniform vec3 uColorMagenta;
    uniform vec3 uColorGlow;
    uniform float uReduceMotion;
    uniform vec3 uColorViolet1;
    uniform vec3 uColorViolet2;
    uniform vec3 uColorViolet3;
    varying vec2 vUv;

    float drawBand(float uvX, float xPos, float width, float blur) {
      float dist = abs(uvX - xPos);
      return smoothstep(width + blur, width, dist);
    }

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      float scrollOffset = uScroll * 0.0015;

      // 1. PAPER TOOTH — canvas texture base
      vec2 toothUV = uv * (uResolution.x / uResolution.y) * 600.0;
      float grainBase = random(toothUV);
      float toothPattern = smoothstep(0.45, 0.55, grainBase);
      vec3 finalColor = mix(uColorBase, uColorPaper, toothPattern * 0.25);

      // 2. BREATHING AMBIENT GLOW — atmospheric depth, no shapes
      float pulse      = 0.5 + 0.5 * sin(uTime * 0.4);
      float centerDist = length(vUv - 0.5) * 2.0;
      float ambientGlow = smoothstep(0.6, 0.0, centerDist);
      finalColor = mix(finalColor, uColorMagenta, ambientGlow * 0.55 * pulse * 0.5);

      // 3. CHROMATIC BAND + VELOCITY HALATION
      float posB = fract(0.5 + scrollOffset * 0.4);
      float halationOffset = uVelocity * 0.002;
      float bandR = drawBand(uv.x + halationOffset, posB, 0.015, 0.15);
      float bandG = drawBand(uv.x,                  posB, 0.015, 0.15);
      float bandB = drawBand(uv.x - halationOffset, posB, 0.015, 0.15);

      vec3 chromaticGrey  = mix(uColorPG7, uColorMagenta, 0.5);
      float barCenterMask = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
      float scrollLight   = smoothstep(0.1, 6.0, abs(uVelocity)) * barCenterMask;
      vec3 bandColor      = mix(chromaticGrey, uColorGlow, scrollLight * 0.6);
      float bandOpacity   = 0.10 + (scrollLight * 0.20);
      float topBottomMask = mix(1.0, barCenterMask, uMobile);
      finalColor += vec3(bandColor.r * bandR, bandColor.g * bandG, bandColor.b * bandB) * bandOpacity * topBottomMask;

      // 4. THREE-TIER PARALLAX SPARKLE PARTICLES (brighter than before)
      float motionFactor = 1.0 - uReduceMotion;

      vec2 pUv1    = uv * vec2(uResolution.x / uResolution.y, 1.0) * 3.5;
      vec2 offset1 = vec2(uTime * 0.008, uTime * 0.015 + scrollOffset * 0.15);
      float d1     = pow(random(pUv1 - offset1), 110.0);
      finalColor  += uColorViolet1 * d1 * 0.020 * motionFactor;

      vec2 pUv2    = uv * vec2(uResolution.x / uResolution.y, 1.0) * 2.2;
      vec2 offset2 = vec2(uTime * 0.018, uTime * 0.035 + scrollOffset * 0.5);
      float d2     = pow(random(pUv2 - offset2), 85.0);
      finalColor  += uColorViolet2 * d2 * 0.025 * motionFactor;

      vec2 pUv3    = uv * vec2(uResolution.x / uResolution.y, 1.0) * 1.2;
      vec2 offset3 = vec2(uTime * 0.025, uTime * 0.05 + scrollOffset * 1.0);
      float d3     = pow(random(pUv3 - offset3), 55.0);
      finalColor  += uColorViolet3 * d3 * 0.018 * motionFactor;

      // 5. SCREEN GRAIN
      float screenGrain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      finalColor += screenGrain * 0.008;

      // 6. VIGNETTE — lighter centre, gentle edge darkening
      float vigDist = length((vUv - 0.5) * vec2(0.9, 1.1)) * 2.0;
      float vignette = 1.0 - smoothstep(0.3, 1.4, vigDist);
      finalColor *= (0.72 + 0.28 * vignette);

      finalColor = min(finalColor, vec3(1.0));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ ArchivalCanvasMaterial });

const ShaderPlane = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const isCanvasPaused = useUiStore((state) => state.isCanvasPaused);
  const scrollVelocity = useUiStore((state) => state.scrollVelocity);
  const velocityTracker = useRef({ value: 0 });

  useFrame((state) => {
    if (materialRef.current && typeof window !== 'undefined') {
      materialRef.current.uniforms.uMobile.value = window.matchMedia('(max-width: 768px)').matches ? 1 : 0;
      materialRef.current.uniforms.uReduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0;
    }
    if (isCanvasPaused) return;

    velocityTracker.current.value += (scrollVelocity - velocityTracker.current.value) * 0.05;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScroll.value = window.scrollY;
      materialRef.current.uniforms.uVelocity.value = velocityTracker.current.value;
      materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* @ts-ignore */}
      <archivalCanvasMaterial ref={materialRef} depthWrite={false} />
    </mesh>
  );
};

export const CanvasBackground = React.memo(() => {
  const onCreated = useRef(({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), { capture: true });
    gl.domElement.addEventListener('webglcontextrestored', () => {}, { once: false });
  }).current;

  return (
    <div className="fixed inset-0 pointer-events-none bg-void" style={{ zIndex: 0, opacity: 1, mixBlendMode: 'normal' }}>
      <Canvas
        dpr={1}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        gl={{ antialias: false, powerPreference: 'default' }}
        onCreated={onCreated}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
});
CanvasBackground.displayName = 'CanvasBackground';
