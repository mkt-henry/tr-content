import { create } from 'zustand';
import { CAMERA_ZOOM } from '../lib/cameraGeom';

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
  /** 현재 표시할 액션 캡션 (없으면 null) */
  spotlightCaption: string | null;
  /** 현재 줌 배율 (활성 시 Camera가 적용). 스텝별 zoomScale 오버라이드용. 기본 CAMERA_ZOOM */
  spotlightScale: number;
  /** 인터랙션 강조 토글. 기본 켬 */
  spotlightEnabled: boolean;
  setSpotlight: (id: string | null, caption?: string | null, scale?: number) => void;
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
  spotlightCaption: null,
  spotlightScale: CAMERA_ZOOM,
  spotlightEnabled: true,
  setSpotlight: (spotlightId, spotlightCaption = null, spotlightScale = CAMERA_ZOOM) =>
    set({ spotlightId, spotlightCaption, spotlightScale }),
  toggleSpotlight: () => set((s) => ({ spotlightEnabled: !s.spotlightEnabled })),
}));
