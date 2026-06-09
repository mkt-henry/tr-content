import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { GROUPS, LOGS_ORCHESTRATE, LOGS_PARALLEL } from './data';

/** 추론 phase 진행 단계 */
export type Phase = 'idle' | 'routing' | 'working' | 'verifying' | 'done';

/** 워커(서브 에이전트) 단위 상태 */
export type WorkerStatus = 'idle' | 'working' | 'done';

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

    set({ phase: 'routing', variant, logs: [], workers: idleWorkers(), countActive: false });

    void (async () => {
      // 1) routing — Orchestrator가 질문 분해 + 라우팅 (엣지 펄스)
      await sleep(500);
      if (id !== runId) return;
      log(0);
      await sleep(900);
      if (id !== runId) return;
      log(1);
      await sleep(700);
      if (id !== runId) return;

      // 2) working — 48 카운터 가동 + 워커 그룹 순차 가동 (그룹 내부는 병렬)
      set({ phase: 'working', countActive: true });
      log(2);
      for (const g of GROUPS) {
        if (id !== runId) return;
        // 그룹 전체를 동시에 working으로 (병렬성 강조)
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'working'])) },
        }));
        await sleep(620);
        if (id !== runId) return;
        // 그룹 전체 완료 체크
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'done'])) },
        }));
        await sleep(180);
      }
      if (id !== runId) return;
      log(3);
      await sleep(500);
      if (id !== runId) return;

      // 3) verifying — 에이전트 간 크로스 검증 라인
      set({ phase: 'verifying' });
      log(4);
      await sleep(950);
      if (id !== runId) return;
      log(5);
      await sleep(1000);
      if (id !== runId) return;

      // 4) done — 최종 인사이트 카드 등장
      set({ phase: 'done' });
      log(6);
    })();
  },
  reset: () => {
    runId++;
    set({ phase: 'idle', workers: idleWorkers(), countActive: false, logs: [], variant: 'orchestrate' });
  },
}));
