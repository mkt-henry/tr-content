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
  /** 자동 재생 속도 배수 (1 = 기본). delay가 이 값으로 시간을 가속/감속한다 */
  speed: number;
  setStatus: (status: PlaybackStatus) => void;
  setCursor: (patch: Partial<CursorState>) => void;
  setSpeed: (speed: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  status: 'idle',
  cursor: { x: 0, y: 0, visible: false, pressed: false },
  speed: 1,
  setStatus: (status) => set({ status }),
  setCursor: (patch) => set((s) => ({ cursor: { ...s.cursor, ...patch } })),
  setSpeed: (speed) => set({ speed }),
}));
