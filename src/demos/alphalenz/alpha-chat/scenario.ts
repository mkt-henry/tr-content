import type { Scenario } from '../../../engine/types';
import { getLang } from '../_shared/i18n';
import { useChat } from './state';
import { QA } from './data';

const st = () => useChat.getState();
/** 질문 텍스트 — 재생 시점의 프로젝트 언어로 평가 */
const q = (i: number) => () => QA[i].question[getLang()];

/** v1 — 근거 소구: 직접 타이핑 → 답변 + 근거 카드/차트 */
export const evidenceScenario: Scenario = {
  id: 'alpha-chat-evidence',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'type', target: 'chat-input', text: q(0), cps: 14, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    // thinking 1.1s + 스트리밍 약 7s + 근거 카드/차트
    { kind: 'wait', ms: 9800 },
    { kind: 'cursor', target: 'evidence-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};

/** v2 — 멀티턴 소구: 추천 질문 클릭 → 답변, 이어서 후속 질문 */
export const multiturnScenario: Scenario = {
  id: 'alpha-chat-multiturn',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'suggest-0', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'suggest-1', run: () => st().send(q(1)()) },
    { kind: 'wait', ms: 8800 },
    { kind: 'type', target: 'chat-input', text: q(2), cps: 15, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 9200 },
    { kind: 'wait', ms: 1200 },
  ],
};
