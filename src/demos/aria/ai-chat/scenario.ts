import type { Scenario } from '../../../engine/types';
import { getLang } from '../_shared/i18n';
import { GLOBAL_QA } from '../_shared/chat/data';
import { useChat } from './store';

const st = () => useChat.getState();
/** 전체 파이프라인 종합(GLOBAL) 추천 질문 — 재생 시점의 프로젝트 언어로 평가 */
const q = (i: number) => () => GLOBAL_QA[i].question[getLang()];

/** v1 — 근거 소구: 전체 종합으로 연속 질문하며 매 답변의 원문 근거를 확인 */
export const evidenceScenario: Scenario = {
  id: 'chat-evidence',
  steps: [
    { kind: 'wait', ms: 900 },
    // 1) 출재 구조 비교
    { kind: 'type', target: 'chat-input', text: q(1), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 8800 },
    { kind: 'cursor', target: 'evidence-card', ms: 700 },
    { kind: 'wait', ms: 1600 },
    // 2) 이어서 면책 비교 — 같은 데이터로 다른 각도 분석
    { kind: 'type', target: 'chat-input', text: q(2), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 8800 },
    { kind: 'cursor', target: 'evidence-card', ms: 700 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 자연어 소구: 추천 질문으로 시작해 자연어로 계속 파고드는 연속 분석 */
export const naturalScenario: Scenario = {
  id: 'chat-natural',
  steps: [
    { kind: 'wait', ms: 900 },
    // 1) 마감 우선순위 (추천 질문)
    { kind: 'cursor', target: 'suggest-0', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'suggest-0', run: () => st().send(q(0)()) },
    { kind: 'wait', ms: 8000 },
    // 2) 출재 구조 비교
    { kind: 'type', target: 'chat-input', text: q(1), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 8200 },
    // 3) 면책 공통점·차이
    { kind: 'type', target: 'chat-input', text: q(2), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 8200 },
    { kind: 'wait', ms: 1000 },
  ],
};
