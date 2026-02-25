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
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  setTrack: (track: Track) => void;
  setQueue: (queue: Track[]) => void;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  progress: 0,
  volume: 0.8,
  shuffle: false,
  repeat: "off",
  setTrack: (track) => set({ currentTrack: track }),
  setQueue: (queue) => set({ queue }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
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
