import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { type ChatMessage } from '../alpha-chat/state';
import { QUESTION, GENERIC_ANSWER, ALPHA_ANSWER } from './data';

/** 좌측(범용 AI) 또는 우측(AlphaLenz) 한쪽 패널 상태 */
export interface VsSide {
  messages: ChatMessage[];
  thinking: boolean;
}

interface VsState {
  input: string;
  left: VsSide;   // 범용 AI
  right: VsSide;  // AlphaLenz
  setInput: (v: string) => void;
  /** 현재 input(또는 QUESTION 기본값)으로 양쪽 동시 전송 */
  start: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let runId = 0;
let msgId = 0;

const idleSide = (): VsSide => ({ messages: [], thinking: false });

export const useVs = create<VsState>((set, get) => ({
  input: '',
  left: idleSide(),
  right: idleSide(),

  setInput: (input) => set({ input }),

  start: () => {
    // 이미 진행 중이면 무시
    if (get().left.thinking || get().right.thinking) return;

    const lang = getLang(); // 전송 시점에 언어 평가
    const question = get().input.trim() || QUESTION[lang];
    const id = ++runId;

    // 양쪽에 user 메시지 동시 추가 + thinking 켜기
    const userMsgLeft: ChatMessage = { id: ++msgId, role: 'user', text: question };
    const userMsgRight: ChatMessage = { id: ++msgId, role: 'user', text: question };
    set({
      input: '',
      left: { messages: [userMsgLeft], thinking: true },
      right: { messages: [userMsgRight], thinking: true },
    });

    // ── 좌측(범용 AI): 짧은 thinking ~700ms → 텍스트 청크 스트리밍 → 완료 ──
    void (async () => {
      await sleep(700);
      if (id !== runId) return;

      const genericText = GENERIC_ANSWER[lang];
      const assistantId = ++msgId;
      set((s) => ({
        left: {
          thinking: false,
          messages: [...s.left.messages, { id: assistantId, role: 'assistant', text: '', streaming: true }],
        },
      }));

      let i = 0;
      while (i < genericText.length) {
        if (id !== runId) return;
        const size = 2 + Math.floor(Math.random() * 3);
        const chunk = genericText.slice(i, i + size);
        i += size;
        set((s) => ({
          left: {
            ...s.left,
            messages: s.left.messages.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m,
            ),
          },
        }));
        await sleep(28);
      }

      if (id !== runId) return;
      await sleep(250);
      // 완료: streaming false, answer 없음 (캐비엇은 컴포넌트가 streaming===false 로 판단)
      set((s) => ({
        left: {
          ...s.left,
          messages: s.left.messages.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        },
      }));
    })();

    // ── 우측(AlphaLenz): 긴 thinking ~1400ms → answer.text 청크 스트리밍 → answer 부착 ──
    void (async () => {
      await sleep(1400);
      if (id !== runId) return;

      const alphaAnswer = ALPHA_ANSWER[lang];
      const assistantId = ++msgId;
      set((s) => ({
        right: {
          thinking: false,
          messages: [...s.right.messages, { id: assistantId, role: 'assistant', text: '', streaming: true }],
        },
      }));

      let i = 0;
      while (i < alphaAnswer.text.length) {
        if (id !== runId) return;
        const size = 2 + Math.floor(Math.random() * 3);
        const chunk = alphaAnswer.text.slice(i, i + size);
        i += size;
        set((s) => ({
          right: {
            ...s.right,
            messages: s.right.messages.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m,
            ),
          },
        }));
        await sleep(28);
      }

      if (id !== runId) return;
      await sleep(250);
      // 완료: streaming false + answer 부착 (근거카드/차트/출처 렌더용)
      set((s) => ({
        right: {
          ...s.right,
          messages: s.right.messages.map((m) =>
            m.id === assistantId ? { ...m, streaming: false, answer: alphaAnswer } : m,
          ),
        },
      }));
    })();
  },

  reset: () => {
    runId++;
    set({ input: '', left: idleSide(), right: idleSide() });
  },
}));
