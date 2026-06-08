# 슬립-워딩 정합성 검사 데모 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ARIA Demo Studio에 "슬립-워딩 정합성 검사" 데모(슬립↔워딩 조항 대조 → 불일치/누락 검출 → 수정안 반영)를 추가한다.

**Architecture:** 기존 데모 패턴 — `src/demos/aria/slip-check/`에 zustand 스토어 + 자동 재생 시나리오 + Desktop/Mobile. registry glob 자동 등록. 스펙: `docs/superpowers/specs/2026-06-07-slip-check-design.md`

**Tech Stack:** React 18 + TypeScript + zustand 5 + framer-motion 11 + Tailwind 4 + lucide-react. 테스트 러너 없음 — 검증은 `npx tsc --noEmit` + dev 서버 수동 재생.

**검증 공통:** 각 태스크 ① `npx tsc --noEmit` 통과 ② 마지막 태스크에서 `npm run build`. 커밋은 태스크당 1회, 해당 파일만 (작업 트리에 무관한 미커밋 변경 다수 — 절대 같이 커밋 금지).

---

### Task 1: 데이터 모델 + 더미 데이터 (`data.ts`)

**Files:**
- Create: `src/demos/aria/slip-check/data.ts`

- [ ] **Step 1: data.ts 작성**

```ts
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
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/slip-check/data.ts
git commit -m "feat(slip-check): 데이터 모델 — 7개 조항 (일치 4·불일치 2·누락 1) + 수정안"
```

---

### Task 2: zustand 스토어 (`state.ts`)

**Files:**
- Create: `src/demos/aria/slip-check/state.ts`

inbox-triage/cat-warroom에서 확립한 runId 가드 + phase 가드 패턴을 따른다.

- [ ] **Step 1: state.ts 작성**

```ts
import { create } from 'zustand';
import { CLAUSES, FIX_CLAUSES } from './data';

export type Phase = 'ready' | 'scanning' | 'done';

interface SlipCheckState {
  phase: Phase;
  /** 판정 칩이 부착된 조항 수 — 스캔 하이라이트는 인덱스 scannedCount에 표시 */
  scannedCount: number;
  /** 수정안이 반영된 조항 key */
  appliedIds: string[];
  applying: boolean;
  reportReady: boolean;
  /** ready → scanning → done: 조항 순차 대조 */
  startScan: () => void;
  /** v2 시작 상태 — 애니메이션 없이 검사 완료로 세팅 */
  seedDone: () => void;
  /** 수정안 순차 반영 */
  applyAll: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useSlipCheck = create<SlipCheckState>((set, get) => ({
  phase: 'ready',
  scannedCount: 0,
  appliedIds: [],
  applying: false,
  reportReady: false,

  startScan: () => {
    if (get().phase !== 'ready') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (let i = 1; i <= CLAUSES.length; i++) {
        await sleep(700);
        if (id !== runId) return;
        set({ scannedCount: i });
      }
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  seedDone: () => {
    runId++;
    set({ phase: 'done', scannedCount: CLAUSES.length, appliedIds: [], applying: false, reportReady: false });
  },

  applyAll: () => {
    const { phase, applying, appliedIds } = get();
    if (phase !== 'done' || applying || appliedIds.length > 0) return;
    const id = ++runId;
    set({ applying: true });
    void (async () => {
      for (let i = 0; i < FIX_CLAUSES.length; i++) {
        await sleep(600);
        if (id !== runId) return;
        set((s) => ({ appliedIds: [...s.appliedIds, FIX_CLAUSES[i].key] }));
      }
      await sleep(300);
      if (id !== runId) return;
      set({ applying: false, reportReady: true });
    })();
  },

  reset: () => {
    runId++;
    set({ phase: 'ready', scannedCount: 0, appliedIds: [], applying: false, reportReady: false });
  },
}));
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/slip-check/state.ts
git commit -m "feat(slip-check): zustand 스토어 — ready/scanning/done + 수정안 반영"
```

---

### Task 3: 공용 위젯 (`widgets.tsx`)

**Files:**
- Create: `src/demos/aria/slip-check/widgets.tsx`

문서 패널(조항 행, 스캔 하이라이트, redline), 파인딩 바/리스트(수정안 카드, 리포트 배지)를 담는다. CountUp 류 없음.

- [ ] **Step 1: widgets.tsx 작성**

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { CLAUSES, DOCS, FIX_CLAUSES, STR, VERDICT_META, summary, type Clause } from './data';
import { useSlipCheck } from './state';

/** 판정 칩 */
function VerdictChip({ clause }: { clause: Clause }) {
  const lang = useLang();
  const m = VERDICT_META[clause.verdict];
  return (
    <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium', m.badge)}>
      {pick(m.label, lang)}
    </span>
  );
}

/**
 * 문서 패널 — 한쪽(slip|wording) 조항을 렌더.
 * scanning 중 현재 조항 하이라이트, done에서 판정 테두리. wording은 반영 시 redline.
 */
export function DocPanel({ side }: { side: 'slip' | 'wording' }) {
  const { phase, scannedCount, appliedIds } = useSlipCheck();
  const lang = useLang();
  const doc = DOCS[side];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 shrink-0 text-violet-400" />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-zinc-200">{pick(doc.title, lang)}</p>
          <p className="truncate text-[10px] text-zinc-600">{pick(doc.sub, lang)}</p>
        </div>
      </div>
      <div className="demo-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {CLAUSES.map((c, i) => {
          const analyzed = scannedCount > i;
          const scanningNow = phase === 'scanning' && scannedCount === i;
          const applied = appliedIds.includes(c.key);
          const text = side === 'slip' ? c.slipText : c.wordingText;
          const m = VERDICT_META[c.verdict];
          return (
            <div
              key={c.key}
              data-demo-id={`clause-${side}-${c.key}`}
              className={cn(
                'rounded-lg border px-3 py-2 transition-colors',
                scanningNow
                  ? 'border-violet-400/50 bg-violet-500/[0.08] ring-1 ring-inset ring-violet-400/40'
                  : 'border-white/[0.06] bg-white/[0.02]',
                analyzed && c.verdict !== 'match' && !scanningNow &&
                  (c.verdict === 'mismatch' ? 'border-rose-500/30' : 'border-amber-500/30'),
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-zinc-500">{pick(c.title, lang)}</p>
                <AnimatePresence>
                  {analyzed && (
                    <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
                      <VerdictChip clause={c} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {/* 본문 */}
              {side === 'wording' && c.wordingText === '' ? (
                <p className="text-[11px] italic leading-relaxed text-zinc-600">{pick(STR.missingInWording, lang)}</p>
              ) : applied && c.fix ? (
                <p className="text-[11.5px] leading-relaxed text-zinc-300">
                  <span className="text-rose-400/70 line-through decoration-rose-500/50">{c.fix.from}</span>{' '}
                  <motion.span
                    initial={{ backgroundColor: 'rgba(139,92,246,0.35)' }}
                    animate={{ backgroundColor: 'rgba(139,92,246,0.14)' }}
                    transition={{ duration: 1.2 }}
                    className="rounded px-1 font-medium text-violet-200"
                  >
                    {c.fix.to}
                  </motion.span>
                </p>
              ) : (
                <p
                  className={cn(
                    'text-[11.5px] leading-relaxed',
                    analyzed && c.verdict !== 'match' ? 'text-zinc-200' : 'text-zinc-400',
                  )}
                >
                  {text}
                </p>
              )}
              {/* 판정 설명 — 문제 조항만, done에서 */}
              {analyzed && c.verdict !== 'match' && (
                <p className="mt-1 text-[10px] leading-relaxed" style={{ color: m.dot }}>
                  {pick(c.note, lang)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 파인딩 요약 바 — done에서 등장 */
export function FindingsSummary() {
  const phase = useSlipCheck((s) => s.phase);
  const lang = useLang();
  if (phase !== 'done') return null;
  const s = summary();
  return (
    <motion.div
      data-demo-id="summary-bar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" />
      <span className="text-[11px] font-medium text-zinc-300">{fmt(pick(STR.sumTotal, lang), { n: s.total })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] text-emerald-300">{fmt(pick(STR.sumMatch, lang), { n: s.match })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] font-semibold text-rose-300">{fmt(pick(STR.sumMismatch, lang), { n: s.mismatch })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] font-semibold text-amber-300">{fmt(pick(STR.sumMissing, lang), { n: s.missing })}</span>
    </motion.div>
  );
}

/** 수정안 카드 1건 */
function FixCard({ clause }: { clause: Clause }) {
  const { appliedIds } = useSlipCheck();
  const lang = useLang();
  const applied = appliedIds.includes(clause.key);
  if (!clause.fix) return null;
  return (
    <motion.div
      data-demo-id={`finding-${clause.key}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        applied ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-white/[0.07] bg-white/[0.02]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <VerdictChip clause={clause} />
          <span className="text-[11.5px] font-semibold text-zinc-200">{pick(clause.title, lang)}</span>
        </span>
        {applied && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> {pick(STR.appliedLabel, lang)}
          </span>
        )}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-violet-400">
        <Sparkles className="h-3 w-3" /> {pick(STR.fixLabel, lang)}
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-300">
        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
        <span className="font-medium text-violet-200">{clause.fix.to}</span>
      </p>
      <p className="mt-1 text-[10px] text-zinc-500">{pick(clause.fix.note, lang)}</p>
    </motion.div>
  );
}

/** 파인딩 패널 — 수정안 카드 + 전체 반영 버튼 + 리포트 배지. done에서 등장 */
export function FindingsPanel() {
  const { phase, appliedIds, applying, reportReady, applyAll } = useSlipCheck();
  const lang = useLang();
  if (phase !== 'done') return null;
  const notApplied = appliedIds.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">{pick(STR.findingsTitle, lang)}</p>
        {notApplied && (
          <button
            data-demo-id="apply-all"
            onClick={applyAll}
            disabled={applying}
            className="rounded-lg bg-violet-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-violet-400 disabled:opacity-60"
          >
            {applying ? pick(STR.applyingLabel, lang) : fmt(pick(STR.applyAllBtn, lang), { n: FIX_CLAUSES.length })}
          </button>
        )}
      </div>
      {FIX_CLAUSES.map((c) => (
        <FixCard key={c.key} clause={c} />
      ))}
      <AnimatePresence>
        {reportReady && (
          <motion.div
            data-demo-id="report-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {pick(STR.reportBadge, lang)}
            </p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-500">{fmt(pick(STR.toast, lang), { n: FIX_CLAUSES.length })}</p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-600">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0. (`const m`은 조항별 판정 설명의 `style={{ color: m.dot }}`에서 사용되므로 unused 아님)

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/slip-check/widgets.tsx
git commit -m "feat(slip-check): 문서 패널(스캔·redline)·파인딩 요약·수정안 카드 위젯"
```

---

### Task 4: 데스크톱 레이아웃 (`Desktop.tsx`)

**Files:**
- Create: `src/demos/aria/slip-check/Desktop.tsx`

좌우 문서 패널 50:50 + 하단 파인딩 바, 우측 사이드에 파인딩 패널(수정안). 헤더에 검사 버튼.

- [ ] **Step 1: Desktop.tsx 작성**

```tsx
import { FileCheck, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useSlipCheck } from './state';
import { DocPanel, FindingsPanel, FindingsSummary } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, startScan } = useSlipCheck();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0e0b14] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/90 text-white">
          <FileCheck className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Verify <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <button
          data-demo-id="check-run"
          onClick={startScan}
          disabled={phase !== 'ready'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'ready' && 'bg-violet-500 text-white hover:bg-violet-400',
            phase === 'scanning' && 'bg-violet-500/20 text-violet-300',
            phase === 'done' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'ready' && pick(STR.checkBtn, lang)}
          {phase === 'scanning' && pick(STR.checking, lang)}
          {phase === 'done' && pick(STR.checkDone, lang)}
        </button>
      </header>

      {/* 본문: 좌우 문서 + 우측 파인딩 사이드 */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06]">
              <DocPanel side="slip" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <DocPanel side="wording" />
            </div>
          </div>
          <FindingsSummary />
        </div>
        <aside className="demo-scroll w-[300px] shrink-0 overflow-y-auto border-l border-white/[0.06] bg-[#0c0a12] p-3.5">
          <FindingsPanel />
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/slip-check/Desktop.tsx
git commit -m "feat(slip-check): 데스크톱 — 좌우 문서 패널 + 파인딩 사이드"
```

---

### Task 5: 모바일 레이아웃 (`Mobile.tsx`)

**Files:**
- Create: `src/demos/aria/slip-check/Mobile.tsx`

워딩 문서 중심 단일 패널 + 하단 파인딩 리스트 인라인 (슬립은 파인딩 카드 내 인용으로 충분 — 모바일에선 워딩만 표시).

- [ ] **Step 1: Mobile.tsx 작성**

```tsx
import { FileCheck, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useSlipCheck } from './state';
import { DocPanel, FindingsPanel, FindingsSummary } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, startScan } = useSlipCheck();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0e0b14] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-violet-500/90 text-white">
          <FileCheck className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Verify</span>
        <button
          data-demo-id="check-run"
          onClick={startScan}
          disabled={phase !== 'ready'}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
            phase === 'ready' && 'bg-violet-500 text-white',
            phase === 'scanning' && 'bg-violet-500/20 text-violet-300',
            phase === 'done' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {phase === 'ready' && pick(STR.checkBtn, lang)}
          {phase === 'scanning' && pick(STR.checking, lang)}
          {phase === 'done' && pick(STR.checkDone, lang)}
        </button>
      </header>

      {/* 워딩 문서 — 상단 고정 비율 */}
      <div className="flex min-h-0 flex-[3] flex-col border-b border-white/[0.06]">
        <DocPanel side="wording" />
        <FindingsSummary />
      </div>

      {/* 파인딩 리스트 — 하단 인라인 */}
      <div className="demo-scroll min-h-0 flex-[2] overflow-y-auto p-3.5">
        <FindingsPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/slip-check/Mobile.tsx
git commit -m "feat(slip-check): 모바일 — 워딩 패널 + 인라인 파인딩"
```

---

### Task 6: 시나리오 + 갤러리 등록 (`scenario.ts`, `index.ts`)

**Files:**
- Create: `src/demos/aria/slip-check/scenario.ts`
- Create: `src/demos/aria/slip-check/index.ts`

타이밍 근거: v1 — 스캔 7조항 × 700ms + 500ms = 5400ms → 5800ms 대기. v2 — 반영 3건 × 600ms + 300ms = 2100ms → 2800ms 대기.

- [ ] **Step 1: scenario.ts 작성**

```ts
import type { Scenario } from '../../../engine/types';
import { useSlipCheck } from './state';

const st = () => useSlipCheck.getState();

/** v1 — 불일치 자동 검출: 검사 클릭 → 조항 순차 대조 → 불일치/누락 플래그 → 요약 */
export const checkScenario: Scenario = {
  id: 'slip-check-scan',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'check-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'check-run', run: () => st().startScan() },
    { kind: 'wait', ms: 5800 },
    { kind: 'cursor', target: 'clause-wording-hours', ms: 800 },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'summary-bar', ms: 700 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 수정안 반영: 검사 완료 상태 → 전체 반영 → redline 순차 → 리포트 배지 */
export const applyScenario: Scenario = {
  id: 'slip-check-apply',
  steps: [
    { kind: 'do', run: () => st().seedDone() },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'apply-all', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'apply-all', run: () => st().applyAll() },
    { kind: 'wait', ms: 3000 },
    { kind: 'cursor', target: 'report-badge', ms: 700 },
    { kind: 'wait', ms: 1800 },
  ],
};
```

- [ ] **Step 2: index.ts 작성**

```ts
import { FileCheck } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useSlipCheck } from './state';
import { applyScenario, checkScenario } from './scenario';

const slipCheck: FeatureDefinition = {
  id: 'slip-check',
  title: '슬립-워딩 정합성 검사',
  description: '체결 전 슬립과 워딩을 AI가 조항 단위로 대조 — 불일치·누락을 잡고 수정안까지 제안합니다.',
  icon: FileCheck,
  accent: '#8b5cf6',
  Desktop,
  Mobile,
  resetState: () => useSlipCheck.getState().reset(),
  variants: [
    {
      id: 'scan',
      label: '불일치 자동 검출',
      version: 'v1',
      sellingPoint: '리스크 차단',
      url: 'insightre.ai/verify',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(139,92,246,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(67,30,120,0.3), transparent 60%), linear-gradient(160deg, #120d1c 0%, #08060e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-purple-900/25 blur-[120px]',
        ],
      },
      scenario: checkScenario,
    },
    {
      id: 'apply',
      label: '수정안 반영 30초',
      version: 'v2',
      sellingPoint: '해결 자동화',
      url: 'insightre.ai/verify',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(124,58,237,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(50,20,90,0.3), transparent 60%), linear-gradient(165deg, #100b1a 0%, #07050d 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-purple-600/10 blur-[140px]'],
      },
      scenario: applyScenario,
    },
  ],
};

export default slipCheck;
```

- [ ] **Step 3: 전체 빌드** — `npm run build`, exit 0.

- [ ] **Step 4: 커밋**

```powershell
git add src/demos/aria/slip-check/scenario.ts src/demos/aria/slip-check/index.ts
git commit -m "feat(slip-check): 시나리오 2종 + 갤러리 등록"
```

---

### Task 7: 런타임 검증

**Files:** 없음 (검증만 — inbox-triage/cat-warroom Task와 동일: dev 서버 + 브라우저)

- [ ] **Step 1:** `npm run dev` 백그라운드 기동
- [ ] **Step 2:** 갤러리에 "슬립-워딩 정합성 검사" 카드(바이올렛, FileCheck 아이콘) 등장 확인
- [ ] **Step 3: v1 (데스크톱)** — 좌우 슬립/워딩 → "정합성 검사" → 조항 7개 순차 하이라이트 → 일치 4 초록 / Reinstatement·Hours 로즈 불일치 / Exclusions 앰버 누락 → 요약 바 "7개 조항 · 일치 4 · 불일치 2 · 누락 1"
- [ ] **Step 4: v2 (데스크톱)** — 검사 완료 시작 → "전체 반영" → 워딩에 redline 3건 순차(취소선+바이올렛) → "검토 완료 — 체결 가능" 배지
- [ ] **Step 5:** 모바일 양 변형 + EN 전환 + 스캔/반영 중 리셋 (고스트 타이머 없음)
- [ ] **Step 6:** 발견 이슈 수정·커밋 후 종료. 검증 스크린샷은 `.verify-slip-*.png`로 저장하고 검증 종료 시 삭제
