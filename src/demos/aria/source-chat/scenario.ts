import type { Scenario } from '../../../engine/types';
import { getLang } from '../_shared/i18n';
import { getPipeline } from '../_shared/chat/data';
import { useSourceChat } from './store';

const st = () => useSourceChat.getState();
/** 지정 파이프라인의 i번째 추천 질문 — 재생 시점의 프로젝트 언어로 평가 */
const q = (id: string, i: number) => () => getPipeline(id)!.qa[i].question[getLang()];

/** v1 — "+" 버튼으로 출처 첨부: Term Life XL을 붙이고 2개 질문(첫 답변에 XL 구조 차트) */
export const addSourceScenario: Scenario = {
  id: 'source-add',
  steps: [
    // 출처 미지정(빈) 상태에서 시작
    { kind: 'wait', ms: 1100 },
    // + 버튼으로 출처 메뉴 열기 → 긴급 건(Term Life XL) 첨부
    { kind: 'cursor', target: 'source-add', ms: 700 },
    { kind: 'click', target: 'source-add', run: () => st().toggleMenu(true) },
    { kind: 'wait', ms: 600 },
    { kind: 'cursor', target: 'source-pick-termlife', ms: 700 },
    { kind: 'click', target: 'source-pick-termlife', run: () => st().setSource('termlife') },
    { kind: 'wait', ms: 900 },
    // 1) 보유·한도 — 답변에 XL 레이어 타워 차트가 함께 표시됨
    { kind: 'type', target: 'chat-input', text: q('termlife', 0), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 6500 },
    { kind: 'cursor', target: 'answer-chart', ms: 700 },
    { kind: 'wait', ms: 1800 },
    // 2) 보험기간·담보 범위
    { kind: 'type', target: 'chat-input', text: q('termlife', 1), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 6500 },
    { kind: 'cursor', target: 'evidence-card', ms: 700 },
    { kind: 'wait', ms: 1400 },
  ],
};

/** v2 — "/" 명령어로 출처 전환: 삼성 CI로 질문하다가 /kyobo로 바꿔 건별 비교 분석 */
export const slashSourceScenario: Scenario = {
  id: 'source-slash',
  steps: [
    { kind: 'wait', ms: 1100 },
    // /samsung 으로 삼성화재 CI 첨부
    { kind: 'cursor', target: 'chat-input', ms: 500 },
    { kind: 'type', target: 'chat-input', text: () => '/samsung', cps: 12, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'source-pick-samsung-ci', ms: 700 },
    { kind: 'click', target: 'source-pick-samsung-ci', run: () => st().setSource('samsung-ci') },
    { kind: 'wait', ms: 900 },
    // 삼성 CI — 출재율·보유 (추천 질문)
    { kind: 'cursor', target: 'suggest-0', ms: 600 },
    { kind: 'click', target: 'suggest-0', run: () => st().send(q('samsung-ci', 0)()) },
    { kind: 'wait', ms: 7000 },
    // /kyobo 로 출처 전환 → 교보 단체상해로 비교 질문
    { kind: 'type', target: 'chat-input', text: () => '/kyobo', cps: 12, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'source-pick-kyobo-gpa', ms: 700 },
    { kind: 'click', target: 'source-pick-kyobo-gpa', run: () => st().setSource('kyobo-gpa') },
    { kind: 'wait', ms: 900 },
    // 교보 PA — 출재율·사고당 한도
    { kind: 'type', target: 'chat-input', text: q('kyobo-gpa', 0), cps: 16, set: (v) => st().setInput(v) },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: 'chat-send', run: () => st().send() },
    { kind: 'wait', ms: 7000 },
    { kind: 'wait', ms: 1200 },
  ],
};
