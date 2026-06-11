import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { REPORT_SECTIONS, SOURCES, getRecipient, STR, type ReportSectionId } from './data';

export type Phase = 'sources' | 'report' | 'reportReady' | 'analyzing' | 'email' | 'done';
export type EmailStatus = 'idle' | 'streaming' | 'done';

interface ReportEmailState {
  phase: Phase;
  statusText: string;
  /** 보고서 근거로 선택된 자료 id 목록 */
  selectedSources: string[];
  /** 순차적으로 공개되는 보고서 섹션 */
  sections: ReportSectionId[];
  /** 선택된 수신자 id */
  recipientId: string | null;
  /** AI 의도 분석 결과 공개 여부 (analyzing 중 로더→결과 전환) */
  analysisReady: boolean;
  emailSubject: string;
  emailBody: string;
  emailStatus: EmailStatus;

  toggleSource: (id: string) => void;
  /** 선택 자료로 보고서 생성 → reportReady */
  generate: () => void;
  /** 수신자 선택 → 의도 분석 → 맞춤 이메일 스트리밍 → done */
  selectRecipient: (id: string) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** reset()/재시작 시 증가시켜 진행 중인 시뮬레이션을 무효화 */
let runId = 0;

const defaultSources = SOURCES.filter((s) => s.defaultOn).map((s) => s.id);

const initial = {
  phase: 'sources' as Phase,
  statusText: '',
  selectedSources: defaultSources,
  sections: [] as ReportSectionId[],
  recipientId: null as string | null,
  analysisReady: false,
  emailSubject: '',
  emailBody: '',
  emailStatus: 'idle' as EmailStatus,
};

export const useRenewalReport = create<ReportEmailState>((set, get) => ({
  ...initial,

  toggleSource: (id) => {
    if (get().phase !== 'sources') return;
    set((s) => ({
      selectedSources: s.selectedSources.includes(id)
        ? s.selectedSources.filter((x) => x !== id)
        : [...s.selectedSources, id],
    }));
  },

  generate: () => {
    if (get().phase !== 'sources' && get().phase !== 'done') return;
    if (get().selectedSources.length === 0) return;
    const id = ++runId;
    const lang = getLang();
    set({
      phase: 'report',
      statusText: STR.statusAnalyzing[lang],
      sections: [],
      recipientId: null,
      analysisReady: false,
      emailSubject: '',
      emailBody: '',
      emailStatus: 'idle',
    });

    void (async () => {
      await sleep(800);
      if (id !== runId) return;
      set({ statusText: STR.statusReport[lang] });
      for (const sec of REPORT_SECTIONS) {
        await sleep(560);
        if (id !== runId) return;
        set((s) => ({ sections: [...s.sections, sec] }));
      }
      await sleep(600);
      if (id !== runId) return;
      set({ phase: 'reportReady', statusText: STR.statusPickRecipient[lang] });
    })();
  },

  selectRecipient: (recipientId) => {
    const p = get().phase;
    if (p === 'sources' || p === 'report') return;
    if (get().emailStatus === 'streaming') return;
    const recipient = getRecipient(recipientId);
    if (!recipient) return;
    const id = ++runId;
    const lang = getLang();
    set({
      recipientId,
      phase: 'analyzing',
      analysisReady: false,
      statusText: STR.statusAnalyzingIntent[lang],
      emailSubject: '',
      emailBody: '',
      emailStatus: 'idle',
    });

    void (async () => {
      // 의도 분석 (로더 → 결과)
      await sleep(1300);
      if (id !== runId) return;
      set({ analysisReady: true });
      await sleep(900);
      if (id !== runId) return;

      // 맞춤 이메일 초안 스트리밍
      set({ phase: 'email', emailStatus: 'streaming', statusText: STR.statusEmail[lang] });
      const subject = recipient.subject[lang];
      const body = recipient.body[lang];
      let acc = '';
      for (const ch of subject) {
        if (id !== runId) return;
        acc += ch;
        set({ emailSubject: acc });
        await sleep(14);
      }
      await sleep(300);
      let i = 0;
      while (i < body.length) {
        if (id !== runId) return;
        const size = 2 + Math.floor(Math.random() * 3);
        set((s) => ({ emailBody: s.emailBody + body.slice(i, i + size) }));
        i += size;
        await sleep(20);
      }
      if (id !== runId) return;
      set({ phase: 'done', emailStatus: 'done', statusText: STR.statusDone[lang] });
    })();
  },

  reset: () => {
    runId++;
    set(initial);
  },
}));
