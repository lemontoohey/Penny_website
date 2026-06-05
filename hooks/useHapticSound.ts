'use client';

import { useRef, useCallback, useEffect } from 'react';

export const useHapticSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!ctxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AudioContextClass();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  const stopArtworkAtmosphere = useCallback(() => {
    if (!ctxRef.current || !activeGainRef.current) return;
    const gainNode = activeGainRef.current;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);

    setTimeout(() => {
      gainNode.disconnect();
      activeGainRef.current = null;
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      stopArtworkAtmosphere();
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.suspend().then(() => {
          if (ctxRef.current && ctxRef.current.state !== 'closed') {
            ctxRef.current.close();
          }
        });
      }
    };
  }, [stopArtworkAtmosphere]);

  const playArtworkAtmosphere = useCallback((_colors: string[]) => {
    if (typeof window === 'undefined') return;
    initAudio();
    if (!ctxRef.current) return;

    stopArtworkAtmosphere();

    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    activeGainRef.current = masterGain;

    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.15, now + 0.8);
    masterGain.gain.setValueAtTime(0.15, now + 4.0);
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 6.0);

    const sineOsc = ctx.createOscillator();
    sineOsc.type = 'sine';
    sineOsc.frequency.setValueAtTime(40, now);

    const triangleOsc = ctx.createOscillator();
    triangleOsc.type = 'triangle';
    triangleOsc.frequency.setValueAtTime(42, now);

    sineOsc.connect(masterGain);
    triangleOsc.connect(masterGain);

    sineOsc.start(now);
    triangleOsc.start(now);

    const stopTime = now + 6.5;
    sineOsc.stop(stopTime);
    triangleOsc.stop(stopTime);

    setTimeout(() => {
      if (activeGainRef.current === masterGain) {
        masterGain.disconnect();
        activeGainRef.current = null;
      }
    }, 7000);
  }, [initAudio, stopArtworkAtmosphere]);

  return { playArtworkAtmosphere, stopArtworkAtmosphere };
};
