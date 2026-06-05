export const STAGES = [
  { id: 'nego', label: '협의중' },
  { id: 'quote', label: '견적발송' },
  { id: 'binding', label: '바인딩대기' },
  { id: 'done', label: '완료' },
] as const;

export interface RenewalCard {
  id: string;
  title: string;
  cedant: string;
  klass: string;
  reinsurer: string;
  /** null = 완료 */
  dday: number | null;
  stage: (typeof STAGES)[number]['id'];
}

export const RENEWALS: RenewalCard[] = [
  { id: 'koreanre', title: 'Property Cat XoL', cedant: 'Korean Re', klass: 'Property Cat', reinsurer: 'Swiss Re', dday: 28, stage: 'nego' },
  { id: 'hyundai', title: 'Engineering CAR', cedant: '현대해상', klass: 'Engineering', reinsurer: 'Munich Re', dday: 45, stage: 'nego' },
  { id: 'kbmarine', title: 'Marine Hull Treaty', cedant: 'KB손보', klass: 'Marine', reinsurer: 'Swiss Re Corp. Sol.', dday: 12, stage: 'quote' },
  { id: 'samsung', title: 'Aviation Hull & Liab.', cedant: '삼성화재', klass: 'Aviation', reinsurer: 'AXA XL', dday: 9, stage: 'quote' },
  { id: 'db', title: 'Casualty XoL', cedant: 'DB손보', klass: 'Casualty', reinsurer: 'SCOR', dday: 4, stage: 'binding' },
  { id: 'hanwha', title: 'Energy Fac', cedant: '한화손보', klass: 'Energy', reinsurer: 'Hannover Re', dday: null, stage: 'done' },
];

export interface BriefItem {
  id: string;
  title: string;
  fullText: string;
}

/** KB Marine Hull (D-12) 미팅 브리핑 4카드 */
export const BRIEFING: BriefItem[] = [
  {
    id: 'profile',
    title: '상대 재보험사 프로필',
    fullText:
      'Swiss Re Corporate Solutions — Marine 글로벌 2위. APAC 허브는 싱가포르, 담당 언더라이터 M. Keller(관계 8년). 최근 한국 시장 Marine 포트폴리오 확대 의지를 표명.',
  },
  {
    id: 'trend',
    title: '최근 인수 동향',
    fullText:
      '2025년 Marine Hull 시장은 RoL +6% 인상 기조. IMO 규제 강화로 노후 선대에는 보수적이나 Cargo capacity는 확대 중. 무사고 계정에는 rate 동결 사례 다수.',
  },
  {
    id: 'terms',
    title: '지난 갱신 조건 (2025)',
    fullText:
      'Premium USD 1.2M · Deductible USD 250K · Hull 한도 USD 30M. 최근 24개월 무사고, 누적 손해율 41%로 양호.',
  },
  {
    id: 'points',
    title: '추천 논점',
    fullText:
      '① 무사고 실적 근거로 rate 동결 협상\n② 선대 평균 선령 개선 자료 제시 (12.4년 → 9.8년)\n③ Cargo 물량 패키지로 추가 할인 유도',
  },
];

/** 지난 조건 카드의 스탯 칩 (스트리밍 완료 후 카운트업) */
export const TERMS_STATS = [
  { label: 'Premium', value: 'USD 1.2M' },
  { label: '손해율', value: '41%', countTo: 41 },
  { label: '무사고', value: '24개월' },
];
