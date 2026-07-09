import { create } from 'zustand';
import { SECTOR_SETS, LIMITS, computeExposure, isBreach, type PairSeed, type Exposure } from './data';

type Side = 'long' | 'short';

interface PairState {
  /** 선택된 섹터 id (null = 빈 상태) */
  sector: string | null;
  /** 현재 페어 북 (비중은 mutable) */
  pairs: PairSeed[];
  /** 섹터 선택 → 페어 세트 로드 */
  loadSector: (id: string) => void;
  /** 슬라이더 즉시 반영 */
  setLeg: (index: number, side: Side, w: number) => void;
  /** 한 다리를 목표치까지 애니메이션(드래그 연출) */
  pushLeg: (index: number, side: Side, target: number) => void;
  /** 각 페어를 롱=숏으로 맞추고 단일종목 리밋 이내로 정규화(애니메이션) */
  autoBalance: () => void;
  /** 파생 노출 계산 (비리액티브) */
  exposure: () => Exposure;
  /** 리밋 위반 여부 (비리액티브) */
  breach: () => boolean;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** 재생/리셋 충돌 방지용 런 토큰 — 애니메이션 도중 취소 */
let runId = 0;

const clone = (seeds: PairSeed[]): PairSeed[] => seeds.map((p) => ({ ...p }));
const keyOf = (side: Side) => (side === 'long' ? 'longW' : 'shortW');

export const usePair = create<PairState>((set, get) => ({
  sector: null,
  pairs: [],

  loadSector: (id) => {
    runId++; // 진행 중 애니메이션 취소
    set({ sector: id, pairs: clone(SECTOR_SETS[id] ?? []) });
  },

  setLeg: (index, side, w) =>
    set({
      pairs: get().pairs.map((p, i) => (i === index ? { ...p, [keyOf(side)]: w } : p)),
    }),

  pushLeg: (index, side, target) => {
    const id = ++runId;
    const key = keyOf(side);
    const start = get().pairs[index]?.[key] ?? 0;
    const FRAMES = 7;
    void (async () => {
      for (let f = 1; f <= FRAMES; f++) {
        await sleep(70);
        if (id !== runId) return;
        const t = f / FRAMES;
        const w = start + (target - start) * t;
        set({ pairs: get().pairs.map((p, i) => (i === index ? { ...p, [key]: w } : p)) });
      }
    })();
  },

  autoBalance: () => {
    const id = ++runId;
    const start = get().pairs.map((p) => ({ l: p.longW, s: p.shortW }));
    // 각 페어를 (롱=숏=평균, 단일 리밋 이내)로 → net=0, single≤10
    const target = get().pairs.map((p) => {
      const avg = Math.min(LIMITS.single, (p.longW + p.shortW) / 2);
      return { l: avg, s: avg };
    });
    const FRAMES = 8;
    void (async () => {
      for (let f = 1; f <= FRAMES; f++) {
        await sleep(70);
        if (id !== runId) return;
        const t = f / FRAMES;
        set({
          pairs: get().pairs.map((p, i) => ({
            ...p,
            longW: start[i].l + (target[i].l - start[i].l) * t,
            shortW: start[i].s + (target[i].s - start[i].s) * t,
          })),
        });
      }
    })();
  },

  exposure: () => computeExposure(get().pairs),
  breach: () => isBreach(computeExposure(get().pairs)),

  reset: () => {
    runId++;
    set({ sector: null, pairs: [] });
  },
}));
