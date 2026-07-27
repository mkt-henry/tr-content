import { createContext, useContext } from 'react';
import { cubicBezier } from 'framer-motion';

/**
 * 영상(Remotion) 렌더용 프레임 클록.
 *
 * 인앱 데모의 등장 애니메이션은 framer-motion 벽시계로 돈다. 영상 렌더는 프레임 단위로 시킹하므로
 * 벽시계 기반 애니메이션은 "프레임 N에서 어느 지점인가"가 렌더 속도에 따라 달라진다(비결정론).
 * 이 컨텍스트가 있으면 컴포넌트는 벽시계 대신 (frame - sinceFrame)으로 진행도를 계산한다.
 *
 * 제공 여부는 FeatureDefinition.videoStateKey opt-in에 달려 있다 — 없으면 null이라
 * 기존 데모/인앱 동작은 그대로다.
 */
export interface VideoClock {
  /** 현재 렌더 프레임 */
  frame: number;
  fps: number;
  /** 데모 store 상태가 마지막으로 바뀐 프레임 — 등장 애니메이션의 기준점(= 인앱의 "마운트 순간") */
  sinceFrame: number;
}

export const VideoClockContext = createContext<VideoClock | null>(null);

/** 영상 렌더 중이고 프레임 기반 애니메이션을 써야 하면 clock, 인앱이면 null. */
export function useVideoClock(): VideoClock | null {
  return useContext(VideoClockContext);
}

/** 데모 등장 애니메이션 공통 이징 — framer-motion transition의 ease와 동일해야 한다. */
export const ENTRANCE_EASE = cubicBezier(0.22, 1, 0.36, 1);

/**
 * 등장 진행도 0~1(이징 적용). delay/duration은 초 단위로, 인앱 transition에 쓰는 값을 그대로 넘긴다.
 * 같은 값을 넘기면 인앱과 영상의 곡선이 일치한다.
 */
export function entranceProgress(clock: VideoClock, duration: number, delay = 0): number {
  if (duration <= 0) return 1;
  const t = (clock.frame - clock.sinceFrame) / clock.fps - delay;
  return ENTRANCE_EASE(Math.min(1, Math.max(0, t / duration)));
}
