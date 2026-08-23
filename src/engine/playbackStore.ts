import { create } from 'zustand';
import { CAMERA_ZOOM } from '../lib/cameraGeom';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'done';

interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  pressed: boolean;
}

/**
 * 영상 렌더 전용 — 카메라/커서/캡션의 "지금 값"을 프레임 F에서 직접 계산해 넘긴다.
 *
 * 인앱에서는 이 값들이 framer-motion 스프링과 requestAnimationFrame으로 벽시계에 맞춰 움직인다.
 * 그런데 영상은 프레임을 실시간과 무관한 속도로 넘기므로, 벽시계 애니메이션은 프레임 F에서
 * 어디쯤인지가 렌더 속도·시작 지점에 따라 달라진다(= 미리보기와 결과물이 어긋나는 원인).
 * frameLock이 있으면 Camera/FakeCursor/SpotlightCaption은 애니메이션을 끄고 이 값을 그대로 그린다.
 * null이면(인앱) 기존 스프링 동작 그대로.
 */
export interface FrameLock {
  /** 카메라 배율 — 줌 해제 구간은 1 */
  camScale: number;
  /** 카메라 transform-origin (카메라 레이어 로컬 px). null이면 지정하지 않음 */
  camOrigin: { x: number; y: number } | null;
  /** 클릭 펄스 링 확산 진행도 0~1. null이면 링을 그리지 않음 */
  pulse: number | null;
  /** 강조 캡션 등장 진행도 0~1 */
  caption: number;
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
  /** 영상 렌더 중에만 채워진다 — FrameLock 주석 참고. 인앱은 항상 null */
  frameLock: FrameLock | null;
  setFrameLock: (lock: FrameLock | null) => void;
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
  frameLock: null,
  setFrameLock: (frameLock) => set({ frameLock }),
}));
