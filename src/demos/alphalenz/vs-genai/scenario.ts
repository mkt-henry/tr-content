/**
 * vs-genai 자동 재생 시나리오 — AlphaLenz vs 범용 AI 비교 대결.
 *
 * 타이밍 근거 (state.ts 실측치 기준):
 *   - 좌측(범용 AI): thinking 700ms + 스트리밍 GENERIC_ANSWER(ko:217자/en:439자 @ ~28ms/3자) + 완료 250ms
 *       → ko ~2994ms / en ~5066ms (start() 기준)
 *   - 우측(AlphaLenz): thinking 1400ms + 스트리밍 ALPHA_ANSWER.text(ko:199자/en:389자 @ ~28ms/3자) + 완료 250ms
 *       → ko ~3526ms / en ~5290ms (start() 기준)
 *   - 질문 타이핑: ko 11자 @14cps → ~786ms / en 33자 @14cps → ~2358ms
 *   - click(vs-send) 전 누적 대기: 900+600+type+400 = ko ~2686ms / en ~4258ms
 *   - click 후 우측 완료까지: ko ~3526ms / en ~5290ms
 *   - 보수적 wait(step 6): 12500ms — en 최장 케이스(~5290ms) + 근거카드/차트 렌더 버퍼 ~7200ms.
 */

import type { Scenario } from '../../../engine/types';
import { getLang } from '../_shared/i18n';
import { useVs } from './state';
import { QUESTION } from './data';

const st = () => useVs.getState();

/** 캡션 로컬 문구 */
const CAP_RIGHT = {
  ko: '실시간 데이터 · 출처 인용',
  en: 'Live data · cited sources',
} as const;

const CAP_LEFT = {
  ko: '지식 컷오프 · 출처 없음',
  en: 'Knowledge cutoff · no sources',
} as const;

export const vsScenario: Scenario = {
  id: 'vs-genai-samsung',
  steps: [
    // 1. 시작 전 짧은 홀드
    { kind: 'wait', ms: 900 },

    // 2. 입력창으로 커서 이동
    { kind: 'cursor', target: 'vs-input', ms: 600 },

    // 3. 질문 타이핑 (재생 시점 언어 평가)
    {
      kind: 'type',
      target: 'vs-input',
      text: () => QUESTION[getLang()],
      cps: 14,
      set: (v) => st().setInput(v),
    },

    // 4. 전송 직전 짧은 멈춤
    { kind: 'wait', ms: 400 },

    // 5. 전송 버튼 클릭 → 양쪽 동시 스트리밍 시작
    { kind: 'click', target: 'vs-send', run: () => st().start() },

    // 6. 우측(AlphaLenz) 스트리밍 완료 + 근거카드/차트 렌더까지 대기.
    //    en 최장: thinking 1400ms + stream ~5040ms + 완료 250ms = ~6690ms.
    //    보수적 버퍼 포함: 12500ms.
    //    (좌측 범용 AI는 en 기준 ~5066ms 이내로 캐비엣까지 완료됨.)
    { kind: 'wait', ms: 12500 },

    // 7. 우측 근거 패널 줌 — AlphaLenz 강점 강조
    {
      kind: 'cursor',
      target: 'vs-right-evidence',
      ms: 900,
      zoom: true,
      caption: () => CAP_RIGHT[getLang()],
    },

    // 8. 줌 홀드
    { kind: 'wait', ms: 1600 },

    // 9. 좌측 캐비엣 칩 줌 — 범용 AI 한계 강조
    {
      kind: 'cursor',
      target: 'vs-left-caveat',
      ms: 900,
      zoom: true,
      caption: () => CAP_LEFT[getLang()],
    },

    // 10. 최종 홀드
    { kind: 'wait', ms: 1800 },
  ],
};
