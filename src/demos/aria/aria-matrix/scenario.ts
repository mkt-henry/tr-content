import type { Scenario } from '../../../engine/types';
import { useMatrix } from './state';
import { getLang } from '../_shared/i18n';

const st = () => useMatrix.getState();
const cap = (ko: string, en: string) => () => (getLang() === 'ko' ? ko : en);

/** 업로드 → 자동 일괄 추출 → 원문 인용 검증 단일 통합 플로우 */
export const uploadFlowScenario: Scenario = {
  id: 'matrix-upload-flow',
  steps: [
    { kind: 'wait', ms: 700 },
    // 1) 업로드 버튼 강조 후 탐색기 열기 (click은 zoom 없음 → 줌아웃하며 오버레이 표시)
    { kind: 'cursor', target: 'upload-btn', zoom: true, caption: cap('문서 업로드', 'Upload documents'), ms: 800 },
    { kind: 'click', target: 'upload-btn', run: () => st().openExplorer() },
    { kind: 'wait', ms: 800 },
    // 2) PDF 5개 다중 선택
    { kind: 'click', target: 'file-propcat', run: () => st().toggleFileSelect('propcat') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-marine', run: () => st().toggleFileSelect('marine') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-casualty', run: () => st().toggleFileSelect('casualty') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-energy', run: () => st().toggleFileSelect('energy') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-aviation', run: () => st().toggleFileSelect('aviation') },
    { kind: 'wait', ms: 500 },
    // 3) 열기 → 업로드 → (자동) 분석
    { kind: 'click', target: 'explorer-open-btn', run: () => st().confirmUpload() },
    { kind: 'waitFor', check: () => st().phase === 'analyzing' || st().phase === 'done', timeoutMs: 6000 },
    { kind: 'wait', ms: 500 },
    { kind: 'waitFor', check: () => st().phase === 'done', timeoutMs: 16000 },
    { kind: 'wait', ms: 700 },
    // 4) 소스 확인 — 셀 클릭 → 원문 인용 패널 (zoom으로 강조)
    { kind: 'click', target: 'cell-propcat-limit', run: () => st().openPopover('propcat', 'limit'), zoom: true, caption: cap('원문 인용 확인', 'Check source citation') },
    { kind: 'wait', ms: 3000 },
    { kind: 'click', target: 'cell-casualty-deductible', run: () => st().openPopover('casualty', 'deductible'), zoom: true, caption: cap('원문 인용 확인', 'Check source citation') },
    { kind: 'wait', ms: 3000 },
    { kind: 'do', run: () => st().closePopover() },
    { kind: 'wait', ms: 1200 },
  ],
};
