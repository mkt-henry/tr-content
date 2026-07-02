import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { GROUPS, LOGS_ORCHESTRATE, LOGS_PARALLEL, FOCUS_SCRIPTS } from './data';

/** 추론 phase 진행 단계 */
export type Phase = 'idle' | 'routing' | 'working' | 'verifying' | 'done';

/** 워커(서브 에이전트) 단위 상태 */
export type WorkerStatus = 'idle' | 'working' | 'done';

/** 포커스 패널/그래프 카메라가 비추는 대상 */
export type FocusTarget =
  | { kind: 'agent'; groupId: string; subIndex: number }
  | { kind: 'stage'; stage: 'routing' | 'verifying' | 'synthesis' };

/** "groupId:subIndex" 형태의 워커 키 */
function workerKey(groupId: string, subIndex: number): string {
  return `${groupId}:${subIndex}`;
}

/** 전체 워커 키 목록 (그래프 노드 ↔ 상태 매핑용) */
export const ALL_WORKERS: string[] = GROUPS.flatMap((g) =>
  g.subs.map((_, i) => workerKey(g.id, i)),
);

interface AgentState {
  phase: Phase;
  /** 카메라가 지금 비추는 대상 (그래프 하이라이트 + 포커스 패널 공유) */
  focus: FocusTarget | null;
  /** 워커별 상태 맵 */
  workers: Record<string, WorkerStatus>;
  /** "48개" 카운터 표시 여부 (working 진입 시 켜져 CountUp 트리거) */
  countActive: boolean;
  /** 단계 로그 — 한 줄씩 stagger 추가 */
  logs: string[];
  /** 어느 시나리오(소구점)로 가동됐는지 — 로그 셋 선택 */
  variant: 'orchestrate' | 'parallel';
  start: (variant?: 'orchestrate' | 'parallel') => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const idleWorkers = (): Record<string, WorkerStatus> =>
  Object.fromEntries(ALL_WORKERS.map((k) => [k, 'idle']));

let runId = 0;

export const useAgents = create<AgentState>((set, get) => ({
  phase: 'idle',
  focus: null,
  workers: idleWorkers(),
  countActive: false,
  logs: [],
  variant: 'orchestrate',
  start: (variant = 'orchestrate') => {
    if (get().phase !== 'idle') return;
    const id = ++runId;
    const lang = getLang();
    const LOGS = variant === 'parallel' ? LOGS_PARALLEL : LOGS_ORCHESTRATE;
    const log = (i: number) => set((s) => ({ logs: [...s.logs, LOGS[i][lang]] }));

    set({ phase: 'routing', variant, logs: [], workers: idleWorkers(), countActive: false, focus: { kind: 'stage', stage: 'routing' } });

    void (async () => {
      // 1) routing — 질문 분해 + 라우팅
      await sleep(500);
      if (id !== runId) return;
      log(0);
      await sleep(900);
      if (id !== runId) return;
      log(1);
      await sleep(700);
      if (id !== runId) return;

      // 2) working — 그룹 순회: 그룹 전체 병렬 점등 + 대표 에이전트 클로즈업
      set({ phase: 'working', countActive: true });
      log(2);
      // parallel variant는 클로즈업을 짧게 스킵(처리 규모 강조), orchestrate는 충분히 읽힘
      const dwell = variant === 'parallel' ? 900 : 1400;
      for (const g of GROUPS) {
        if (id !== runId) return;
        const script = FOCUS_SCRIPTS.find((s) => s.groupId === g.id);
        // 그룹 전체를 동시에 working으로 (병렬성 강조)
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'working'])) },
          focus: script ? { kind: 'agent', groupId: g.id, subIndex: script.subIndex } : s.focus,
        }));
        await sleep(dwell);
        if (id !== runId) return;
        // 그룹 전체 완료
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'done'])) },
        }));
        await sleep(160);
      }
      if (id !== runId) return;
      log(3);
      await sleep(400);
      if (id !== runId) return;

      // 3) verifying — 크로스 검증
      set({ phase: 'verifying', focus: { kind: 'stage', stage: 'verifying' } });
      log(4);
      await sleep(950);
      if (id !== runId) return;
      log(5);
      await sleep(1000);
      if (id !== runId) return;

      // 4) done — 합성 → 인사이트 카드
      set({ phase: 'done', focus: { kind: 'stage', stage: 'synthesis' } });
      log(6);
    })();
  },
  reset: () => {
    runId++;
    set({ phase: 'idle', workers: idleWorkers(), countActive: false, logs: [], variant: 'orchestrate', focus: null });
  },
}));
