import { create } from 'zustand';
import { AD_DURATION_SEC, DAILY_MISSIONS, INITIAL_CLOCK_MIN, INITIAL_GOLD, TIMED_MISSIONS } from './data';

/** 시간제 미션 한 건의 런타임 상태 */
type TimedStatus = 'locked' | 'open' | 'progress' | 'done';

/** 화면 전환 — 미션 메인 / 리워디드 광고 */
type Screen = 'mission' | 'ad';

interface TimedRuntime {
  /** 현재 잠금/오픈/진행/완료 */
  status: TimedStatus;
  /** 진행도 (0~goal). 시간제 미션은 goal=5 고정(1유닛 5문제) */
  progress: number;
}

/** 데일리 미션 한 건의 런타임 상태 */
interface DailyRuntime {
  progress: number;
  claimed: boolean;
}

const DAILY_GOAL = 5;

interface MissionState {
  screen: Screen;
  gold: number;
  /** 골드 획득 직후 필 강조 애니메이션 */
  goldFlash: boolean;
  /** 데모용 가짜 시계 (자정 기준 분) */
  clockMin: number;
  /** 오늘 완료한 미션 수 (라이브 스탯용) */
  completedCount: number;

  /** 시간제 미션 런타임 (id → runtime) */
  timed: Record<string, TimedRuntime>;
  /** 현재 진행 중인 시간제 미션 id (광고/보상 대상) */
  activeTimedId: string | null;

  /** 데일리 미션 런타임 (id → runtime) */
  daily: Record<string, DailyRuntime>;

  /** 리워디드 광고 남은 초 */
  adRemaining: number;
  /** 광고 보상 대상 골드 */
  adReward: number;

  // ── 시간제(timed) 변형 액션 ──────────────────────────────
  /** 가짜 시계를 minutes만큼 전진 → 오픈 시간이 된 미션을 locked→open 으로 승격 */
  advanceClock: (minutes: number) => void;
  /** 오픈된 미션 클릭 → 진행(progress) 화면으로 */
  enterTimed: (id: string) => void;
  /** 진행도 1유닛(5/5)까지 한 번에 채움 (압축 연출) */
  fillTimed: (id: string) => void;
  /** '보상 받기' → 광고 화면으로 */
  startAd: (id: string) => void;
  /** 광고 카운트다운 1초 감소 */
  tickAd: () => void;
  /** 광고 시청 완료 → 골드 지급 + 미션 done + 미션 화면 복귀 */
  finishAd: () => void;

  // ── 데일리(daily) 변형 액션 ──────────────────────────────
  /** 데일리 미션 진행도를 amount만큼 누적 (목표 도달 시 정지) */
  progressDaily: (id: string, amount: number) => void;
  /** 데일리 미션 보상 수령 → 골드 지급 */
  claimDaily: (id: string) => void;

  reset: () => void;
}

/** 초기 시계 시각 기준으로 시간제 미션 런타임을 만든다 */
function initialTimed(clockMin: number): Record<string, TimedRuntime> {
  const hour = Math.floor(clockMin / 60);
  const out: Record<string, TimedRuntime> = {};
  for (const m of TIMED_MISSIONS) {
    const open = hour >= m.openHour && hour < m.closeHour;
    out[m.id] = { status: open ? 'open' : 'locked', progress: 0 };
  }
  return out;
}

function initialDaily(): Record<string, DailyRuntime> {
  const out: Record<string, DailyRuntime> = {};
  for (const m of DAILY_MISSIONS) out[m.id] = { progress: 0, claimed: false };
  return out;
}

/** reset 시 진행 중이던 setTimeout(골드 플래시 등)을 무효화하는 가드 */
let runId = 0;

export const useMissionEngine = create<MissionState>((set, get) => ({
  screen: 'mission',
  gold: INITIAL_GOLD,
  goldFlash: false,
  clockMin: INITIAL_CLOCK_MIN,
  completedCount: 0,
  timed: initialTimed(INITIAL_CLOCK_MIN),
  activeTimedId: null,
  daily: initialDaily(),
  adRemaining: AD_DURATION_SEC,
  adReward: 0,

  advanceClock: (minutes) => {
    set((s) => {
      const clockMin = Math.min(s.clockMin + minutes, 24 * 60 - 1);
      const hour = Math.floor(clockMin / 60);
      // 새로 오픈 시간에 진입한 locked 미션을 open 으로 승격
      const timed = { ...s.timed };
      for (const m of TIMED_MISSIONS) {
        const rt = timed[m.id];
        if (rt.status === 'locked' && hour >= m.openHour && hour < m.closeHour) {
          timed[m.id] = { ...rt, status: 'open' };
        }
      }
      return { clockMin, timed };
    });
  },

  enterTimed: (id) => {
    set((s) => {
      const rt = s.timed[id];
      if (!rt || rt.status !== 'open') return s;
      return {
        activeTimedId: id,
        timed: { ...s.timed, [id]: { ...rt, status: 'progress' } },
      };
    });
  },

  fillTimed: (id) => {
    set((s) => {
      const rt = s.timed[id];
      if (!rt) return s;
      return { timed: { ...s.timed, [id]: { ...rt, progress: 5 } } };
    });
  },

  startAd: (id) => {
    const m = TIMED_MISSIONS.find((x) => x.id === id);
    if (!m) return;
    set({ screen: 'ad', activeTimedId: id, adRemaining: AD_DURATION_SEC, adReward: m.reward });
  },

  tickAd: () => {
    set((s) => ({ adRemaining: Math.max(s.adRemaining - 1, 0) }));
  },

  finishAd: () => {
    const { activeTimedId, adReward } = get();
    const id = ++runId;
    set((s) => {
      const timed = activeTimedId
        ? { ...s.timed, [activeTimedId]: { ...s.timed[activeTimedId], status: 'done' as const } }
        : s.timed;
      return {
        screen: 'mission',
        gold: s.gold + adReward,
        goldFlash: true,
        completedCount: s.completedCount + 1,
        timed,
        activeTimedId: null,
      };
    });
    setTimeout(() => {
      if (id === runId) set({ goldFlash: false });
    }, 700);
  },

  progressDaily: (id, amount) => {
    set((s) => {
      const rt = s.daily[id];
      if (!rt) return s;
      const progress = Math.min(rt.progress + amount, DAILY_GOAL_FOR(id));
      return { daily: { ...s.daily, [id]: { ...rt, progress } } };
    });
  },

  claimDaily: (id) => {
    const m = DAILY_MISSIONS.find((x) => x.id === id);
    if (!m) return;
    const rt = get().daily[id];
    if (!rt || rt.claimed) return;
    const runIdLocal = ++runId;
    set((s) => ({
      gold: s.gold + m.reward,
      goldFlash: true,
      completedCount: s.completedCount + 1,
      daily: { ...s.daily, [id]: { ...s.daily[id], claimed: true } },
    }));
    setTimeout(() => {
      if (runIdLocal === runId) set({ goldFlash: false });
    }, 700);
  },

  reset: () => {
    runId++;
    set({
      screen: 'mission',
      gold: INITIAL_GOLD,
      goldFlash: false,
      clockMin: INITIAL_CLOCK_MIN,
      completedCount: 0,
      timed: initialTimed(INITIAL_CLOCK_MIN),
      activeTimedId: null,
      daily: initialDaily(),
      adRemaining: AD_DURATION_SEC,
      adReward: 0,
    });
  },
}));

/** 데일리 미션의 진행도 분모 (진행 바는 항상 5단계로 정규화해 표현) */
export const DAILY_PROGRESS_STEPS = DAILY_GOAL;

/** 미션별 목표치 (진행도 상한). 데모에선 5단계 정규화 */
function DAILY_GOAL_FOR(_id: string): number {
  return DAILY_GOAL;
}
