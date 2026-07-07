import type { Scenario, StepText } from '../src/engine/types';

function textLen(t: StepText): number {
  return [...(typeof t === 'function' ? t() : t)].length;
}

/**
 * 시나리오 총 재생시간(ms) 추정 — run.ts의 타이밍을 그대로 반영한다.
 * click은 커서 이동 650 + 클릭 펄스(160+120). type은 target 있으면 이동+펄스 포함.
 * jitter/랜덤 청크는 평균 1.0로 근사. durationInFrames 산출용.
 */
export function estimateScenarioMs(scenario: Scenario): number {
  let ms = 0;
  for (const s of scenario.steps) {
    switch (s.kind) {
      case 'wait':
        ms += s.ms;
        break;
      case 'cursor':
        ms += s.ms ?? 650;
        break;
      case 'click':
        ms += 650 + 160 + 120;
        break;
      case 'type':
        ms += (s.target ? 650 + 160 + 120 : 0) + textLen(s.text) * (1000 / (s.cps ?? 16));
        break;
      case 'stream':
        ms += textLen(s.text) * (1000 / (s.cps ?? 40));
        break;
      case 'scroll':
        ms += s.ms ?? 800;
        break;
      case 'waitFor':
        ms += s.timeoutMs ?? 8000;
        break;
      case 'do':
        break;
    }
  }
  return ms;
}
