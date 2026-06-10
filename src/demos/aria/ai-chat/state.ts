import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { FALLBACK, QA, SOURCE_STEPS, type Evidence } from './data';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  evidence?: Evidence[];
  source?: string;
}

interface ChatState {
  messages: ChatMessage[];
  input: string;
  thinking: boolean;
  /** 소스 문서(파이프라인 등록 첨부파일) 연결 상태 */
  sourcePhase: 'connecting' | 'ready';
  /** 연결 완료 단계 수 (0~SOURCE_STEPS.length) */
  sourceStep: number;
  setInput: (v: string) => void;
  /** 파이프라인 등록 첨부파일을 소스로 연결 — 불러오기 → 분석·인덱싱 → ready */
  connectSource: () => void;
  /** 질문 전송 — 자동/수동 공용. text 생략 시 현재 input 사용 */
  send: (text?: string) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;
let msgId = 0;

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  input: '',
  thinking: false,
  sourcePhase: 'connecting',
  sourceStep: 0,
  setInput: (input) => set({ input }),
  connectSource: () => {
    const id = ++runId;
    set({ sourcePhase: 'connecting', sourceStep: 0 });
    void (async () => {
      for (let s = 1; s <= SOURCE_STEPS.length; s++) {
        await sleep(900);
        if (id !== runId) return;
        set({ sourceStep: s });
      }
      if (id !== runId) return;
      await sleep(350);
      set({ sourcePhase: 'ready' });
    })();
  },
  send: (text) => {
    const question = (text ?? get().input).trim();
    if (!question || get().thinking) return;
    const id = ++runId;
    const userMsg: ChatMessage = { id: ++msgId, role: 'user', text: question };
    set((s) => ({ messages: [...s.messages, userMsg], input: '', thinking: true }));

    void (async () => {
      await sleep(1100);
      if (id !== runId) return;
      const lang = getLang();
      const item = QA.find((qa) => qa.question[lang] === question);
      const answer = item ? item.answer[lang] : FALLBACK[lang];
      const assistantId = ++msgId;
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
    set({ messages: [], input: '', thinking: false, sourcePhase: 'connecting', sourceStep: 0 });
  },
}));
