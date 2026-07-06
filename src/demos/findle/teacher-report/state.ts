import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { CLASS, findStudent, REPORT_SUMMARY, STR } from './data';

export type Phase = 'idle' | 'analyzing' | 'writing' | 'done';
export type DispatchPhase = 'sending' | 'done';

/** 하단 내레이션 흐름 단계 (전진 전용) */
export type FlowStep = 'overview' | 'report' | 'send' | 'student';
const FLOW_ORDER: FlowStep[] = ['overview', 'report', 'send', 'student'];
/** 뒤로 가지 않도록 더 앞선 단계로만 전진 */
const ahead = (cur: FlowStep, next: FlowStep): FlowStep =>
  FLOW_ORDER.indexOf(next) > FLOW_ORDER.indexOf(cur) ? next : cur;

interface State {
  /** 하단 내레이션 흐름 단계 */
  flow: FlowStep;
  // 반 리포트
  phase: Phase;
  statusText: string;
  reportText: string; // 스트리밍 누적
  sectionsReady: boolean;

  // 학생 리포트 모달
  selectedStudent: string | null;
  coachPhase: Phase;
  coachStatus: string;
  coachText: string; // 코칭 스트리밍 누적

  // 자동 발송 모달
  dispatchOpen: boolean;
  dispatchPhase: DispatchPhase;
  sentCount: number;

  // 토스트
  notice: string | null;

  generate: () => void;
  openStudent: (name: string) => void;
  closeStudent: () => void;
  startDispatch: () => void;
  closeDispatch: () => void;
  notify: (msg: string) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0; // 반 리포트 스트리밍 세대
let coachId = 0; // 코칭 스트리밍 세대
let dispatchId = 0; // 발송 시퀀스 세대
let noticeId = 0; // 토스트 세대

const base = {
  flow: 'overview' as FlowStep,
  phase: 'idle' as Phase,
  statusText: '',
  reportText: '',
  sectionsReady: false,
  selectedStudent: null as string | null,
  coachPhase: 'idle' as Phase,
  coachStatus: '',
  coachText: '',
  dispatchOpen: false,
  dispatchPhase: 'sending' as DispatchPhase,
  sentCount: 0,
  notice: null as string | null,
};

/** 텍스트를 청크 단위로 setter에 흘려보낸다 (LLM 스트리밍 시늉) */
async function stream(text: string, alive: () => boolean, append: (chunk: string) => void) {
  let i = 0;
  while (i < text.length) {
    if (!alive()) return;
    const size = 2 + Math.floor(Math.random() * 3);
    append(text.slice(i, i + size));
    i += size;
    await sleep(20);
  }
}

export const useTeacherReport = create<State>((set, get) => ({
  ...base,

  generate: () => {
    if (get().phase === 'analyzing' || get().phase === 'writing') return;
    const id = ++runId;
    const lang = getLang();
    set((s) => ({ flow: ahead(s.flow, 'report'), phase: 'analyzing', statusText: STR.statusAnalyzing[lang], reportText: '', sectionsReady: false }));
    void (async () => {
      await sleep(1200);
      if (id !== runId) return;
      set({ phase: 'writing', statusText: STR.statusWriting[lang] });
      await stream(REPORT_SUMMARY[lang], () => id === runId, (chunk) =>
        set((s) => ({ reportText: s.reportText + chunk })),
      );
      if (id !== runId) return;
      await sleep(300);
      set({ sectionsReady: true });
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  openStudent: (name) => {
    const student = findStudent(name);
    if (!student) return;
    const id = ++coachId;
    const lang = getLang();
    set((s) => ({ flow: ahead(s.flow, 'student'), selectedStudent: name, coachPhase: 'analyzing', coachStatus: STR.statusCoaching[lang], coachText: '' }));
    void (async () => {
      await sleep(900);
      if (id !== coachId) return;
      set({ coachPhase: 'writing' });
      await stream(student.coaching[lang], () => id === coachId, (chunk) =>
        set((s) => ({ coachText: s.coachText + chunk })),
      );
      if (id !== coachId) return;
      set({ coachPhase: 'done' });
    })();
  },

  closeStudent: () => {
    coachId++;
    set({ selectedStudent: null, coachPhase: 'idle', coachStatus: '', coachText: '' });
  },

  startDispatch: () => {
    const id = ++dispatchId;
    set((s) => ({ flow: ahead(s.flow, 'send'), dispatchOpen: true, dispatchPhase: 'sending', sentCount: 0 }));
    void (async () => {
      await sleep(600);
      for (let n = 1; n <= CLASS.students; n++) {
        if (id !== dispatchId) return;
        set({ sentCount: n });
        await sleep(420);
      }
      if (id !== dispatchId) return;
      set({ dispatchPhase: 'done' });
    })();
  },

  closeDispatch: () => {
    dispatchId++;
    set({ dispatchOpen: false });
  },

  notify: (msg) => {
    const id = ++noticeId;
    set({ notice: msg });
    void (async () => {
      await sleep(2200);
      if (id === noticeId) set({ notice: null });
    })();
  },

  reset: () => {
    runId++;
    coachId++;
    dispatchId++;
    noticeId++;
    set(base);
  },
}));
