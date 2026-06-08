import type { L, Lang } from '../_shared/i18n';

export type Verdict = 'match' | 'mismatch' | 'missing';

/** AI 수정안 — 문제 조항(mismatch/missing)에만 존재 */
export interface Fix {
  /** 워딩에서 교체될 기존 문구 (missing이면 빈 문자열) */
  from: string;
  /** 삽입/교체할 제안 문구 */
  to: string;
  /** 수정 사유 설명 */
  note: L;
}

export interface Clause {
  /** 안정 key — appliedIds/타깃에 사용 */
  key: string;
  title: L;
  /** 조항 원문은 영문 고정 (실무 리얼리티) */
  slipText: string;
  /** 누락 항목은 빈 문자열 */
  wordingText: string;
  verdict: Verdict;
  note: L;
  fix?: Fix;
}

export const VERDICT_META: Record<Verdict, { label: L; badge: string; dot: string }> = {
  match: {
    label: { ko: '일치', en: 'Match' },
    badge: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
    dot: '#34d399',
  },
  mismatch: {
    label: { ko: '불일치', en: 'Mismatch' },
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    dot: '#fb7185',
  },
  missing: {
    label: { ko: '누락', en: 'Missing' },
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    dot: '#fbbf24',
  },
};

/** 검사 순서 = 배열 순서 */
export const CLAUSES: Clause[] = [
  {
    key: 'limit',
    title: { ko: '사고당 한도', en: 'Per-Occurrence Limit' },
    slipText: 'Per occurrence limit: KRW 30,000,000,000 (any one loss occurrence).',
    wordingText: 'The Reinsurer shall be liable up to KRW 30,000,000,000 each and every loss occurrence.',
    verdict: 'match',
    note: { ko: '슬립과 워딩 모두 사고당 ₩300억 — 일치', en: 'Both state ₩30bn per occurrence — consistent' },
  },
  {
    key: 'retention',
    title: { ko: '자기보유', en: 'Retention' },
    slipText: 'Retention: KRW 6,000,000,000 each and every loss, ultimate net loss basis.',
    wordingText: 'Cedant retains KRW 6,000,000,000 ultimate net loss each and every loss.',
    verdict: 'match',
    note: { ko: '자기보유 ₩60억 UNL 기준 — 일치', en: 'Retention ₩6bn on UNL basis — consistent' },
  },
  {
    key: 'reinstatement',
    title: { ko: 'Reinstatement', en: 'Reinstatement' },
    slipText: 'Reinstatements: 2 (two) at 100% additional premium, pro rata as to amount.',
    wordingText: 'One (1) reinstatement at 100% additional premium, pro rata as to amount.',
    verdict: 'mismatch',
    note: {
      ko: '슬립은 2회 복원, 워딩은 1회로 기재 — 복원 횟수 불일치',
      en: 'Slip allows 2 reinstatements but wording states 1 — count mismatch',
    },
    fix: {
      from: 'One (1) reinstatement at 100% additional premium, pro rata as to amount.',
      to: 'Two (2) reinstatements at 100% additional premium, pro rata as to amount.',
      note: { ko: '워딩 복원 횟수를 슬립 기준 2회로 정정', en: 'Correct wording to 2 reinstatements per the slip' },
    },
  },
  {
    key: 'hours',
    title: { ko: 'Hours Clause', en: 'Hours Clause' },
    slipText: 'Hours Clause: 168 consecutive hours for windstorm; 72 hours for earthquake.',
    wordingText: 'Hours Clause: 72 consecutive hours for windstorm and earthquake alike.',
    verdict: 'mismatch',
    note: {
      ko: '슬립은 풍수해 168시간, 워딩은 72시간 — 시간 기준 불일치 (담보 축소 위험)',
      en: 'Slip sets 168h for windstorm; wording says 72h — hours basis mismatch (coverage-narrowing risk)',
    },
    fix: {
      from: 'Hours Clause: 72 consecutive hours for windstorm and earthquake alike.',
      to: 'Hours Clause: 168 consecutive hours for windstorm; 72 hours for earthquake.',
      note: { ko: '풍수해 시간 기준을 슬립의 168시간으로 정정', en: 'Restore the 168-hour windstorm basis from the slip' },
    },
  },
  {
    key: 'premium',
    title: { ko: '보험료', en: 'Premium' },
    slipText: 'Minimum & deposit premium: KRW 2,400,000,000, payable quarterly.',
    wordingText: 'MDP of KRW 2,400,000,000 payable in four equal quarterly instalments.',
    verdict: 'match',
    note: { ko: 'MDP ₩24억 분기 납입 — 일치', en: 'MDP ₩2.4bn payable quarterly — consistent' },
  },
  {
    key: 'period',
    title: { ko: '보험기간', en: 'Period' },
    slipText: 'Period: 12 months from 1 July 2026, both days inclusive, LSW.',
    wordingText: 'This Agreement covers losses occurring during 12 months from 1 July 2026.',
    verdict: 'match',
    note: { ko: '2026.07.01부터 12개월 — 일치', en: '12 months from 1 Jul 2026 — consistent' },
  },
  {
    key: 'exclusions',
    title: { ko: '면책 조항', en: 'Exclusions' },
    slipText: 'Exclusions: Nuclear, War, and Cyber (LMA5400) to apply.',
    wordingText: 'Exclusions: Nuclear and War risks excluded.',
    verdict: 'missing',
    note: {
      ko: '슬립은 Cyber(LMA5400) 면책을 명시하나 워딩에 누락 — 면책 범위 누락',
      en: 'Slip names a Cyber exclusion (LMA5400) but wording omits it — exclusion gap',
    },
    fix: {
      from: 'Exclusions: Nuclear and War risks excluded.',
      to: 'Exclusions: Nuclear, War, and Cyber (LMA5400) risks excluded.',
      note: { ko: 'Cyber(LMA5400) 면책을 워딩에 추가', en: 'Add the Cyber (LMA5400) exclusion to the wording' },
    },
  },
];

/** 요약 카운트 — 데이터에서 계산 (하드코딩 금지) */
export function summary() {
  const by = (v: Verdict) => CLAUSES.filter((c) => c.verdict === v).length;
  return { total: CLAUSES.length, match: by('match'), mismatch: by('mismatch'), missing: by('missing') };
}

/** 수정안이 있는 조항 (문제 3건) */
export const FIX_CLAUSES = CLAUSES.filter((c) => c.fix);

/** 문서 메타 — 패널 헤더용 */
export const DOCS = {
  slip: {
    title: { ko: '슬립 (Slip)', en: 'Slip' },
    sub: { ko: 'Korean Re Property Cat XoL 2026', en: 'Korean Re Property Cat XoL 2026' },
  },
  wording: {
    title: { ko: '워딩 (Wording)', en: 'Wording' },
    sub: { ko: 'Treaty Wording Draft v0.0', en: 'Treaty Wording Draft v0.0' },
  },
} satisfies Record<string, { title: L; sub: L }>;

/** 앱 UI 문자열 */
export const STR = {
  checkBtn: { ko: '정합성 검사', en: 'Run consistency check' },
  checking: { ko: '대조 중…', en: 'Checking…' },
  checkDone: { ko: '검사 완료', en: 'Checked' },
  awaiting: { ko: '정합성 검사를 실행하세요', en: 'Run the consistency check' },
  findingsTitle: { ko: '검사 결과', en: 'Findings' },
  sumTotal: { ko: '{n}개 조항', en: '{n} clauses' },
  sumMatch: { ko: '일치 {n}', en: '{n} match' },
  sumMismatch: { ko: '불일치 {n}', en: '{n} mismatch' },
  sumMissing: { ko: '누락 {n}', en: '{n} missing' },
  fixLabel: { ko: 'AI 수정안', en: 'AI fix' },
  applyAllBtn: { ko: '전체 반영 ({n}건)', en: 'Apply all ({n})' },
  applyingLabel: { ko: '반영 중…', en: 'Applying…' },
  appliedLabel: { ko: '반영됨', en: 'Applied' },
  reportBadge: { ko: '검토 완료 — 체결 가능', en: 'Review complete — ready to bind' },
  toast: { ko: '수정안 {n}건이 워딩에 반영되었습니다', en: '{n} fixes applied to the wording' },
  toastSub: { ko: '체결 전 최종 검토본으로 내보낼 수 있습니다', en: 'Exportable as the pre-bind final draft' },
  slipQuote: { ko: '슬립', en: 'Slip' },
  wordingQuote: { ko: '워딩', en: 'Wording' },
  missingInWording: { ko: '(워딩에 해당 문구 없음)', en: '(no corresponding clause in wording)' },
} satisfies Record<string, L>;

/** '{n}' 치환은 _shared/i18n의 fmt 사용 — 여기선 타입만 맞춘다 */
export type { Lang };
