'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { useUiStore } from '@/store/useUiStore';

// Zinnia flower aesthetic — pigment-layered wine-red field with concentric petal rings
// Particle layers repurposed from violet → lighter warm reds
const ArchivalCanvasMaterial = shaderMaterial(
  {
    uTime: 0,
    uScroll: 0,
    uVelocity: 0,
    uMobile: 0,
    uResolution: new THREE.Vector2(),
    uReduceMotion: 0,
    // Warm red particle colours (replaces violet palette)
    uColorViolet1: new THREE.Color('#DC4664'),  // warm mid-red
    uColorViolet2: new THREE.Color('#C82D4B'),  // deeper rose-red
    uColorViolet3: new THREE.Color('#F56E82'),  // bright warm pink
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    precision highp float;
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform float uMobile;
    uniform vec2 uResolution;
    uniform float uReduceMotion;
    uniform vec3 uColorViolet1;
    uniform vec3 uColorViolet2;
    uniform vec3 uColorViolet3;
    varying vec2 vUv;

    // --- Colour palette (pigment layers) ---
    // PV29 violet base
    vec3 PV29  = vec3(0.165, 0.047, 0.176);
    // PBk31 perylene black
    vec3 PBk31 = vec3(0.047, 0.031, 0.039);
    // PR177 anthraquinone red
    vec3 PR177 = vec3(0.769, 0.071, 0.176);

    // Zinnia petal colours
    vec3 zinnia_deep  = vec3(0.478, 0.094, 0.208);  // #7A1835
    vec3 zinnia_mid   = vec3(0.831, 0.282, 0.478);  // #D4487A
    vec3 zinnia_bloom = vec3(0.941, 0.471, 0.596);  // #F07898

    // --- Noise helpers ---
    float hash(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p  = p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    // --- Zinnia petal ring function ---
    float zinniaPetal(vec2 uv, float radius, float petal_count, float time_offset) {
      float angle      = atan(uv.y, uv.x);
      float dist       = length(uv);
      float petal_shape = cos(angle * petal_count + uTime * 0.08 + time_offset) * 0.12 + 0.88;
      float ring = smoothstep(radius * petal_shape + 0.04, radius * petal_shape, dist)
                 - smoothstep(radius * petal_shape - 0.08, radius * petal_shape - 0.12, dist);
      return ring * 0.7;
    }

    // Shared random for particle layers
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      // Centred, aspect-ratio-correct UV for the zinnia rings
      vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / min(uResolution.x, uResolution.y);

      // --- Pigment base layer (PV29 + PBk31 20% + PR177 73%) ---
      vec3 colour = PV29;
      colour = mix(colour, PBk31, 0.20);
      colour = mix(colour, PR177, 0.73);
      // Result: deep wine-red ~#3D0916

      // --- Organic noise field ---
      float t  = uTime * 0.04;
      vec2 q   = uv + vec2(fbm(uv + t), fbm(uv + vec2(1.7, 9.2) + t));
      float f  = fbm(q * 2.0 + t * 0.5);

      // --- Zinnia petal rings (concentric, slow-breathing) ---
      float ring1 = zinniaPetal(uv, 0.18, 8.0, 0.0);
      float ring2 = zinniaPetal(uv, 0.34, 8.0, 0.4);
      float ring3 = zinniaPetal(uv, 0.52, 8.0, 0.8);
      float ring4 = zinniaPetal(uv, 0.72, 8.0, 1.2);
      float ring5 = zinniaPetal(uv, 0.94, 8.0, 1.6);

      // --- Layer colours outward from centre ---
      colour = mix(colour, zinnia_deep,  ring1 * (0.5 + 0.3 * f));
      colour = mix(colour, zinnia_mid,   ring2 * (0.4 + 0.2 * f));
      colour = mix(colour, zinnia_bloom, ring3 * (0.30 + 0.15 * f));
      colour = mix(colour, zinnia_mid,   ring4 * 0.20);
      colour = mix(colour, zinnia_deep,  ring5 * 0.15);

      // --- Warm noise glow at centre ---
      float centre_glow = smoothstep(0.35, 0.0, length(uv));
      colour = mix(colour, zinnia_deep, centre_glow * 0.35 * (0.5 + 0.5 * sin(uTime * 0.3)));

      // --- Atmospheric noise overlay ---
      colour += (f - 0.5) * 0.04 * zinnia_bloom;

      // --- Vignette (keep structure) ---
      float dist_centre = length(uv * vec2(0.9, 1.1));
      float vignette    = 1.0 - smoothstep(0.3, 1.4, dist_centre);
      colour *= (0.55 + 0.45 * vignette);

      // --- Three-tier parallax particle sparkles (warm reds) ---
      float motionFactor = 1.0 - uReduceMotion;
      float scrollOffset = uScroll * 0.0015;

      // 0-1 UV for particles (aspect-corrected)
      vec2 normUv = vUv;
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

      vec2 pUv1   = normUv * aspect * 3.5;
      vec2 off1   = vec2(uTime * 0.008, uTime * 0.015 + scrollOffset * 0.15);
      float d1    = pow(random(pUv1 - off1), 110.0);
      colour     += uColorViolet1 * d1 * 0.012 * motionFactor;

      vec2 pUv2   = normUv * aspect * 2.2;
      vec2 off2   = vec2(uTime * 0.018, uTime * 0.035 + scrollOffset * 0.5);
      float d2    = pow(random(pUv2 - off2), 85.0);
      colour     += uColorViolet2 * d2 * 0.015 * motionFactor;

      vec2 pUv3   = normUv * aspect * 1.2;
      vec2 off3   = vec2(uTime * 0.025, uTime * 0.05 + scrollOffset * 1.0);
      float d3    = pow(random(pUv3 - off3), 55.0);
      colour     += uColorViolet3 * d3 * 0.01 * motionFactor;

      // --- Subtle film grain ---
      float grain = (hash(gl_FragCoord.xy + uTime * 0.1) - 0.5) * 0.018;
      colour     += grain;

      gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
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
    <div className="fixed inset-0 pointer-events-none bg-void" style={{ zIndex: 0 }}>
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
