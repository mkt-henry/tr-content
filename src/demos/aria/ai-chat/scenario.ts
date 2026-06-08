import type { Scenario } from '../../../engine/types';
import { getLang } from '../_shared/i18n';
import { useChat } from './state';
import { QA } from './data';

const st = () => useChat.getState();
/** 질문 텍스트 — 재생 시점의 프로젝트 언어로 평가 */
const q = (i: number) => () => QA[i].question[getLang()];

/** v1 — 근거 소구: 직접 타이핑 → 답변 + 근거 데이터 카드 */
export const evidenceScenario: Scenario = {
  id: 'chat-evidence',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'type', target: 'chat-input', text: q(0), cps: 14, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    // thinking 1.1s + 스트리밍 약 6s + 근거 카드
    { kind: 'wait', ms: 9500 },
    { kind: 'cursor', target: 'evidence-card', ms: 800 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 자연어 소구: 추천 질문 클릭 → 즉시 답변, 이어서 후속 질문 */
export const naturalScenario: Scenario = {
  id: 'chat-natural',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'suggest-0', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'suggest-2', run: () => st().send(q(2)()) },
    { kind: 'wait', ms: 8500 },
    { kind: 'type', target: 'chat-input', text: q(1), cps: 15, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 9000 },
    { kind: 'wait', ms: 1200 },
  ],
};
