import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { getLang } from '../i18n';
import { getPipeline, GLOBAL_FALLBACK, GLOBAL_QA, type Evidence } from './data';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  evidence?: Evidence[];
  source?: string;
}

export interface ChatStore {
  messages: ChatMessage[];
  input: string;
  thinking: boolean;
  /** 컨텍스트로 지정된 출처 파이프라인 id (없으면 null) */
  sourceId: string | null;
  /** "+" 버튼 팝오버 열림 여부 */
  menuOpen: boolean;
  setInput: (v: string) => void;
  /** "+" 버튼 토글 */
  toggleMenu: (open?: boolean) => void;
  /** 출처 지정 — "/"·"+" 공용. 슬래시 입력/메뉴 정리 */
  setSource: (id: string) => void;
  /** 지정된 출처 해제 */
  clearSource: () => void;
  /** 질문 전송 — 자동/수동 공용. text 생략 시 현재 input 사용 */
  send: (text?: string) => void;
  reset: () => void;
}

export type ChatStoreHook = UseBoundStore<StoreApi<ChatStore>>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 데모별 독립 채팅 store 생성 — UI는 공통, 초기 출처(defaultSourceId)만 주입 */
export function createChatStore(opts: { defaultSourceId: string | null }): ChatStoreHook {
  let runId = 0;
  let msgId = 0;

  return create<ChatStore>((set, get) => ({
    messages: [],
    input: '',
    thinking: false,
    sourceId: opts.defaultSourceId,
    menuOpen: false,
    setInput: (input) => set({ input }),
    toggleMenu: (open) => set((s) => ({ menuOpen: open ?? !s.menuOpen })),
    setSource: (id) => {
      if (!getPipeline(id)) return;
      set({ sourceId: id, menuOpen: false, input: '' });
    },
    clearSource: () => set({ sourceId: null }),
    send: (text) => {
      const raw = text ?? get().input;
      const question = raw.trim();
      // 슬래시 명령은 전송이 아니라 출처 선택으로 처리 — 무시
      if (!question || question.startsWith('/') || get().thinking) return;
      const id = ++runId;
      const userMsg: ChatMessage = { id: ++msgId, role: 'user', text: question };
      set((s) => ({ messages: [...s.messages, userMsg], input: '', thinking: true }));

      void (async () => {
        await sleep(1100);
        if (id !== runId) return;
        const lang = getLang();
        const pipeline = getPipeline(get().sourceId);
        const assistantId = ++msgId;

        // 출처 지정 시 해당 파이프라인, 미지정 시 전체(GLOBAL) 종합 기반
        const qaList = pipeline ? pipeline.qa : GLOBAL_QA;
        const fallback = pipeline ? pipeline.fallback : GLOBAL_FALLBACK;
        const item = qaList.find((qa) => qa.question[lang] === question);
        const answer = item ? item.answer[lang] : fallback[lang];
        set((s) => ({
          thinking: false,
          messages: [...s.messages, { id: assistantId, role: 'assistant', text: '', streaming: true }],
        }));
        // 청크 스트리밍
        let i = 0;
        while (i < answer.text.length) {
          if (id !== runId) return;
          const size = 2 + Math.floor(Math.random() * 3);
          const chunk = answer.text.slice(i, i + size);
          i += size;
          set((s) => ({
            messages: s.messages.map((m) => (m.id === assistantId ? { ...m, text: m.text + chunk } : m)),
          }));
          await sleep(28);
        }
        if (id !== runId) return;
        await sleep(250);
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId ? { ...m, streaming: false, evidence: answer.evidence, source: answer.source } : m,
          ),
        }));
      })();
    },
    reset: () => {
      runId++;
      set({ messages: [], input: '', thinking: false, sourceId: opts.defaultSourceId, menuOpen: false });
    },
  }));
}
