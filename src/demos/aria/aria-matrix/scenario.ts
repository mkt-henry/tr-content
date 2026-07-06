import type { Scenario } from '../../../engine/types';
import { useMatrix } from './state';
import { usePlaybackStore } from '../../../engine/playbackStore';

const st = () => useMatrix.getState();

/** 업로드 → 자동 일괄 추출 → 원문 인용 검증 단일 통합 플로우 */
export const uploadFlowScenario: Scenario = {
  id: 'matrix-upload-flow',
  steps: [
    { kind: 'wait', ms: 700 },
    // 1) 업로드 버튼으로 줌인 → 확대된 상태에서 클릭 → 줌아웃하면서 파일 선택창 등장
    { kind: 'cursor', target: 'upload-btn', zoom: true, ms: 800 },
    { kind: 'click', target: 'upload-btn', zoom: true },
    { kind: 'wait', ms: 220 },
    { kind: 'do', run: () => { usePlaybackStore.getState().setSpotlight(null); st().openExplorer(); } },
    { kind: 'wait', ms: 550 },
    // 2) 헤더 "전체 선택" 체크박스 한 번 클릭 → 5개 PDF 일괄 선택
    { kind: 'cursor', target: 'explorer-select-all', ms: 520 },
    { kind: 'click', target: 'explorer-select-all', run: () => st().toggleSelectAll() },
    { kind: 'wait', ms: 600 },
    // 3) 열기 → 업로드 → (자동) 분석
    { kind: 'click', target: 'explorer-open-btn', run: () => st().confirmUpload() },
    { kind: 'waitFor', check: () => st().phase === 'analyzing' || st().phase === 'done', timeoutMs: 6000 },
    { kind: 'wait', ms: 500 },
    { kind: 'waitFor', check: () => st().phase === 'done', timeoutMs: 40000 },
    { kind: 'wait', ms: 700 },
    // 4) 소스 확인 — 셀 클릭 → 우측 패널 열림 → 스포트라이트 마스크로 핵심 영역 강조(줌 없음)
    { kind: 'click', target: 'cell-propcat-limit', run: () => st().openPopover('propcat', 'limit') },
    { kind: 'wait', ms: 600 },
    { kind: 'cursor', target: 'citation-panel-clause', ms: 650 },
    { kind: 'do', run: () => st().setFocus('citation-panel-page') },
    { kind: 'wait', ms: 2600 },
    { kind: 'do', run: () => st().setFocus(null) },
    { kind: 'click', target: 'cell-casualty-deductible', run: () => st().openPopover('casualty', 'deductible') },
    { kind: 'wait', ms: 600 },
    { kind: 'cursor', target: 'citation-panel-clause', ms: 650 },
    { kind: 'do', run: () => st().setFocus('citation-panel-page') },
    { kind: 'wait', ms: 2600 },
    { kind: 'do', run: () => { st().setFocus(null); st().closePopover(); } },
    { kind: 'wait', ms: 1200 },
  ],
};
