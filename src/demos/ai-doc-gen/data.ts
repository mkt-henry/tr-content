export const ATTACHED_FILE = '[Treasurer 템플릿].pptx';

export const TEMPLATES = [
  { id: 'pib', name: '갱신 제안서 (Renewal Proposal) — PPT' },
  { id: 'scratch', name: '처음부터 슬라이드 만들기' },
];

export const MATRIX_NAME = 'Korean Re 2026 Property Cat XoL 갱신';
export const DRAFT_TAB = 'Korean Re 2026 갱신 제안서 초안';

export const PROMPT_SPEED = '2026 Treaty 갱신 제안서, 최근 3년 손해율 분석 포함해서 10장으로 만들어줘';
export const PROMPT_TEMPLATE = '첨부한 회사 템플릿 톤앤매너 그대로, Cedant 보고용 갱신 제안서로 정리해줘';

export const OUTLINE = [
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
];

export type SlideKind = 'cover' | 'kpi' | 'table' | 'chart' | 'bars';

export const SLIDES: { title: string; sub: string; kind: SlideKind }[] = [
  { title: '2026 Property Cat XoL 갱신 제안', sub: 'Korean Re · by ARIA', kind: 'cover' },
  { title: '계약 개요', sub: 'Cedant: Korean Re · XoL 4 Layers', kind: 'table' },
  { title: '손해율 추이', sub: "'23 58% → '25 74%", kind: 'chart' },
  { title: '익스포저 분석', sub: 'TSI ₩12.4조 · 태풍 집중도↑', kind: 'bars' },
  { title: '레이어 구조', sub: 'USD 250M xs 50M 외 3개', kind: 'bars' },
  { title: 'Cat 모델링', sub: 'EML ₩880억 · RDS 재검토', kind: 'chart' },
  { title: '갱신 조건 제안', sub: 'Rate +12.5% · RoL 8.2%', kind: 'kpi' },
  { title: 'Retention 조정안', sub: '₩50억 → ₩60억 · Reinst. 2@100%', kind: 'table' },
  { title: '시장 동향', sub: 'APAC Property Cat 벤치마크', kind: 'chart' },
  { title: '리스크 권고', sub: '다음 단계 및 일정', kind: 'cover' },
];
