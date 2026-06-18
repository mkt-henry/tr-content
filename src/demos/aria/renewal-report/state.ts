import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { usePlaybackStore } from '../../../engine/playbackStore';
import { REPORT_SECTIONS, SOURCE_FILES, getRecipient, STR, type ReportSectionId } from './data';

export type Phase = 'sources' | 'report' | 'reportReady' | 'analyzing' | 'email' | 'done';
export type EmailStatus = 'idle' | 'streaming' | 'done' | 'sending' | 'sent';
export type SourcesStatus = 'idle' | 'loading' | 'ready';

interface ReportEmailState {
  phase: Phase;
  statusText: string;
  /** 보고서 근거로 선택된 자료 id 목록 */
  selectedSources: string[];
  /** 연동 소스 로딩 상태 */
  sourcesStatus: SourcesStatus;
  /** 현재까지 로드되어 화면에 등장한 파일 id */
  loadedSourceIds: string[];
  /** 순차적으로 공개되는 보고서 섹션 */
  sections: ReportSectionId[];
  /** 선택된 수신자 id */
  recipientId: string | null;
  /** AI 의도 분석 결과 공개 여부 (analyzing 중 로더→결과 전환) */
  analysisReady: boolean;
  /** 전달 이메일 모달 열림 여부 */
  modalOpen: boolean;
  emailSubject: string;
  emailBody: string;
  emailStatus: EmailStatus;

  /** 연동 소스에서 자료를 점진적으로 불러온다 (idle일 때만 동작) */
  loadSources: () => void;
  toggleSource: (id: string) => void;
  /** 선택 자료로 보고서 생성 → reportReady */
  generate: () => void;
  /** CTA → 전달 이메일 모달 오픈 */
  openEmailModal: () => void;
  /** 모달 닫기 (진행 상태는 유지) */
  closeEmailModal: () => void;
  /** 수신자 선택 → 의도 분석 → 맞춤 이메일 스트리밍 → done */
  selectRecipient: (id: string) => void;
  /** 검토 후 발송 → 발송 중 → 발송 완료 */
  send: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 재생 속도에 맞춰 스케일된 sleep. 자동재생에서 시나리오의 wait는 speed로 가속되는데(run.ts),
 * 로딩이 실시간이면 1.5x·2x에서 로드 완료 전에 클릭이 떨어진다. 같은 시계로 묶어 마진을 유지한다.
 * 수동 열람 시엔 speed가 1이라 정상 속도로 로드된다.
 */
const scaledSleep = (ms: number) => {
  const { speed } = usePlaybackStore.getState();
  return sleep(ms / (speed > 0 ? speed : 1));
};

/** reset()/재시작 시 증가시켜 진행 중인 시뮬레이션을 무효화 */
let runId = 0;

const initial = {
  phase: 'sources' as Phase,
  statusText: '',
  selectedSources: [] as string[],
  sourcesStatus: 'idle' as SourcesStatus,
  loadedSourceIds: [] as string[],
  sections: [] as ReportSectionId[],
  recipientId: null as string | null,
  analysisReady: false,
  modalOpen: false,
  emailSubject: '',
  emailBody: '',
  emailStatus: 'idle' as EmailStatus,
};

export const useRenewalReport = create<ReportEmailState>((set, get) => ({
  ...initial,

  toggleSource: (id) => {
    if (get().phase !== 'sources' || get().sourcesStatus !== 'ready') return;
    if (!get().loadedSourceIds.includes(id)) return;
    set((s) => ({
      selectedSources: s.selectedSources.includes(id)
        ? s.selectedSources.filter((x) => x !== id)
        : [...s.selectedSources, id],
    }));
  },

  loadSources: () => {
    if (get().sourcesStatus !== 'idle') return;
    const id = ++runId;
    set({ sourcesStatus: 'loading', loadedSourceIds: [] });
    void (async () => {
      for (const f of SOURCE_FILES) {
        await scaledSleep(280);
        if (id !== runId) return;
        set((s) => ({ loadedSourceIds: [...s.loadedSourceIds, f.id] }));
      }
      await scaledSleep(200);
      if (id !== runId) return;
      set({ sourcesStatus: 'ready' });
    })();
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
      modalOpen: false,
      emailSubject: '',
      emailBody: '',
      emailStatus: 'idle',
    });

    void (async () => {
      await sleep(750);
      if (id !== runId) return;
      set({ statusText: STR.statusReport[lang] });
      for (const sec of REPORT_SECTIONS) {
        await sleep(430);
        if (id !== runId) return;
        set((s) => ({ sections: [...s.sections, sec] }));
      }
      await sleep(550);
      if (id !== runId) return;
      set({ phase: 'reportReady', statusText: STR.statusPickRecipient[lang] });
    })();
  },

  openEmailModal: () => {
    const p = get().phase;
    if (p !== 'reportReady' && p !== 'analyzing' && p !== 'email' && p !== 'done') return;
    set({ modalOpen: true });
  },

  closeEmailModal: () => set({ modalOpen: false }),

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

  send: () => {
    // 초안이 완성(done)된 상태에서만 발송 가능
    if (get().emailStatus !== 'done') return;
    const id = ++runId;
    const lang = getLang();
    set({ emailStatus: 'sending', statusText: STR.statusSending[lang] });
    void (async () => {
      await sleep(950);
      if (id !== runId) return;
      set({ emailStatus: 'sent', statusText: STR.statusSent[lang] });
    })();
  },

  reset: () => {
    runId++;
    set(initial);
  },
}));
