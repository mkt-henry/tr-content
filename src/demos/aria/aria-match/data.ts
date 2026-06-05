export const RISK_SUMMARY = {
  title: 'Korean Re 2026 Property Cat XoL',
  items: [
    { label: 'Layer', value: 'USD 250M xs 50M' },
    { label: 'RoL', value: '~8.2%' },
    { label: 'Reinstatement', value: '2 @ 100%' },
    { label: '익스포저', value: 'Cat 高 (태풍 집중)' },
  ],
};

export interface Candidate {
  id: string;
  name: string;
  region: string;
  score: number;
  reasons: string[];
}

/** 초기 표시 순서는 무작위 — 분석 후 점수순 재정렬 연출 */
export const CANDIDATES: Candidate[] = [
  {
    id: 'scor',
    name: 'SCOR',
    region: 'Paris',
    score: 82,
    reasons: ['APAC Property 확대 중', 'Reinstatement 조건 보수적'],
  },
  {
    id: 'swissre',
    name: 'Swiss Re',
    region: 'Zürich',
    score: 94,
    reasons: ['선호 라인: Property Cat APAC', '동일 Cedant 5년 연속 인수', 'Capacity 충분'],
  },
  {
    id: 'hannover',
    name: 'Hannover Re',
    region: 'Hannover',
    score: 78,
    reasons: ['가격 경쟁력 우수', '최근 Cat 익스포저 축소 기조'],
  },
  {
    id: 'lloyds',
    name: "Lloyd's Syn. 2001",
    region: 'London',
    score: 71,
    reasons: ['Fac 보완 capacity', 'Lead 가능성 낮음'],
  },
  {
    id: 'munichre',
    name: 'Munich Re',
    region: 'München',
    score: 89,
    reasons: ['Cat 모델링 강점', 'Korean Re 패널 기참여', 'RoL 선호대 부합'],
  },
];

export const EMAIL_SUBJECT = 'Korean Re 2026 Property Cat XoL — Renewal Submission & Capacity Enquiry';

export const EMAIL_BODY = `Dear Mr. Keller,

Further to our ongoing relationship on the Korean Re property catastrophe programme, we are pleased to submit the 2026 renewal for your consideration.

The placement comprises USD 250M xs 50M with two reinstatements at 100%, at an indicative Rate on Line of 8.2%. Loss activity remains within modelled expectations, with the top two layers loss-free since inception.

Given Swiss Re's continued leadership on this account since 2021 and your stated appetite for APAC property catastrophe risk, we would welcome your indication on a lead line of up to 25%.

Full submission pack attached. We would be glad to arrange a call this week.

Best regards,
Kim Junghae
Treasurer Reinsurance Brokers — Seoul`;
