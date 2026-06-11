import type { L } from '../_shared/i18n';

export interface Stage {
  id: 'nego' | 'quote' | 'binding' | 'done';
  label: L;
}

export const STAGES: Stage[] = [
  { id: 'nego', label: { ko: '협의중', en: 'Negotiating' } },
  { id: 'quote', label: { ko: '견적발송', en: 'Quoted' } },
  { id: 'binding', label: { ko: '바인딩대기', en: 'Awaiting binding' } },
  { id: 'done', label: { ko: '완료', en: 'Done' } },
];

export interface RenewalCard {
  id: string;
  title: string;
  /** 출재사명 — 한국어 회사명은 언어별 표기 */
  cedant: L;
  klass: string;
  reinsurer: string;
  /** null = 완료 */
  dday: number | null;
  stage: Stage['id'];
}

export const RENEWALS: RenewalCard[] = [
  { id: 'koreanre', title: 'Property Cat XoL', cedant: { ko: 'Korean Re', en: 'Korean Re' }, klass: 'Property Cat', reinsurer: 'Swiss Re', dday: 28, stage: 'nego' },
  { id: 'hyundai', title: 'Engineering CAR', cedant: { ko: '현대해상', en: 'Hyundai M&F' }, klass: 'Engineering', reinsurer: 'Munich Re', dday: 45, stage: 'nego' },
  { id: 'kbmarine', title: 'Marine Hull Treaty', cedant: { ko: 'KB손보', en: 'KB Insurance' }, klass: 'Marine', reinsurer: 'Swiss Re Corp. Sol.', dday: 12, stage: 'quote' },
  { id: 'samsung', title: 'Aviation Hull & Liab.', cedant: { ko: '삼성화재', en: 'Samsung F&M' }, klass: 'Aviation', reinsurer: 'AXA XL', dday: 9, stage: 'quote' },
  { id: 'db', title: 'Casualty XoL', cedant: { ko: 'DB손보', en: 'DB Insurance' }, klass: 'Casualty', reinsurer: 'SCOR', dday: 4, stage: 'binding' },
  { id: 'hanwha', title: 'Energy Fac', cedant: { ko: '한화손보', en: 'Hanwha General' }, klass: 'Energy', reinsurer: 'Hannover Re', dday: null, stage: 'done' },
];

export interface BriefItem {
  id: string;
  title: L;
  fullText: L;
}

/** KB Marine Hull (D-12) 미팅 브리핑 4카드 */
export const BRIEFING: BriefItem[] = [
  {
    id: 'profile',
    title: { ko: '상대 재보험사 프로필', en: 'Counterparty profile' },
    fullText: {
      ko: 'Swiss Re Corporate Solutions — Marine 글로벌 2위. APAC 허브는 싱가포르, 담당 언더라이터 M. Keller(관계 8년). 최근 한국 시장 Marine 포트폴리오 확대 의지를 표명.',
      en: 'Swiss Re Corporate Solutions — #2 globally in Marine. APAC hub in Singapore; lead underwriter M. Keller (8-year relationship). Recently signalled intent to grow its Marine portfolio in the Korean market.',
    },
  },
  {
    id: 'trend',
    title: { ko: '최근 인수 동향', en: 'Recent underwriting trends' },
    fullText: {
      ko: '2025년 Marine Hull 시장은 RoL +6% 인상 기조. IMO 규제 강화로 노후 선대에는 보수적이나 Cargo capacity는 확대 중. 무사고 계정에는 rate 동결 사례 다수.',
      en: 'The 2025 Marine Hull market is trending toward RoL +6%. Tighter IMO regulation makes carriers cautious on ageing fleets, but Cargo capacity is expanding. Many clean accounts are seeing rate freezes.',
    },
  },
  {
    id: 'terms',
    title: { ko: '지난 갱신 조건 (2025)', en: 'Last renewal terms (2025)' },
    fullText: {
      ko: 'Premium USD 1.2M · Deductible USD 250K · Hull 한도 USD 30M. 최근 24개월 무사고, 누적 손해율 41%로 양호.',
      en: 'Premium USD 1.2M · Deductible USD 250K · Hull limit USD 30M. 24 months claims-free, with a healthy cumulative loss ratio of 41%.',
    },
  },
  {
    id: 'points',
    title: { ko: '추천 논점', en: 'Recommended talking points' },
    fullText: {
      ko: '① 무사고 실적 근거로 rate 동결 협상\n② 선대 평균 선령 개선 자료 제시 (12.4년 → 9.8년)\n③ Cargo 물량 패키지로 추가 할인 유도',
      en: '① Push for a rate freeze on the back of the clean loss record\n② Present the improved average fleet age (12.4 yrs → 9.8 yrs)\n③ Bundle Cargo volume to secure an additional discount',
    },
  },
];

export interface TermsStat {
  label: L;
  value: L;
  countTo?: number;
}

/** 지난 조건 카드의 스탯 칩 (스트리밍 완료 후 카운트업) */
export const TERMS_STATS: TermsStat[] = [
  { label: { ko: 'Premium', en: 'Premium' }, value: { ko: 'USD 1.2M', en: 'USD 1.2M' } },
  { label: { ko: '손해율', en: 'Loss ratio' }, value: { ko: '41%', en: '41%' }, countTo: 41 },
  { label: { ko: '무사고', en: 'Claims-free' }, value: { ko: '24개월', en: '24 mo' } },
];

/** 앱 UI 문자열 */
export const STR = {
  appTitle: { ko: '갱신 파이프라인', en: 'Renewal Pipeline' },
  poweredBy: { ko: 'ARIA by AlphaLenz', en: 'ARIA by AlphaLenz' },
  seasonDesktop: { ko: '2026 1/1 갱신 시즌 · {n}건 추적 중', en: '2026 1/1 renewal season · tracking {n}' },
  seasonMobile: { ko: '2026 1/1 갱신 시즌 · {n}건', en: '2026 1/1 renewal season · {n} deals' },
  done: { ko: '완료', en: 'Done' },
  briefingSuffix: { ko: '미팅 브리핑', en: 'Meeting Briefing' },
  idleTitle: { ko: '미팅 전 30초 브리핑', en: '30-second pre-meeting briefing' },
  idleBody: {
    ko: '상대 프로필 · 인수 동향 · 지난 조건 · 추천 논점을\nARIA가 자동으로 정리합니다',
    en: 'ARIA automatically pulls together the counterparty\nprofile, market trends, last terms and talking points',
  },
  generateBtn: { ko: '미팅 브리핑 생성', en: 'Generate briefing' },
  briefingDonePrefix: { ko: '브리핑 완료 · 미팅까지', en: 'Briefing ready · meeting in' },
} satisfies Record<string, L>;
