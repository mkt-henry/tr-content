import type { L, Lang } from '../_shared/i18n';

export interface RiskItem {
  label: L;
  value: L;
}

export const RISK_SUMMARY: { title: string; items: RiskItem[] } = {
  // 고유명사 — 공통 유지
  title: 'Korean Re 2026 Property Cat XoL',
  items: [
    { label: { ko: 'Layer', en: 'Layer' }, value: { ko: 'USD 250M xs 50M', en: 'USD 250M xs 50M' } },
    { label: { ko: 'RoL', en: 'RoL' }, value: { ko: '~8.2%', en: '~8.2%' } },
    { label: { ko: 'Reinstatement', en: 'Reinstatement' }, value: { ko: '2 @ 100%', en: '2 @ 100%' } },
    {
      label: { ko: '익스포저', en: 'Exposure' },
      value: { ko: 'Cat 高 (태풍 집중)', en: 'High Cat (typhoon-concentrated)' },
    },
  ],
};

export interface Candidate {
  id: string;
  /** 회사명·소재지는 고유명사 — 공통 유지 */
  name: string;
  region: string;
  score: number;
  reasons: L<string[]>;
}

/** 초기 표시 순서는 무작위 — 분석 후 점수순 재정렬 연출 */
export const CANDIDATES: Candidate[] = [
  {
    id: 'scor',
    name: 'SCOR',
    region: 'Paris',
    score: 82,
    reasons: {
      ko: ['APAC Property 확대 중', 'Reinstatement 조건 보수적'],
      en: ['Growing APAC Property book', 'Conservative on reinstatements'],
    },
  },
  {
    id: 'swissre',
    name: 'Swiss Re',
    region: 'Zürich',
    score: 94,
    reasons: {
      ko: ['선호 라인: Property Cat APAC', '동일 Cedant 5년 연속 인수', 'Capacity 충분'],
      en: ['Preferred line: Property Cat APAC', '5 years on the same cedant', 'Ample capacity'],
    },
  },
  {
    id: 'hannover',
    name: 'Hannover Re',
    region: 'Hannover',
    score: 78,
    reasons: {
      ko: ['가격 경쟁력 우수', '최근 Cat 익스포저 축소 기조'],
      en: ['Strong pricing competitiveness', 'Recently trimming Cat exposure'],
    },
  },
  {
    id: 'lloyds',
    name: "Lloyd's Syn. 2001",
    region: 'London',
    score: 71,
    reasons: {
      ko: ['Fac 보완 capacity', 'Lead 가능성 낮음'],
      en: ['Fac top-up capacity', 'Unlikely to lead'],
    },
  },
  {
    id: 'munichre',
    name: 'Munich Re',
    region: 'München',
    score: 89,
    reasons: {
      ko: ['Cat 모델링 강점', 'Korean Re 패널 기참여', 'RoL 선호대 부합'],
      en: ['Strong Cat modelling', 'Already on the Korean Re panel', 'Fits target RoL band'],
    },
  },
];

/** 영업 이메일 — 비즈니스 영문은 동일, 한국어 버전 별도 작성 */
export const EMAIL_SUBJECT: L = {
  ko: 'Korean Re 2026 Property Cat XoL — 갱신 청약 및 인수 여력 문의',
  en: 'Korean Re 2026 Property Cat XoL — Renewal Submission & Capacity Enquiry',
};

export const EMAIL_BODY: L = {
  ko: `Keller 님께,

Korean Re 자연재해 프로그램에서 이어온 협력 관계에 따라, 2026년 갱신 건을 검토해 주십사 청약드립니다.

본 건은 USD 250M xs 50M 구조에 Reinstatement 2회 @100%, 잠정 Rate on Line 8.2% 조건입니다. 손해 발생은 모델 예상 범위 내에 있으며, 상위 2개 레이어는 인수 이래 무사고를 유지하고 있습니다.

2021년 이래 Swiss Re의 본 계정 리딩 지속과 APAC Property Cat 리스크에 대한 귀사의 인수 의향을 고려할 때, 최대 25%까지의 Lead Line에 대한 인디케이션을 받을 수 있다면 감사하겠습니다.

전체 청약 자료를 첨부드립니다. 금주 중 통화 일정을 잡을 수 있다면 기쁘겠습니다.

감사합니다.
김중개
Treasurer Reinsurance Brokers — 서울`,
  en: `Dear Mr. Keller,

Further to our ongoing relationship on the Korean Re property catastrophe programme, we are pleased to submit the 2026 renewal for your consideration.

The placement comprises USD 250M xs 50M with two reinstatements at 100%, at an indicative Rate on Line of 8.2%. Loss activity remains within modelled expectations, with the top two layers loss-free since inception.

Given Swiss Re's continued leadership on this account since 2021 and your stated appetite for APAC property catastrophe risk, we would welcome your indication on a lead line of up to 25%.

Full submission pack attached. We would be glad to arrange a call this week.

Best regards,
Kim Junghae
Treasurer Reinsurance Brokers — Seoul`,
};

/** 현재 언어의 이메일 제목/본문 — 훅 밖 룩업용 */
export function emailSubject(lang: Lang): string {
  return EMAIL_SUBJECT[lang];
}
export function emailBody(lang: Lang): string {
  return EMAIL_BODY[lang];
}

/** 앱 UI 문자열 */
export const STR = {
  // RiskCard
  riskHeader: { ko: '분석 대상 리스크', en: 'Risk under analysis' },
  analyzeIdle: { ko: '재보험사 적합도 분석', en: 'Analyze reinsurer fit' },
  analyzeScoring: { ko: '선호도 분석 중…', en: 'Analyzing appetite…' },
  analyzeDone: { ko: '분석 완료', en: 'Analysis complete' },
  // CandidateList
  fitLabel: { ko: '적합도', en: 'Fit' },
  selectFull: { ko: '이 재보험사로 영업 이메일 작성', en: 'Draft outreach email to this reinsurer' },
  selectCompact: { ko: '영업 이메일 작성', en: 'Draft outreach email' },
  selectBusy: { ko: '이메일 작성 중', en: 'Drafting email…' },
  // EmailPanel
  emailTitle: { ko: '영업 이메일 초안', en: 'Outreach email draft' },
  emailDoneBadge: { ko: '초안 완성 · 검토 후 발송', en: 'Draft ready · review & send' },
  toLabel: { ko: 'To', en: 'To' },
  subjectLabel: { ko: 'Subject', en: 'Subject' },
  sendBtn: { ko: '검토 후 발송', en: 'Review & send' },
  // Desktop / Mobile chrome
  appTitle: { ko: '재보험사 매칭', en: 'Reinsurer Matching' },
  panelMeta: {
    ko: '패널 데이터: 최근 5년 인수 이력 · 선호 라인',
    en: 'Panel data: 5-year underwriting history · preferred lines',
  },
  candidatesHeader: { ko: '재보험사 후보 · 적합도 순', en: 'Reinsurer candidates · by fit' },
} satisfies Record<string, L>;
