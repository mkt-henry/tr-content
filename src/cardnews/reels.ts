import type { AnySlide } from './types';

/** 릴스 프레임레이트 — 뷰어 <Player>와 Remotion 컴포지션이 함께 쓰는 단일 출처.
    remotion/meta.ts의 FPS(데모 영상용)와는 별개다(src → remotion 역방향 import 회피). */
export const REELS_FPS = 30;
/** 슬라이드 등장 전환 길이(프레임) */
export const TRANSITION_FRAMES = 12;

/** 슬라이드 타입별 기본 노출 시간(초) — 읽는 부하에 비례시킨다 */
const SECONDS: Record<string, number | undefined> = {
  'm-cover': 3,
  'm-call': 4,
  'm-narrative': 5,
  'm-data': 5,
  'm-tensions': 5,
  'm-plan': 4,
  'm-cta': 3,
  'm-twitter': 4,
};
const FALLBACK_SECONDS = 4;

export interface ReelsTiming {
  /** 슬라이드별 노출 프레임 수 */
  frames: number[];
  /** 슬라이드별 시작 프레임(누적) */
  offsets: number[];
  totalFrames: number;
}

/** 슬라이드 배열 → 프레임 타이밍. seconds로 슬라이드별 노출 시간을 덮어쓸 수 있다. */
export function reelsTiming(slides: AnySlide[], seconds?: number[]): ReelsTiming {
  if (seconds && seconds.length !== slides.length) {
    console.warn(`[cardnews:reels] seconds 길이(${seconds.length}) ≠ 슬라이드 수(${slides.length}) — 부족분은 타입별 기본값`);
  }
  const frames = slides.map((slide, i) => {
    const override = seconds?.[i];
    if (typeof override === 'number' && override > 0) return Math.round(override * REELS_FPS);
    const sec = SECONDS[slide.type];
    if (sec === undefined) {
      console.warn(`[cardnews:reels] 노출 시간 미등록 슬라이드 타입: ${slide.type} — ${FALLBACK_SECONDS}초 적용`);
      return FALLBACK_SECONDS * REELS_FPS;
    }
    return sec * REELS_FPS;
  });

  const offsets: number[] = [];
  let acc = 0;
  for (const f of frames) {
    offsets.push(acc);
    acc += f;
  }
  return { frames, offsets, totalFrames: acc };
}

/** 절대 프레임 → 현재 슬라이드 인덱스 + 그 슬라이드 내 경과 프레임. 범위 밖은 clamp. */
export function slideAtFrame(t: ReelsTiming, frame: number): { index: number; local: number } {
  if (t.frames.length === 0) return { index: -1, local: 0 };
  const clamped = Math.max(0, Math.min(frame, t.totalFrames - 1));
  let index = 0;
  for (let i = t.offsets.length - 1; i >= 0; i--) {
    if (clamped >= t.offsets[i]) {
      index = i;
      break;
    }
  }
  return { index, local: clamped - t.offsets[index] };
}
