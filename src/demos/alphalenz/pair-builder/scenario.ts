import type { Scenario } from '../../../engine/types';
import { usePair } from './state';
import { getLang } from '../_shared/i18n';

const st = () => usePair.getState();

const cap = (ko: string, en: string) => () => (getLang() === 'ko' ? ko : en);

/**
 * v1 — 마켓 뉴트럴 자동 설계.
 * 섹터 선택 → 롱/숏 페어 등장 → 순노출이 한도(+14%) 근처 → 자동 밸런싱으로 Net 0 → Sharpe 상승.
 */
export const neutralScenario: Scenario = {
  id: 'pair-neutral',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'sector-semi', run: () => st().loadSector('semi') },
    { kind: 'wait', ms: 2400 },
    { kind: 'cursor', target: 'pair-0', zoom: true, caption: cap('AI 롱/숏 페어 제안', 'AI long/short pairs') },
    { kind: 'wait', ms: 1800 },
    { kind: 'cursor', target: 'net-gauge', caption: cap('순노출 한도 근접', 'Net near limit') },
    { kind: 'wait', ms: 1000 },
    {
      kind: 'click',
      target: 'auto-balance',
      run: () => st().autoBalance(),
      zoom: true,
      spotlight: 'net-gauge',
      caption: cap('Net 0으로 자동 밸런싱', 'Auto-balancing Net to 0'),
    },
    { kind: 'waitFor', check: () => Math.abs(st().exposure().net) < 0.6, timeoutMs: 3000 },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'sharpe', zoom: true, caption: cap('위험조정수익 상승', 'Risk-adjusted return up') },
    { kind: 'wait', ms: 1600 },
  ],
};

/**
 * v2 — 리스크 리밋 가드레일.
 * 섹터 선택 → 한 종목 비중을 밀어 단일종목 10% 초과 → 경고 → 자동 밸런싱으로 리밋 내 재조정.
 */
export const guardrailScenario: Scenario = {
  id: 'pair-guardrail',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'sector-battery', run: () => st().loadSector('battery') },
    { kind: 'wait', ms: 2000 },
    { kind: 'cursor', target: 'weight-1' },
    { kind: 'wait', ms: 400 },
    { kind: 'do', run: () => st().pushLeg(1, 'long', 15) },
    { kind: 'wait', ms: 1300 },
    {
      kind: 'cursor',
      target: 'concentration',
      zoom: true,
      caption: cap('단일종목 10% 초과 경고', 'Single-name >10% breach'),
    },
    { kind: 'wait', ms: 1800 },
    {
      kind: 'click',
      target: 'auto-balance',
      run: () => st().autoBalance(),
      zoom: true,
      spotlight: 'concentration',
      caption: cap('리밋 내 자동 재조정', 'Rebalanced within limits'),
    },
    { kind: 'waitFor', check: () => !st().breach(), timeoutMs: 3000 },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'sharpe', zoom: true, caption: cap('위험조정수익 회복', 'Risk-adjusted return restored') },
    { kind: 'wait', ms: 1400 },
  ],
};
