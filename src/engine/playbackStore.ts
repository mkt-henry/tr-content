import { create } from 'zustand';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'done';

interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  pressed: boolean;
}

interface PlaybackState {
  status: PlaybackStatus;
  cursor: CursorState;
  setStatus: (status: PlaybackStatus) => void;
  setCursor: (patch: Partial<CursorState>) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  status: 'idle',
  cursor: { x: 0, y: 0, visible: false, pressed: false },
  setStatus: (status) => set({ status }),
  setCursor: (patch) => set((s) => ({ cursor: { ...s.cursor, ...patch } })),
}));
