import type { Scenario } from '../../engine/types';
import { useDocGen } from './state';
import { PROMPT_SPEED, PROMPT_TEMPLATE } from './data';

const st = () => useDocGen.getState();

/** v1 — 속도 소구: 프롬프트 한 줄로 초안 완성까지 */
export const speedScenario: Scenario = {
  id: 'doc-gen-speed',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'doc-type-presentation', run: () => st().setDocType('presentation') },
    { kind: 'wait', ms: 500 },
    { kind: 'type', target: 'prompt-input', text: PROMPT_SPEED, cps: 18, set: (v) => st().setPrompt(v) },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: 'tpl-pib', run: () => st().selectTemplate('pib') },
    { kind: 'wait', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 9000 },
    { kind: 'wait', ms: 1200 },
  ],
};

/** v2 — 템플릿 일관성 소구: 첨부 템플릿 강조 후 생성 */
export const templateScenario: Scenario = {
  id: 'doc-gen-template',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'attached-file', ms: 800 },
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'doc-type-presentation', run: () => st().setDocType('presentation') },
    { kind: 'wait', ms: 400 },
    { kind: 'type', target: 'prompt-input', text: PROMPT_TEMPLATE, cps: 15, set: (v) => st().setPrompt(v) },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'tpl-scratch', run: () => st().selectTemplate('scratch') },
    { kind: 'wait', ms: 700 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 9000 },
    { kind: 'wait', ms: 1200 },
  ],
};
