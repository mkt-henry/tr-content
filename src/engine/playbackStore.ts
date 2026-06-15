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
  /** 현재 강조 중인 data-demo-id (없으면 null) */
  spotlightId: string | null;
  /** 인터랙션 강조 토글. 기본 켬 */
  spotlightEnabled: boolean;
  setSpotlight: (id: string | null) => void;
  toggleSpotlight: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  status: 'idle',
  cursor: { x: 0, y: 0, visible: false, pressed: false },
  speed: 1,
  setStatus: (status) => set({ status }),
  setCursor: (patch) => set((s) => ({ cursor: { ...s.cursor, ...patch } })),
  setSpeed: (speed) => set({ speed }),
  spotlightId: null,
  spotlightEnabled: true,
  setSpotlight: (spotlightId) => set({ spotlightId }),
  toggleSpotlight: () => set((s) => ({ spotlightEnabled: !s.spotlightEnabled })),
}));
