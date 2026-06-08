import type { L } from '../_shared/i18n';

export const ATTACHED_FILE: L = {
  ko: '[Treasurer 템플릿].pptx',
  en: '[Treasurer template].pptx',
};

export interface Template {
  id: string;
  name: L;
}

export const TEMPLATES: Template[] = [
  { id: 'pib', name: { ko: '갱신 제안서 (Renewal Proposal) — PPT', en: 'Renewal Proposal — PPT' } },
  { id: 'scratch', name: { ko: '처음부터 슬라이드 만들기', en: 'Build slides from scratch' } },
];

export const MATRIX_NAME: L = {
  ko: 'Korean Re 2026 Property Cat XoL 갱신',
  en: 'Korean Re 2026 Property Cat XoL Renewal',
};
export const DRAFT_TAB: L = {
  ko: 'Korean Re 2026 갱신 제안서 초안',
  en: 'Korean Re 2026 Renewal Proposal Draft',
};

export const PROMPT_SPEED: L = {
  ko: '2026 Treaty 갱신 제안서, 최근 3년 손해율 분석 포함해서 10장으로 만들어줘',
  en: 'Create a 10-slide 2026 treaty renewal proposal including a 3-year loss ratio analysis',
};
export const PROMPT_TEMPLATE: L = {
  ko: '첨부한 회사 템플릿 톤앤매너 그대로, Cedant 보고용 갱신 제안서로 정리해줘',
  en: 'Using the attached company template tone and style, draft a renewal proposal for the cedant',
};

export const OUTLINE: L<string[]> = {
  ko: [
    '표지 — 2026 Property Cat XoL 갱신 제안',
    '계약 개요 — Cedant / Structure',
    '최근 3년 손해율(Loss Ratio) 추이',
    '익스포저 분석 (TSI ₩12.4조)',
    '레이어 구조 — XoL 4 Layers',
    'Cat 모델링 결과 (EML ₩880억)',
    '갱신 조건 제안 — Rate +12.5%',
    'Reinstatement · Retention 조정안',
    '시장 동향 및 벤치마크',
    '리스크 권고 및 다음 단계',
  ],
  en: [
    'Cover — 2026 Property Cat XoL Renewal Proposal',
    'Treaty Overview — Cedant / Structure',
    '3-Year Loss Ratio Trend',
    'Exposure Analysis (TSI ₩12.4tn)',
    'Layer Structure — XoL 4 Layers',
    'Cat Modeling Results (EML ₩88bn)',
    'Renewal Terms Proposal — Rate +12.5%',
    'Reinstatement & Retention Adjustments',
    'Market Trends & Benchmarks',
    'Risk Recommendations & Next Steps',
  ],
};

export type SlideKind = 'cover' | 'kpi' | 'table' | 'chart' | 'bars';

export interface Slide {
  title: L;
  sub: L;
  kind: SlideKind;
}

export const SLIDES: Slide[] = [
  {
    title: { ko: '2026 Property Cat XoL 갱신 제안', en: '2026 Property Cat XoL Renewal Proposal' },
    sub: { ko: 'Korean Re · by ARIA', en: 'Korean Re · by ARIA' },
    kind: 'cover',
  },
  {
    title: { ko: '계약 개요', en: 'Treaty Overview' },
    sub: { ko: 'Cedant: Korean Re · XoL 4 Layers', en: 'Cedant: Korean Re · XoL 4 Layers' },
    kind: 'table',
  },
  {
    title: { ko: '손해율 추이', en: 'Loss Ratio Trend' },
    sub: { ko: "'23 58% → '25 74%", en: "'23 58% → '25 74%" },
    kind: 'chart',
  },
  {
    title: { ko: '익스포저 분석', en: 'Exposure Analysis' },
    sub: { ko: 'TSI ₩12.4조 · 태풍 집중도↑', en: 'TSI ₩12.4tn · rising typhoon concentration' },
    kind: 'bars',
  },
  {
    title: { ko: '레이어 구조', en: 'Layer Structure' },
    sub: { ko: 'USD 250M xs 50M 외 3개', en: 'USD 250M xs 50M + 3 layers' },
    kind: 'bars',
  },
  {
    title: { ko: 'Cat 모델링', en: 'Cat Modeling' },
    sub: { ko: 'EML ₩880억 · RDS 재검토', en: 'EML ₩88bn · RDS review' },
    kind: 'chart',
  },
  {
    title: { ko: '갱신 조건 제안', en: 'Renewal Terms Proposal' },
    sub: { ko: 'Rate +12.5% · RoL 8.2%', en: 'Rate +12.5% · RoL 8.2%' },
    kind: 'kpi',
  },
  {
    title: { ko: 'Retention 조정안', en: 'Retention Adjustment' },
    sub: { ko: '₩50억 → ₩60억 · Reinst. 2@100%', en: '₩5bn → ₩6bn · Reinst. 2@100%' },
    kind: 'table',
  },
  {
    title: { ko: '시장 동향', en: 'Market Trends' },
    sub: { ko: 'APAC Property Cat 벤치마크', en: 'APAC Property Cat benchmark' },
    kind: 'chart',
  },
  {
    title: { ko: '리스크 권고', en: 'Risk Recommendations' },
    sub: { ko: '다음 단계 및 일정', en: 'Next steps & timeline' },
    kind: 'cover',
  },
];

/** 앱 UI 문자열 */
export const STR = {
  draftPanelTitle: { ko: '초안 만들기', en: 'Create draft' },
  typeDocument: { ko: '문서', en: 'Document' },
  typePresentation: { ko: '프레젠테이션', en: 'Presentation' },
  promptPlaceholder: { ko: '예시 슬라이드를 어떻게 수정할까요?', en: 'How should I refine the example slides?' },
  templatesLabel: { ko: '템플릿', en: 'Templates' },
  generating: { ko: '생성 중…', en: 'Generating…' },
  generateOutline: { ko: '슬라이드 개요 생성', en: 'Generate slide outline' },
  draftDone: { ko: '초안 완성', en: 'Draft ready' },
  emptyTitle: { ko: '초안이 여기에 표시됩니다', en: 'Your draft will appear here' },
  emptySubtitlePrefix: { ko: 'ARIA가 “', en: 'ARIA drafts from the “' },
  emptySubtitleSuffix: { ko: '” 계약 데이터를 기반으로 초안을 생성합니다', en: '” treaty data' },
  statusAnalyzing: { ko: '문서 구조 분석 중…', en: 'Analyzing document structure…' },
  statusSlides: { ko: '슬라이드 생성 중…', en: 'Generating slides…' },
} satisfies Record<string, L>;

/** 슬라이드 진행 상태 — '{n}/{total}' */
export const STATUS_SLIDES_PROGRESS: L = {
  ko: '슬라이드 생성 중… {n}/{total}',
  en: 'Generating slides… {n}/{total}',
};
