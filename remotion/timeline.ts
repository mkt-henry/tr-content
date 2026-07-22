import type { Scenario, Step, StepText } from '../src/engine/types';
import { CAMERA_ZOOM } from '../src/lib/cameraGeom';

/**
 * 시나리오(실시간 ms 기반)를 프레임 타임라인으로 변환한다.
 * run.ts의 타이밍을 그대로 프레임으로 환산 — 벽시계 없이 프레임 F의 상태를 순수 계산하기 위함.
 *
 * 각 스텝의 "동작 순간"(store를 바꾸는 run)과 커서 타깃/클릭 펄스 구간을 프레임으로 고정한다.
 * 커서의 부드러운 이동과 컴포넌트 전환은 framer-motion 스프링이 담당하므로, 여기서는
 * "언제 어느 타깃을 가리키고 언제 눌리는가"만 정한다.
 */

const MOVE_MS = 650; // run.ts: click/type의 커서 이동 고정값
const PRESS_MS = 160; // clickPulse pressed
const RELEASE_MS = 120; // clickPulse release

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
        e.spotlightSet = spotlightOf(step);
        break;
      case 'click': {
        const move = f(MOVE_MS);
        const press = f(PRESS_MS);
        const release = f(RELEASE_MS);
        span = move + press + release;
        e.cursorTarget = step.target;
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
        if (step.target) e.cursorTarget = step.target;
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
        e.spotlightSet = { id: null, scale: CAMERA_ZOOM, caption: null }; // run.ts: scroll 시작 시 줌 해제
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
  /** 클릭 펄스 여부 */
  pressed: boolean;
  /** 현재 강조(줌) 대상 data-demo-id (없으면 null) */
  spotlightId: string | null;
  /** 현재 줌 배율 */
  spotlightScale: number;
  /** 현재 강조 캡션 (없으면 null) */
  spotlightCaption: string | null;
}

/** 프레임 F의 상태를 타임라인에서 순수 계산한다 (부수효과 없음 — 반환된 것을 호출 측이 적용). */
export function computeFrameState(frame: number, timeline: Timeline): FrameState {
  const runs: Array<() => void> = [];
  const progressive: Array<{ apply: (s: string) => void; text: string }> = [];
  let cursorTarget: string | undefined;
  let pressed = false;
  let spotlightId: string | null = null;
  let spotlightScale = CAMERA_ZOOM;
  let spotlightCaption: string | null = null;

  for (const e of timeline.entries) {
    if (e.run && e.actionFrame != null && frame >= e.actionFrame) runs.push(e.run);

    // 강조 상태: setSpotlight를 부르는 스텝(정의된 spotlightSet)만 startFrame에서 상태를 갈아끼운다.
    // wait/do 등은 건드리지 않아 이전 상태가 유지된다 (run.ts와 동일).
    if (e.spotlightSet && frame >= e.startFrame) {
      spotlightId = e.spotlightSet.id;
      spotlightScale = e.spotlightSet.scale;
      spotlightCaption = e.spotlightSet.caption;
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
      cursorTarget = e.cursorTarget;
      pressed = e.pulseStart != null && e.pulseEnd != null && frame >= e.pulseStart && frame < e.pulseEnd;
    }
  }

  return { runs, progressive, cursorTarget, pressed, spotlightId, spotlightScale, spotlightCaption };
}
