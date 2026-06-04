import { create } from 'zustand';
import { CANDIDATES, EMAIL_SUBJECT, EMAIL_BODY } from './data';

export type MatchPhase = 'idle' | 'scoring' | 'ranked';
export type EmailStatus = 'idle' | 'streaming' | 'done';

interface MatchState {
  phase: MatchPhase;
  /** 점수 게이지가 공개된 후보 (카운트업 트리거) */
  revealed: Record<string, boolean>;
  /** true면 점수순 정렬 표시 (Framer layout 재정렬) */
  ranked: boolean;
  selectedId: string | null;
  emailSubject: string;
  emailBody: string;
  emailStatus: EmailStatus;
  /** 적합도 분석 시뮬레이션 — 자동/수동 공용 */
  analyze: () => void;
  /** 후보 선택 → 이메일 초안 스트리밍 */
  select: (id: string) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useMatch = create<MatchState>((set, get) => ({
  phase: 'idle',
  revealed: {},
  ranked: false,
  selectedId: null,
  emailSubject: '',
  emailBody: '',
  emailStatus: 'idle',
  analyze: () => {
    if (get().phase !== 'idle') return;
    const id = ++runId;
    void (async () => {
      set({ phase: 'scoring' });
      // 점수 높은 순으로 게이지 공개
      const ordered = [...CANDIDATES].sort((a, b) => b.score - a.score);
      for (const c of ordered) {
        await sleep(850);
        if (id !== runId) return;
        set((s) => ({ revealed: { ...s.revealed, [c.id]: true } }));
      }
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'ranked', ranked: true });
    })();
  },
  select: (selectedId) => {
    if (get().emailStatus === 'streaming') return;
    const id = ++runId;
    set({ selectedId, emailSubject: '', emailBody: '', emailStatus: 'streaming' });
    void (async () => {
      await sleep(700);
      // Subject 타이핑
      let acc = '';
      for (const ch of EMAIL_SUBJECT) {
        if (id !== runId) return;
        acc += ch;
        set({ emailSubject: acc });
        await sleep(14);
      }
      await sleep(350);
      // Body 청크 스트리밍
      let i = 0;
      while (i < EMAIL_BODY.length) {
        if (id !== runId) return;
        const size = 2 + Math.floor(Math.random() * 3);
        set((s) => ({ emailBody: s.emailBody + EMAIL_BODY.slice(i, i + size) }));
        i += size;
        await sleep(22);
      }
      if (id !== runId) return;
      set({ emailStatus: 'done' });
    })();
  },
  reset: () => {
    runId++;
    set({
      phase: 'idle',
      revealed: {},
      ranked: false,
      selectedId: null,
      emailSubject: '',
      emailBody: '',
      emailStatus: 'idle',
    });
  },
}));
