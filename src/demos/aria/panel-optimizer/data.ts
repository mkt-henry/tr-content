import type { L } from '../_shared/i18n';

/** 견적 1건 */
export interface Quote {
  id: string;
  /** 재보험사명 (고유명사 — 번역 안 함) */
  name: string;
  /** 신용등급 표기 (S&P) */
  rating: string;
  /** 등급 정렬/임계용 수치 (AA−=7, A+=6, A=5, A−=4) */
  ratingTier: number;
  /** 제공 라인 % */
  offered: number;
  /** 견적 ROL % */
  rol: number;
  /** 핵심 조건 요약 */
  terms: L;
  /** false = 비동시(워딩 정합성 플래그) */
  concurrent: boolean;
  /** 플래그 사유 (비동시 등) — 있으면 정규화 후 경고 표시 */
  flag?: L;
}

/** 패널 1라인 (서명 라인 배분) */
export interface PanelLine {
  quoteId: string;
  /** 서명 라인 % */
  line: number;
}

/** 최적화 결과 패널 */
export interface Panel {
  /** 합 100 */
  lines: PanelLine[];
  /** 블렌디드 ROL % */
  blendedRol: number;
  /** 가중평균등급 표기 */
  avgRating: string;
  /** 총보험료 (억원) */
  premiumEok: number;
  /** 만기 대비 절감 (억원) */
  savingEok: number;
  /** 절감률 % */
  savingPct: number;
  /** 적용 제약 라벨 */
  constraintLabel: L;
  /** 근거 불릿 */
  rationale: L[];
}

/** 배치 헤더 */
export const PLACEMENT = {
  treaty: { ko: 'ABC손해보험 재산 Cat XoL — Layer 2', en: 'ABC P&C — Property Cat XoL, Layer 2' } as L,
  cover: { ko: '₩300억 xs ₩200억', en: 'KRW 30bn xs 20bn' } as L,
  /** 만기 요율 % */
  expiringRol: 18.0,
  /** 커버 한도 (억원) — 보험료 = ROL% × limitEok */
  limitEok: 300,
};

/** 최소 적격 등급 (A−) */
export const MIN_RATING: { label: L; tier: number } = {
  label: { ko: '최소등급 A−', en: 'Min rating A−' },
  tier: 4,
};

export const QUOTES: Quote[] = [
  { id: 'munich', name: 'Munich Re', rating: 'AA−', ratingTier: 7, offered: 35, rol: 17.2,
    terms: { ko: '1 부활 @100%, 표준', en: '1 reinstatement @100%, standard' }, concurrent: true },
  { id: 'swiss', name: 'Swiss Re', rating: 'AA−', ratingTier: 7, offered: 30, rol: 17.5,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'scor', name: 'SCOR', rating: 'A+', ratingTier: 6, offered: 25, rol: 16.8,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'hannover', name: 'Hannover Re', rating: 'AA−', ratingTier: 7, offered: 20, rol: 17.8,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'koreanre', name: 'Korean Re', rating: 'A', ratingTier: 5, offered: 25, rol: 16.5,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'lloyds', name: "Lloyd's Synd 2001", rating: 'A', ratingTier: 5, offered: 15, rol: 19.5,
    terms: { ko: '비동시 · 사이버 면책', en: 'Non-concurrent · cyber exclusion' }, concurrent: false,
    flag: { ko: '비동시 조건(사이버 면책) — 정합성 미달', en: 'Non-concurrent (cyber exclusion) — fails alignment' } },
];

/** v1 — 1사 최대 25% */
export const BASE_PANEL: Panel = {
  lines: [
    { quoteId: 'koreanre', line: 25 },
    { quoteId: 'scor', line: 25 },
    { quoteId: 'munich', line: 25 },
    { quoteId: 'swiss', line: 25 },
  ],
  blendedRol: 17.0,
  avgRating: 'A+',
  premiumEok: 51,
  savingEok: 3,
  savingPct: 5.6,
  constraintLabel: { ko: '1사 최대 25%', en: 'Max 25% per reinsurer' },
  rationale: [
    { ko: "Lloyd's 제외 — ROL 최고(19.5%) + 비동시(사이버 면책)로 워딩 정합성 미달",
      en: "Lloyd's excluded — highest ROL (19.5%) + non-concurrent (cyber exclusion)" },
    { ko: 'Munich Re 35%→25% 캡 — 1사 집중 한도 적용해 분산',
      en: 'Munich Re capped 35%→25% — single-reinsurer limit for diversification' },
    { ko: 'Korean Re·SCOR 우선 — 최저 ROL(16.5/16.8%) + 적격 등급',
      en: 'Korean Re & SCOR first — lowest ROL (16.5/16.8%), eligible rating' },
    { ko: '결과 — 블렌디드 17.0%, 만기 −1.0pt, 보험료 5.6% 절감, 평균등급 A+',
      en: 'Result — blended 17.0%, −1.0pt vs expiring, 5.6% premium saving, avg A+' },
  ],
};

/** v2 — 1사 최대 20% (분산 강화) */
export const TIGHT_PANEL: Panel = {
  lines: [
    { quoteId: 'koreanre', line: 20 },
    { quoteId: 'scor', line: 20 },
    { quoteId: 'munich', line: 20 },
    { quoteId: 'swiss', line: 20 },
    { quoteId: 'hannover', line: 20 },
  ],
  blendedRol: 17.16,
  avgRating: 'A+',
  premiumEok: 51.5,
  savingEok: 2.5,
  savingPct: 4.6,
  constraintLabel: { ko: '1사 최대 20%', en: 'Max 20% per reinsurer' },
  rationale: [
    { ko: '1사 한도 25%→20%로 강화 — Hannover Re 추가해 5사로 분산',
      en: 'Single-line limit tightened 25%→20% — Hannover Re added, 5-way spread' },
    { ko: '트레이드오프 — 블렌디드 17.16% (+0.16pt) 대신 집중도↓·안정성↑',
      en: 'Trade-off — blended 17.16% (+0.16pt) for lower concentration, higher resilience' },
    { ko: 'Lloyd\'s 여전히 제외 — 비동시 조건 유지',
      en: "Lloyd's still excluded — non-concurrent terms remain" },
  ],
};

export const STR = {
  brand: { ko: 'Panel Optimizer', en: 'Panel Optimizer' } as L,
  required: { ko: '필요 capacity', en: 'Required capacity' } as L,
  expiring: { ko: '만기 요율', en: 'Expiring ROL' } as L,
  quotesHeader: { ko: '재보험사 견적', en: 'Reinsurer quotes' } as L,
  colReinsurer: { ko: '재보험사', en: 'Reinsurer' } as L,
  colRating: { ko: '등급', en: 'Rating' } as L,
  colOffered: { ko: '제공 라인', en: 'Offered' } as L,
  colRol: { ko: 'ROL', en: 'ROL' } as L,
  colTerms: { ko: '조건', en: 'Terms' } as L,
  normalizeBtn: { ko: '견적 정규화', en: 'Normalize quotes' } as L,
  normalizing: { ko: '정규화 중…', en: 'Normalizing…' } as L,
  normalized: { ko: '정규화 완료', en: 'Normalized' } as L,
  optimizeBtn: { ko: 'AI 최적 패널 생성', en: 'Build optimal panel' } as L,
  optimizing: { ko: '최적화 중…', en: 'Optimizing…' } as L,
  optimized: { ko: '최적 패널', en: 'Optimal panel' } as L,
  tightenBtn: { ko: '1사 한도 20%로 강화', en: 'Tighten to 20% max' } as L,
  panelHeader: { ko: 'AI 최적 인수 패널', en: 'AI optimal panel' } as L,
  blendedRol: { ko: '블렌디드 ROL', en: 'Blended ROL' } as L,
  avgRating: { ko: '가중평균등급', en: 'Weighted avg rating' } as L,
  premium: { ko: '총보험료', en: 'Total premium' } as L,
  saving: { ko: '만기 대비 절감', en: 'Saving vs expiring' } as L,
  rationaleHeader: { ko: '구성 근거', en: 'Rationale' } as L,
  excluded: { ko: '제외', en: 'Excluded' } as L,
  capped: { ko: '한도 캡', en: 'Capped' } as L,
  signed: { ko: '서명 라인', en: 'Signed line' } as L,
};
