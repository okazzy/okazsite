'use client';

import { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import type { TrackModel } from '@/lib/models';
import { getLocalizedText } from '@/lib/models';

interface AudioState {
  currentTrack: TrackModel | null;
  queue: TrackModel[];
  queueIndex: number;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isLooping: boolean;
  isShuffled: boolean;
  volume: number;
}

interface AudioContextType extends AudioState {
  playTrack: (track: TrackModel, queue?: TrackModel[], locale?: string) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  showMiniPlayer: boolean;
  closeMiniPlayer: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    isLooping: false,
    isShuffled: false,
    volume: 1,
  });
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [locale, setLocale] = useState('ar');

  // Create audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onDurationChange = () => setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    const onPlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const onEnded = () => {
      if (!state.isLooping) {
        const nextIdx = state.queueIndex + 1;
        if (nextIdx < state.queue.length) {
          const next = state.queue[nextIdx];
          const url = getLocalizedText(next.audioUrl, locale);
          if (url) {
            audio.src = url;
            audio.play();
            setState(prev => ({ ...prev, currentTrack: next, queueIndex: nextIdx }));
          }
        } else {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.isLooping, state.queue, state.queueIndex, locale]);

  const playTrack = useCallback((track: TrackModel, queue?: TrackModel[], loc?: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentLocale = loc || locale;
    if (loc) setLocale(loc);
    const url = getLocalizedText(track.audioUrl, currentLocale);
    if (!url) return;

    audio.src = url;
    audio.volume = state.volume;
    audio.loop = state.isLooping;
    audio.play();

    const newQueue = queue || [track];
    const idx = newQueue.findIndex(t => t.trackId === track.trackId);

    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue: newQueue,
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
    }));
    setShowMiniPlayer(true);
  }, [locale, state.volume, state.isLooping]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => { audioRef.current?.play(); }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    setState(prev => ({ ...prev, currentTrack: null, isPlaying: false, currentTime: 0, duration: 0 }));
    setShowMiniPlayer(false);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration);
    }
  }, []);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - seconds, 0);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const nextIdx = state.queueIndex + 1;
    if (nextIdx < state.queue.length) {
      playTrack(state.queue[nextIdx], state.queue);
    }
  }, [state.queueIndex, state.queue, playTrack]);

  const previousTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = state.queueIndex - 1;
    if (prevIdx >= 0) {
      playTrack(state.queue[prevIdx], state.queue);
    }
  }, [state.queueIndex, state.queue, playTrack]);

  const toggleLoop = useCallback(() => {
    setState(prev => {
      const newLoop = !prev.isLooping;
      if (audioRef.current) audioRef.current.loop = newLoop;
      return { ...prev, isLooping: newLoop };
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => {
      if (!prev.isShuffled) {
        const current = prev.queue[prev.queueIndex];
        const remaining = prev.queue.filter((_, i) => i !== prev.queueIndex);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        return { ...prev, isShuffled: true, queue: [current, ...remaining], queueIndex: 0 };
      }
      return { ...prev, isShuffled: false };
    });
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState(prev => ({ ...prev, volume: vol }));
  }, []);

  const closeMiniPlayer = useCallback(() => {
    stop();
  }, [stop]);

  return (
    <AudioContext.Provider
      value={{
        ...state,
        playTrack,
        togglePlay,
        pause,
        resume,
        stop,
        seekTo,
        skipForward,
        skipBackward,
        nextTrack,
        previousTrack,
        toggleLoop,
        toggleShuffle,
        setVolume,
        showMiniPlayer,
        closeMiniPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
