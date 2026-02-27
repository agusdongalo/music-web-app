import { create } from "zustand";

export type Track = {
  id: string;
  title: string;
  artistName?: string;
  audioUrl?: string;
  durationSec?: number;
  coverUrl?: string;
};

type RepeatMode = "off" | "one" | "all";

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  setTrack: (track: Track) => void;
  setQueue: (queue: Track[]) => void;
  playQueue: (queue: Track[], startIndex?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: "off",
  setTrack: (track) =>
    set((state) => {
      const existingIndex = state.queue.findIndex((item) => item.id === track.id);
      const currentIndex = existingIndex >= 0 ? existingIndex : 0;
      const queue =
        existingIndex >= 0 ? state.queue : [track];
      return {
        currentTrack: track,
        queue,
        currentIndex,
        currentTime: 0,
        duration: track.durationSec ?? 0,
      };
    }),
  setQueue: (queue) =>
    set((state) => ({
      queue,
      currentIndex: Math.min(state.currentIndex, Math.max(queue.length - 1, 0)),
    })),
  playQueue: (queue, startIndex = 0) =>
    set(() => {
      const safeIndex = Math.min(Math.max(startIndex, 0), queue.length - 1);
      const track = queue[safeIndex] ?? null;
      return {
        queue,
        currentIndex: safeIndex,
        currentTrack: track,
        currentTime: 0,
        duration: track?.durationSec ?? 0,
        isPlaying: Boolean(track),
      };
    }),
  nextTrack: () =>
    set((state) => {
      if (state.queue.length === 0) {
        return {};
      }
      let nextIndex = state.currentIndex + 1;
      if (state.shuffle && state.queue.length > 1) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
        if (nextIndex === state.currentIndex) {
          nextIndex = (nextIndex + 1) % state.queue.length;
        }
      }

      if (nextIndex >= state.queue.length) {
        if (state.repeat === "all") {
          nextIndex = 0;
        } else {
          return { isPlaying: false, currentTime: 0 };
        }
      }

      const track = state.queue[nextIndex];
      return {
        currentIndex: nextIndex,
        currentTrack: track,
        currentTime: 0,
        duration: track?.durationSec ?? 0,
        isPlaying: true,
      };
    }),
  prevTrack: () =>
    set((state) => {
      if (state.queue.length === 0) {
        return {};
      }
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeat === "all") {
          prevIndex = state.queue.length - 1;
        } else {
          return { currentTime: 0 };
        }
      }

      const track = state.queue[prevIndex];
      return {
        currentIndex: prevIndex,
        currentTrack: track,
        currentTime: 0,
        duration: track?.durationSec ?? 0,
        isPlaying: true,
      };
    }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  cycleRepeat: () =>
    set((state) => ({
      repeat:
        state.repeat === "off"
          ? "one"
          : state.repeat === "one"
          ? "all"
          : "off",
    })),
}));
