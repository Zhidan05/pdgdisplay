"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface AudioState {
  preferredSoundEnabled: boolean;
  actualSoundEnabled: boolean;
  autoplayBlocked: boolean;
  volume: number;
  setPreferredSoundEnabled: (val: boolean) => void;
  setActualSoundEnabled: (val: boolean) => void;
  setAutoplayBlocked: (val: boolean) => void;
  setVolume: (val: number) => void;
  retryAudio: () => void;
  registerRetryCallback: (cb: () => void) => void;
}

const AudioContext = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [preferredSoundEnabled, setPreferredSoundEnabledState] = useState(true);
  const [actualSoundEnabled, setActualSoundEnabled] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rri-audio-enabled");
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferredSoundEnabledState(stored !== "false");
    }
    const storedVol = localStorage.getItem("rri-audio-volume");
    if (storedVol !== null) {
      setVolumeState(Number(storedVol) || 80);
    }
  }, []);

  const setPreferredSoundEnabled = useCallback((val: boolean) => {
    setPreferredSoundEnabledState(val);
    localStorage.setItem("rri-audio-enabled", String(val));
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    localStorage.setItem("rri-audio-volume", String(val));
  }, []);

  const retryAudio = useCallback(() => {
    if (retryCallback) {
      retryCallback();
    }
  }, [retryCallback]);

  const registerRetryCallback = useCallback((cb: () => void) => {
    setRetryCallback(() => cb);
  }, []);

  // Global user interaction listener to attempt one-time retry
  useEffect(() => {
    if (preferredSoundEnabled && !actualSoundEnabled) {
      const handleInteraction = () => {
        retryAudio();
        // Remove listener after first interaction attempt
        window.removeEventListener("pointerdown", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
      
      window.addEventListener("pointerdown", handleInteraction, { once: true });
      window.addEventListener("keydown", handleInteraction, { once: true });
      
      return () => {
        window.removeEventListener("pointerdown", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
    }
  }, [preferredSoundEnabled, actualSoundEnabled, retryAudio]);

  return (
    <AudioContext.Provider
      value={{
        preferredSoundEnabled,
        actualSoundEnabled,
        autoplayBlocked,
        volume,
        setPreferredSoundEnabled,
        setActualSoundEnabled,
        setAutoplayBlocked,
        setVolume,
        retryAudio,
        registerRetryCallback
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("Missing AudioProvider");
  return ctx;
}

export function useOptionalAudio() {
  return useContext(AudioContext);
}

