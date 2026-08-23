import type { Scenario, Step, StepText } from '../src/engine/types';
import { CAMERA_ZOOM } from '../src/lib/cameraGeom.ts';

/**
 * 시나리오(실시간 ms 기반)를 프레임 타임라인으로 변환한다.
 * run.ts의 타이밍을 그대로 프레임으로 환산 — 벽시계 없이 프레임 F의 상태를 순수 계산하기 위함.
 *
 * 각 스텝의 "동작 순간"(store를 바꾸는 run)과 커서 타깃/클릭 펄스 구간을 프레임으로 고정한다.
 * 커서 위치와 카메라 줌은 벽시계 스프링에 맡기지 않는다 — 렌더 속도에 따라 프레임 F의 그림이
 * 달라지기 때문. 대신 "직전 값 / 바뀐 프레임 / 도착 프레임"을 함께 내어주고, DemoVideo가
 * 프레임 F에서의 값을 직접 보간한다.
 */

const MOVE_MS = 650; // run.ts: click/type의 커서 이동 고정값
const PRESS_MS = 160; // clickPulse pressed
const RELEASE_MS = 120; // clickPulse release

/**
 * 줌 전환에 쓰는 길이(ms). Camera의 스프링(stiffness 150 / damping 22 / mass 0.7, ζ≈1.07 과감쇠)이
 * 정착하는 데 걸리는 실측 시간에 맞췄다 — 인앱 스프링과 영상의 프레임 보간이 같은 속도로 보이게 한다.
 */
export const ZOOM_MS = 550;
/** 클릭 펄스 링이 퍼져 사라지는 길이(ms) — FakeCursor의 ring transition duration과 같아야 한다. */
export const PULSE_RING_MS = 450;

function textOf(t: StepText): string {
  return typeof t === 'function' ? t() : t;
}

/**
 * cursor/click/type 스텝의 강조 상태를 계산한다 — run.ts moveCursorTo와 동일 규칙.
 * zoom=true면 원점(spotlight ?? target)으로 줌인(zoomScale 배율), 아니면 줌 해제(id=null).
 */
function spotlightOf(
  step: Extract<Step, { kind: 'cursor' | 'click' | 'type' }>,
): { id: string | null; scale: number; caption: string | null } {
  if (!step.zoom) return { id: null, scale: CAMERA_ZOOM, caption: null };
  const target = 'target' in step ? step.target : undefined;
  const spotlight = 'spotlight' in step ? step.spotlight : undefined;
  const caption = 'caption' in step ? step.caption : undefined;
  return {
    id: spotlight ?? target ?? null,
    scale: step.zoomScale ?? CAMERA_ZOOM,
    caption: caption != null ? textOf(caption) : null,
  };
}

export interface TimelineEntry {
  step: Step;
  startFrame: number;
  endFrame: number;
  /** store를 바꾸는 run이 적용되는 프레임 (do=시작, click=이동+펄스 끝). 없으면 undefined */
  actionFrame?: number;
  run?: () => void;
  /** 커서가 가리킬 data-demo-id */
  cursorTarget?: string;
  /**
   * 커서 이동이 끝나는 프레임 — run.ts moveCursorTo의 ms에 해당. 이 스텝이 시작 프레임에서
   * 이전 타깃을 떠나 여기서 새 타깃에 도착한다. 프레임만으로 커서 위치를 보간하기 위해 필요하다.
   */
  cursorMoveEnd?: number;
  /** 클릭 펄스(pressed=true) 구간 [pulseStart, pulseEnd) */
  pulseStart?: number;
  pulseEnd?: number;
  /** type/stream 진행형 텍스트: 프레임별 부분 문자열을 store에 반영 */
  progressive?: { fromFrame: number; toFrame: number; full: string; apply: (s: string) => void };
  /**
   * 이 스텝이 startFrame에서 setSpotlight로 바꾸는 강조 상태 (run.ts moveCursorTo 대응).
   * id=null이면 줌 해제. 정의된 엔트리만 상태를 바꾸고, wait/do 등은 이전 상태를 유지한다.
   */
  spotlightSet?: { id: string | null; scale: number; caption: string | null };
  /**
   * 스크롤 컨테이너 이동 구간 — run.ts scrollContainer 대응.
   * 목적지(scrollHeight/자식 offset)는 DOM 측정이 필요하므로 여기선 "무엇을 어디로 몇 프레임 동안"만
   * 기록하고, 실제 scrollTop 계산은 렌더 측(DemoVideo)이 프레임마다 수행한다.
   */
  scroll?: { target: string; to?: 'top' | 'bottom'; toId?: string; fromFrame: number; toFrame: number };
}

export interface Timeline {
  entries: TimelineEntry[];
  total: number;
}

export function buildTimeline(scenario: Scenario, fps: number): Timeline {
  const f = (ms: number) => Math.round((ms / 1000) * fps);
  let t = 0;
  const entries: TimelineEntry[] = [];

  for (const step of scenario.steps) {
    const startFrame = t;
    const e: TimelineEntry = { step, startFrame, endFrame: t };
    let span = 0;

    switch (step.kind) {
      case 'do':
        span = 0;
        e.actionFrame = startFrame;
        e.run = step.run;
        break;
      case 'wait':
        span = f(step.ms);
        break;
      case 'waitFor':
        // 프레임 기반에선 조건 폴링 불가 → 타임아웃만큼 대기로 근사 (해당 데모엔 미사용)
        span = f(step.timeoutMs ?? 8000);
        break;
      case 'cursor':
        span = f(step.ms ?? MOVE_MS);
        e.cursorTarget = step.target;
        e.cursorMoveEnd = startFrame + span;
        e.spotlightSet = spotlightOf(step);
        break;
      case 'click': {
        const move = f(MOVE_MS);
        const press = f(PRESS_MS);
        const release = f(RELEASE_MS);
        span = move + press + release;
        e.cursorTarget = step.target;
        e.cursorMoveEnd = startFrame + move;
        e.pulseStart = startFrame + move;
        e.pulseEnd = startFrame + move + press;
        e.actionFrame = startFrame + move + press + release;
        e.run = step.run;
        e.spotlightSet = spotlightOf(step);
        break;
      }
      case 'type': {
        const pre = step.target ? f(MOVE_MS) + f(PRESS_MS) + f(RELEASE_MS) : 0;
        const full = textOf(step.text);
        const typeSpan = f([...full].length * (1000 / (step.cps ?? 16)));
        span = pre + typeSpan;
        if (step.target) {
          e.cursorTarget = step.target;
          e.cursorMoveEnd = startFrame + f(MOVE_MS);
        }
        // target 있는 type만 moveCursorTo를 호출 → 강조 상태를 바꾼다 (target 없으면 무변화)
        if (step.target) e.spotlightSet = spotlightOf(step);
        e.progressive = { fromFrame: startFrame + pre, toFrame: startFrame + pre + typeSpan, full, apply: step.set };
        break;
      }
      case 'stream': {
        const full = textOf(step.text);
        const streamSpan = f([...full].length * (1000 / (step.cps ?? 40)));
        span = streamSpan;
        // stream은 append 방식이나, 프레임 기반에선 매 프레임 전체를 리셋 후 부분 재구성하므로
        // apply를 "누적 대체"로 감싼다 — 호출 측에서 리셋 후 이 apply로 부분 문자열을 세팅.
        e.progressive = { fromFrame: startFrame, toFrame: startFrame + streamSpan, full, apply: (s) => step.append(s) };
        e.spotlightSet = { id: null, scale: CAMERA_ZOOM, caption: null }; // run.ts: stream 시작 시 줌 해제
        break;
      }
      case 'scroll':
        span = f(step.ms ?? 800);
        // run.ts: keepZoom이면 줌을 유지한 채(카메라 고정) 스크롤, 아니면 시작 시 줌 해제
        if (!step.keepZoom) e.spotlightSet = { id: null, scale: CAMERA_ZOOM, caption: null };
        e.scroll = {
          target: step.target,
          to: step.to,
          toId: step.toId,
          fromFrame: startFrame,
          toFrame: startFrame + span,
        };
        break;
    }

    e.endFrame = startFrame + span;
    entries.push(e);
    t = e.endFrame;
  }

  return { entries, total: t };
}

export interface FrameState {
  /** 이 프레임까지 적용해야 할 store 변경들 (순서대로) */
  runs: Array<() => void>;
  /** 진행형 텍스트 적용들 (리셋 후 순서대로) */
  progressive: Array<{ apply: (s: string) => void; text: string }>;
  /** 커서가 가리킬 타깃 (없으면 초기 위치 유지) */
  cursorTarget?: string;
  /** 직전에 가리키던 타깃 — 이 프레임의 커서 위치를 두 지점 사이 보간으로 정하기 위함 */
  cursorPrevTarget?: string;
  /** 현재 타깃으로 출발한 프레임 */
  cursorSinceFrame: number;
  /** 현재 타깃에 도착하는 프레임 (없으면 이동 구간이 아님) */
  cursorMoveEnd?: number;
  /** 클릭 펄스 여부 */
  pressed: boolean;
  /** 펄스가 시작된 프레임 — 링 확산 진행도 계산용. 펄스 중이 아니면 null */
  pulseSinceFrame: number | null;
  /** 현재 강조(줌) 대상 data-demo-id (없으면 null) */
  spotlightId: string | null;
  /** 현재 줌 배율 */
  spotlightScale: number;
  /** 현재 강조 캡션 (없으면 null) */
  spotlightCaption: string | null;
  /** 직전 강조 대상 — 줌 원점을 두 지점 사이 보간으로 옮기기 위함 */
  spotlightPrevId: string | null;
  /** 직전의 실효 배율(줌 없음이면 1) — 배율 보간의 시작값 */
  spotlightPrevScale: number;
  /** 현재 강조 상태로 바뀐 프레임 */
  spotlightSinceFrame: number;
  /**
   * 시나리오의 모든 scroll 스텝을 등장 순서대로, 이 프레임 기준 진행도(0~1, easeInOut 적용)와 함께.
   * 아직 시작 안 한 스텝은 progress=0, 끝난 스텝은 1. 호출 측이 순서대로 적용하면
   * "직전 스텝이 멈춘 위치 → 이번 목적지" 체인이 프레임만으로 결정된다(렌더 순서 무관).
   */
  scrolls: Array<{ target: string; to?: 'top' | 'bottom'; toId?: string; progress: number }>;
}

/** run.ts scrollOver와 동일한 이징 — 영상/인앱 스크롤 곡선을 일치시킨다. */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** 프레임 F의 상태를 타임라인에서 순수 계산한다 (부수효과 없음 — 반환된 것을 호출 측이 적용). */
export function computeFrameState(frame: number, timeline: Timeline): FrameState {
  const runs: Array<() => void> = [];
  const progressive: Array<{ apply: (s: string) => void; text: string }> = [];
  let cursorTarget: string | undefined;
  let cursorPrevTarget: string | undefined;
  let cursorSinceFrame = 0;
  let cursorMoveEnd: number | undefined;
  let pressed = false;
  let pulseSinceFrame: number | null = null;
  let spotlightId: string | null = null;
  let spotlightScale = CAMERA_ZOOM;
  let spotlightCaption: string | null = null;
  let spotlightPrevId: string | null = null;
  let spotlightPrevScale = 1; // 시작은 줌 없음 → 실효 배율 1
  let spotlightSinceFrame = 0;
  const scrolls: FrameState['scrolls'] = [];

  for (const e of timeline.entries) {
    if (e.scroll) {
      const { target, to, toId, fromFrame, toFrame } = e.scroll;
      const raw = toFrame > fromFrame ? (frame - fromFrame) / (toFrame - fromFrame) : frame >= fromFrame ? 1 : 0;
      scrolls.push({ target, to, toId, progress: easeInOut(Math.min(1, Math.max(0, raw))) });
    }

    if (e.run && e.actionFrame != null && frame >= e.actionFrame) runs.push(e.run);

    // 강조 상태: setSpotlight를 부르는 스텝(정의된 spotlightSet)만 startFrame에서 상태를 갈아끼운다.
    // wait/do 등은 건드리지 않아 이전 상태가 유지된다 (run.ts와 동일).
    if (e.spotlightSet && frame >= e.startFrame) {
      const next = e.spotlightSet;
      // 값이 실제로 바뀔 때만 기준점을 갱신한다 — 같은 상태를 다시 세팅하는 스텝이 줌 전환을
      // 처음부터 다시 시작하게 만들면 안 된다(인앱 스프링도 타깃이 같으면 움직이지 않는다).
      if (next.id !== spotlightId || next.scale !== spotlightScale) {
        spotlightPrevId = spotlightId;
        spotlightPrevScale = spotlightId ? spotlightScale : 1;
        spotlightSinceFrame = e.startFrame;
      }
      spotlightId = next.id;
      spotlightScale = next.scale;
      spotlightCaption = next.caption;
    }

    if (e.progressive) {
      const { fromFrame, toFrame, full, apply } = e.progressive;
      if (frame >= fromFrame) {
        const prog = toFrame > fromFrame ? Math.min(1, (frame - fromFrame) / (toFrame - fromFrame)) : 1;
        const chars = [...full];
        const n = Math.round(prog * chars.length);
        progressive.push({ apply, text: chars.slice(0, n).join('') });
      }
    }

    if (e.cursorTarget != null && frame >= e.startFrame) {
      // 타깃이 바뀔 때만 출발점·출발 프레임을 갱신한다(같은 요소를 연달아 가리키면 커서는 머문다).
      if (e.cursorTarget !== cursorTarget) {
        cursorPrevTarget = cursorTarget;
        cursorSinceFrame = e.startFrame;
        cursorMoveEnd = e.cursorMoveEnd;
      }
      cursorTarget = e.cursorTarget;
      pressed = e.pulseStart != null && e.pulseEnd != null && frame >= e.pulseStart && frame < e.pulseEnd;
      pulseSinceFrame = pressed ? (e.pulseStart ?? null) : null;
    }
  }

  return {
    runs,
    progressive,
    cursorTarget,
    cursorPrevTarget,
    cursorSinceFrame,
    cursorMoveEnd,
    pressed,
    pulseSinceFrame,
    spotlightId,
    spotlightScale,
    spotlightCaption,
    spotlightPrevId,
    spotlightPrevScale,
    spotlightSinceFrame,
    scrolls,
  };
}
