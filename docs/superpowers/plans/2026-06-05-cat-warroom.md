# Cat 이벤트 워룸 데모 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ARIA Demo Studio에 "Cat 이벤트 워룸" 데모(태풍 속보 → SVG 지도 노출 식별 → 손해 집계 → 출재사 알림)를 추가한다.

**Architecture:** 기존 데모 패턴 — `src/demos/aria/cat-warroom/`에 zustand 스토어 + 자동 재생 시나리오 + Desktop/Mobile. SVG 지도는 표현 전용 `map.tsx`로 분리(props로 상태 수신, 스토어 구독 없음). registry glob 자동 등록. 스펙: `docs/superpowers/specs/2026-06-05-cat-warroom-design.md`

**Tech Stack:** React 18 + TypeScript + zustand 5 + framer-motion 11(SVG path/마커 애니메이션, `animate()` 카운트업) + Tailwind 4 + lucide-react. 테스트 러너 없음 — 검증은 `npx tsc --noEmit` + dev 서버 수동 재생.

**검증 공통:** 각 태스크는 ① `npx tsc --noEmit` 통과 ② 마지막 태스크에서 dev 서버 구동 검증. 커밋은 태스크당 1회, 해당 태스크 파일만 (작업 트리에 무관한 미커밋 변경 다수 — 절대 같이 커밋 금지).

---

### Task 1: 데이터 모델 + 더미 데이터 (`data.ts`)

**Files:**
- Create: `src/demos/aria/cat-warroom/data.ts`

- [ ] **Step 1: data.ts 작성**

```ts
import type { L, Lang } from '../_shared/i18n';

export type Severity = 'high' | 'medium' | 'low';

/** SVG viewBox(0 0 400 480) 기준 좌표 — 디자인용 근사치 */
export interface Point {
  x: number;
  y: number;
}

export interface CatEvent {
  name: L;
  /** 속보 배너 문구 */
  headline: L;
  category: L;
  detail: L;
  /** 태풍 경로 — 남동 해상에서 남해안 상륙 */
  path: Point[];
  /** 영향권 반경 (마지막 경로점 기준) */
  impactRadius: number;
}

export interface Exposure {
  id: number;
  cedent: L;
  treaty: L;
  region: L;
  pos: Point;
  tsi: L;
  /** 예상 손해액 (억원) — 합계 계산용 숫자 */
  loss: number;
  severity: Severity;
}

export interface AlertDraft {
  cedent: L;
  subject: L;
  body: L;
}

export const SEVERITY_META: Record<Severity, { label: L; dot: string; badge: string }> = {
  high: {
    label: { ko: '높음', en: 'High' },
    dot: '#fb7185',
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  },
  medium: {
    label: { ko: '중간', en: 'Medium' },
    dot: '#fbbf24',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  low: {
    label: { ko: '낮음', en: 'Low' },
    dot: '#a1a1aa',
    badge: 'border-white/10 bg-white/[0.05] text-zinc-400',
  },
};

export const EVENT: CatEvent = {
  name: { ko: '태풍 12호 나리', en: 'Typhoon No.12 NARI' },
  headline: {
    ko: '태풍 12호 나리, 금일 14시 남해안 상륙 — 최대풍속 45m/s',
    en: 'Typhoon No.12 NARI makes landfall on the south coast at 14:00 — winds 45 m/s',
  },
  category: { ko: '카테고리 3 · 945hPa', en: 'Category 3 · 945hPa' },
  detail: {
    ko: '진로: 남동 해상 → 통영 인근 상륙 → 내륙 북상',
    en: 'Track: SE waters → landfall near Tongyeong → inland',
  },
  path: [
    { x: 338, y: 452 },
    { x: 316, y: 402 },
    { x: 292, y: 356 },
    { x: 266, y: 316 },
    { x: 244, y: 288 },
  ],
  impactRadius: 80,
};

/** 점등 순서 = 배열 순서 (심각도 높은 순) */
export const EXPOSURES: Exposure[] = [
  {
    id: 1,
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    treaty: { ko: 'Property Cat XoL', en: 'Property Cat XoL' },
    region: { ko: '부산', en: 'Busan' },
    pos: { x: 258, y: 284 },
    tsi: { ko: '₩1.2조', en: '₩1.2tn' },
    loss: 62,
    severity: 'high',
  },
  {
    id: 2,
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    treaty: { ko: '풍수해 QS', en: 'Windstorm & Flood QS' },
    region: { ko: '창원', en: 'Changwon' },
    pos: { x: 242, y: 278 },
    tsi: { ko: '₩8,400억', en: '₩840bn' },
    loss: 48,
    severity: 'high',
  },
  {
    id: 3,
    cedent: { ko: 'DB손해보험', en: 'DB Insurance' },
    treaty: { ko: 'Marine Cargo XoL', en: 'Marine Cargo XoL' },
    region: { ko: '여수', en: 'Yeosu' },
    pos: { x: 214, y: 292 },
    tsi: { ko: '₩5,600억', en: '₩560bn' },
    loss: 35,
    severity: 'medium',
  },
  {
    id: 4,
    cedent: { ko: '현대해상', en: 'Hyundai M&F' },
    treaty: { ko: 'Property Surplus', en: 'Property Surplus' },
    region: { ko: '통영', en: 'Tongyeong' },
    pos: { x: 234, y: 290 },
    tsi: { ko: '₩3,200억', en: '₩320bn' },
    loss: 24,
    severity: 'medium',
  },
  {
    id: 5,
    cedent: { ko: 'KB손해보험', en: 'KB Insurance' },
    treaty: { ko: '풍수해 QS', en: 'Windstorm & Flood QS' },
    region: { ko: '목포', en: 'Mokpo' },
    pos: { x: 162, y: 294 },
    tsi: { ko: '₩2,900억', en: '₩290bn' },
    loss: 21,
    severity: 'medium',
  },
  {
    id: 6,
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    treaty: { ko: 'Engineering CAR', en: 'Engineering CAR' },
    region: { ko: '거제', en: 'Geoje' },
    pos: { x: 244, y: 294 },
    tsi: { ko: '₩4,100억', en: '₩410bn' },
    loss: 14,
    severity: 'low',
  },
  {
    id: 7,
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    treaty: { ko: 'Marine Hull', en: 'Marine Hull' },
    region: { ko: '울산', en: 'Ulsan' },
    pos: { x: 266, y: 264 },
    tsi: { ko: '₩2,400억', en: '₩240bn' },
    loss: 10,
    severity: 'low',
  },
];

/** 요약 합계 — 데이터에서 계산 (하드코딩 금지) */
export function summary() {
  const totalLoss = EXPOSURES.reduce((s, e) => s + e.loss, 0);
  const cedents = new Set(EXPOSURES.map((e) => e.cedent.ko)).size;
  return { count: EXPOSURES.length, totalLoss, cedents };
}

/** 손해액 표기 — ko: ₩214억 / en: ₩21.4bn */
export function lossLabel(n: number, lang: Lang): string {
  return lang === 'ko' ? `₩${n}억` : `₩${(n / 10).toFixed(1)}bn`;
}

/** 출재사 알림 초안 — 예상 손해 상위 3개 출재사 (한화 72 · 삼성 62 · DB 35) */
export const ALERTS: AlertDraft[] = [
  {
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    subject: {
      ko: '[긴급] 태풍 나리 — Property Cat XoL·Marine Hull 노출 안내',
      en: '[Urgent] Typhoon NARI — Property Cat XoL & Marine Hull exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· Property Cat XoL (부산) — 예상 손해 ₩62억\n· Marine Hull (울산) — 예상 손해 ₩10억\n\n클레임 접수 절차와 Hours Clause(168시간) 적용 기준을 첨부했습니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaties:\n\n· Property Cat XoL (Busan) — est. loss ₩6.2bn\n· Marine Hull (Ulsan) — est. loss ₩1.0bn\n\nClaims procedure and the 168-hour Hours Clause guidance are attached.',
    },
  },
  {
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    subject: {
      ko: '[긴급] 태풍 나리 — 풍수해 QS·Engineering CAR 노출 안내',
      en: '[Urgent] Typhoon NARI — Windstorm QS & Engineering CAR exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· 풍수해 QS (창원) — 예상 손해 ₩48억\n· Engineering CAR (거제) — 예상 손해 ₩14억\n\n클레임 접수 절차를 첨부했습니다. 현장 피해 확인 시 즉시 회신 부탁드립니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaties:\n\n· Windstorm & Flood QS (Changwon) — est. loss ₩4.8bn\n· Engineering CAR (Geoje) — est. loss ₩1.4bn\n\nClaims procedure attached. Please reply once on-site damage is confirmed.',
    },
  },
  {
    cedent: { ko: 'DB손해보험', en: 'DB Insurance' },
    subject: {
      ko: '[긴급] 태풍 나리 — Marine Cargo XoL 노출 안내',
      en: '[Urgent] Typhoon NARI — Marine Cargo XoL exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· Marine Cargo XoL (여수) — 예상 손해 ₩35억\n\n여수항 체선 화물 기준 산정치이며, 상세 내역은 산정 후 추가 송부드립니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaty:\n\n· Marine Cargo XoL (Yeosu) — est. loss ₩3.5bn\n\nBased on cargo berthed at Yeosu port; details to follow after assessment.',
    },
  },
];

/** 지도 도시 라벨 */
export const CITIES: { name: L; pos: Point }[] = [
  { name: { ko: '서울', en: 'Seoul' }, pos: { x: 152, y: 118 } },
  { name: { ko: '부산', en: 'Busan' }, pos: { x: 258, y: 284 } },
  { name: { ko: '여수', en: 'Yeosu' }, pos: { x: 214, y: 292 } },
  { name: { ko: '목포', en: 'Mokpo' }, pos: { x: 162, y: 294 } },
];

/** 앱 UI 문자열 */
export const STR = {
  monitoring: { ko: '실시간 모니터링 — 이상 없음', en: 'Live monitoring — all clear' },
  liveBadge: { ko: 'LIVE', en: 'LIVE' },
  eventTitle: { ko: '재해 이벤트', en: 'Cat event' },
  scanBtn: { ko: '노출 분석', en: 'Analyze exposure' },
  scanning: { ko: '분석 중…', en: 'Analyzing…' },
  scanDone: { ko: '분석 완료', en: 'Analyzed' },
  exposureTitle: { ko: '노출 특약', en: 'Exposed treaties' },
  awaitingScan: { ko: '노출 분석을 실행하세요', en: 'Run exposure analysis' },
  estLoss: { ko: '예상 손해', en: 'Est. loss' },
  sumTitle: { ko: '예상 영향 합계', en: 'Estimated impact' },
  sumTreaties: { ko: '노출 특약 {n}건', en: '{n} treaties exposed' },
  sumCedents: { ko: '영향 출재사 {n}곳', en: '{n} cedents affected' },
  sumLossLabel: { ko: '총 예상 손해', en: 'Total estimated loss' },
  draftsTitle: { ko: '출재사 알림', en: 'Cedent alerts' },
  draftBtn: { ko: '알림 초안 생성', en: 'Draft alerts' },
  draftingLabel: { ko: '작성 중…', en: 'Drafting…' },
  sendAllBtn: { ko: '일괄 발송 ({n}통)', en: 'Send all ({n})' },
  sentLabel: { ko: '발송 완료', en: 'Sent' },
  toast: { ko: '출재사 {n}곳에 알림이 발송되었습니다', en: 'Alerts sent to {n} cedents' },
  toastSub: { ko: '회신은 받은편지함에서 추적됩니다', en: 'Replies are tracked in your inbox' },
} satisfies Record<string, L>;
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/data.ts
git commit -m "feat(cat-warroom): 데이터 모델 — 태풍 이벤트·노출 특약 7건·알림 초안 3통"
```

---

### Task 2: zustand 스토어 (`state.ts`)

**Files:**
- Create: `src/demos/aria/cat-warroom/state.ts`

inbox-triage에서 확립한 runId 가드 + 액션별 phase 가드 패턴을 그대로 따른다 (`src/demos/aria/inbox-triage/state.ts` 참조 — 리뷰에서 검증된 형태).

- [ ] **Step 1: state.ts 작성**

```ts
import { create } from 'zustand';
import { ALERTS, EXPOSURES } from './data';

export type Phase = 'idle' | 'alert' | 'scanning' | 'assessed';

interface WarroomState {
  phase: Phase;
  /** 점등된 노출 특약 id — 순차 채움 */
  revealedIds: number[];
  /** 작성 완료된 알림 초안 수 (스트리밍 연출) */
  draftedCount: number;
  drafting: boolean;
  sent: boolean;
  /** idle → alert: 속보 배너 + 태풍 경로 등장 */
  triggerEvent: () => void;
  /** alert → scanning → assessed: 노출 특약 순차 점등 */
  scanExposures: () => void;
  /** v2 시작 상태 — 애니메이션 없이 분석 완료로 세팅 */
  seedAssessed: () => void;
  /** 알림 초안 순차 작성 */
  draftAlerts: () => void;
  sendAll: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useWarroom = create<WarroomState>((set, get) => ({
  phase: 'idle',
  revealedIds: [],
  draftedCount: 0,
  drafting: false,
  sent: false,

  triggerEvent: () => {
    if (get().phase !== 'idle') return;
    set({ phase: 'alert' });
  },

  scanExposures: () => {
    if (get().phase !== 'alert') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (const exposure of EXPOSURES) {
        await sleep(400);
        if (id !== runId) return;
        set((s) => ({ revealedIds: [...s.revealedIds, exposure.id] }));
      }
      await sleep(600);
      if (id !== runId) return;
      set({ phase: 'assessed' });
    })();
  },

  seedAssessed: () => {
    runId++;
    set({ phase: 'assessed', revealedIds: EXPOSURES.map((e) => e.id) });
  },

  draftAlerts: () => {
    const { phase, drafting, draftedCount } = get();
    if (phase !== 'assessed' || drafting || draftedCount > 0) return;
    const id = ++runId;
    set({ drafting: true });
    void (async () => {
      for (let i = 1; i <= ALERTS.length; i++) {
        await sleep(700);
        if (id !== runId) return;
        set({ draftedCount: i });
      }
      if (id !== runId) return;
      set({ drafting: false });
    })();
  },

  sendAll: () => {
    if (get().draftedCount === ALERTS.length && !get().sent) set({ sent: true });
  },

  reset: () => {
    runId++;
    set({ phase: 'idle', revealedIds: [], draftedCount: 0, drafting: false, sent: false });
  },
}));
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/state.ts
git commit -m "feat(cat-warroom): zustand 스토어 — idle/alert/scanning/assessed 단계"
```

---

### Task 3: SVG 지도 (`map.tsx`)

**Files:**
- Create: `src/demos/aria/cat-warroom/map.tsx`

표현 전용 컴포넌트 — 스토어를 직접 구독하지 않고 props(phase, revealedIds)로 받는다.

- [ ] **Step 1: map.tsx 작성**

```tsx
import { motion } from 'framer-motion';
import { useLang, pick } from '../_shared/i18n';
import { CITIES, EVENT, EXPOSURES, SEVERITY_META } from './data';
import type { Phase } from './state';

/** 단순화된 한반도 윤곽 — 디자인용 근사 path */
const KOREA_PATH =
  'M148,18 L172,26 L196,20 L218,34 L226,58 L218,80 L236,96 L230,120 L250,134 L246,158 L264,174 L258,198 L276,218 L270,242 L284,260 L276,278 L262,288 L246,282 L234,294 L218,288 L202,298 L184,292 L170,300 L156,290 L146,272 L136,250 L128,226 L120,200 L114,174 L108,148 L102,122 L100,96 L110,70 L124,46 L136,30 Z';

const pathD = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

export function WarroomMap({ phase, revealedIds }: { phase: Phase; revealedIds: number[] }) {
  const lang = useLang();
  const active = phase !== 'idle';
  const landfall = EVENT.path[EVENT.path.length - 1];

  return (
    <svg viewBox="0 0 400 480" className="h-full w-full" role="img" aria-label="exposure map">
      {/* 바다 그리드 */}
      <defs>
        <pattern id="sea-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        </pattern>
        <radialGradient id="impact-fill">
          <stop offset="0%" stopColor="rgba(244,63,94,0.16)" />
          <stop offset="100%" stopColor="rgba(244,63,94,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="480" fill="url(#sea-grid)" />

      {/* 한반도 + 제주 */}
      <path d={KOREA_PATH} fill="#161c26" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <ellipse cx="160" cy="352" rx="16" ry="9" fill="#161c26" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

      {/* 도시 라벨 */}
      {CITIES.map((c, i) => (
        <g key={i}>
          <circle cx={c.pos.x} cy={c.pos.y} r="2" fill="rgba(255,255,255,0.25)" />
          <text x={c.pos.x + 6} y={c.pos.y + 3} fontSize="9" fill="rgba(255,255,255,0.3)">
            {pick(c.name, lang)}
          </text>
        </g>
      ))}

      {active && (
        <>
          {/* 영향권 */}
          <motion.circle
            cx={landfall.x}
            cy={landfall.y}
            r={EVENT.impactRadius}
            fill="url(#impact-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
          />
          <motion.circle
            cx={landfall.x}
            cy={landfall.y}
            r={EVENT.impactRadius}
            fill="none"
            stroke="rgba(244,63,94,0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.55], scale: 1 }}
            transition={{ duration: 1.6, delay: 1.2 }}
            style={{ transformOrigin: `${landfall.x}px ${landfall.y}px` }}
          />

          {/* 태풍 경로 */}
          <motion.path
            d={pathD(EVENT.path)}
            fill="none"
            stroke="#fb7185"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />

          {/* 태풍 마커 — 경로 끝에서 회전 */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${landfall.x}px ${landfall.y}px` }}
            >
              <circle cx={landfall.x} cy={landfall.y} r="11" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeDasharray="14 9" />
            </motion.g>
            <circle cx={landfall.x} cy={landfall.y} r="4" fill="#fb7185" />
          </motion.g>
        </>
      )}

      {/* 노출 마커 — 점등 순서대로 */}
      {EXPOSURES.filter((e) => revealedIds.includes(e.id)).map((e) => (
        <motion.g key={e.id} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.circle
            cx={e.pos.x}
            cy={e.pos.y}
            r="9"
            fill="none"
            stroke={SEVERITY_META[e.severity].dot}
            strokeWidth="1.5"
            initial={{ opacity: 0.8, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            style={{ transformOrigin: `${e.pos.x}px ${e.pos.y}px` }}
          />
          <circle cx={e.pos.x} cy={e.pos.y} r="4.5" fill={SEVERITY_META[e.severity].dot} stroke="#0c1014" strokeWidth="1.5" />
        </motion.g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/map.tsx
git commit -m "feat(cat-warroom): SVG 한반도 지도 — 태풍 경로·영향권·노출 마커"
```

---

### Task 4: 공용 위젯 (`widgets.tsx`)

**Files:**
- Create: `src/demos/aria/cat-warroom/widgets.tsx`

- [ ] **Step 1: widgets.tsx 작성**

```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { CheckCircle2, Mail, Radar, Siren, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { ALERTS, EVENT, EXPOSURES, SEVERITY_META, STR, lossLabel, summary } from './data';
import { useWarroom } from './state';

/** 손해액 카운트업 — assessed 진입 시 1회 재생 */
function CountUp({ to, format }: { to: number; format: (n: number) => string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.2, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [to]);
  return <>{format(val)}</>;
}

/** 속보 배너 — 지도 상단 오버레이 */
export function AlertBanner() {
  const phase = useWarroom((s) => s.phase);
  const lang = useLang();
  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          data-demo-id="alert-banner"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-[#190a0e]/95 px-3.5 py-2.5 shadow-xl backdrop-blur"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
            {pick(STR.liveBadge, lang)}
          </span>
          <p className="min-w-0 truncate text-[12px] font-semibold text-rose-100">{pick(EVENT.headline, lang)}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 이벤트 카드 — 사이드바 상단, 노출 분석 버튼 포함 */
export function EventCard() {
  const { phase, scanExposures } = useWarroom();
  const lang = useLang();

  if (phase === 'idle') {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
        <Radar className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-[12px] text-zinc-400">{pick(STR.monitoring, lang)}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5"
    >
      <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-rose-400">
        <Siren className="h-3.5 w-3.5" /> {pick(STR.eventTitle, lang)}
      </p>
      <p className="mt-1.5 text-[13.5px] font-semibold text-zinc-100">{pick(EVENT.name, lang)}</p>
      <p className="mt-0.5 text-[11px] text-rose-200/80">{pick(EVENT.category, lang)}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{pick(EVENT.detail, lang)}</p>
      <button
        data-demo-id="scan-run"
        onClick={scanExposures}
        disabled={phase !== 'alert'}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors',
          phase === 'alert' && 'bg-rose-500 text-white hover:bg-rose-400',
          phase === 'scanning' && 'bg-rose-500/20 text-rose-300',
          phase === 'assessed' && 'bg-emerald-500/15 text-emerald-300',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {phase === 'alert' && pick(STR.scanBtn, lang)}
        {phase === 'scanning' && pick(STR.scanning, lang)}
        {phase === 'assessed' && pick(STR.scanDone, lang)}
      </button>
    </motion.div>
  );
}

/** 노출 특약 리스트 — 점등 순서대로 등장 */
export function ExposureList() {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();
  if (phase === 'idle') return null;
  const revealed = EXPOSURES.filter((e) => revealedIds.includes(e.id));

  return (
    <div>
      <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">
        {pick(STR.exposureTitle, lang)}
      </p>
      {revealed.length === 0 && <p className="text-[11.5px] text-zinc-600">{pick(STR.awaitingScan, lang)}</p>}
      <div className="space-y-1.5">
        {revealed.map((e) => (
          <motion.div
            key={e.id}
            data-demo-id={`exposure-item-${e.id}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[12px] font-semibold text-zinc-200">{pick(e.treaty, lang)}</p>
              <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium', SEVERITY_META[e.severity].badge)}>
                {pick(SEVERITY_META[e.severity].label, lang)}
              </span>
            </div>
            <p className="mt-0.5 text-[10.5px] text-zinc-500">
              {pick(e.cedent, lang)} · {pick(e.region, lang)} · TSI {pick(e.tsi, lang)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-rose-300/90">
              {pick(STR.estLoss, lang)} {lossLabel(e.loss, lang)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** 합계 카드 — assessed에서 카운트업 */
export function SummaryCard() {
  const phase = useWarroom((s) => s.phase);
  const lang = useLang();
  if (phase !== 'assessed') return null;
  const s = summary();

  return (
    <motion.div
      data-demo-id="summary-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-rose-500/25 bg-gradient-to-br from-rose-500/[0.12] to-transparent p-3.5"
    >
      <p className="text-[10.5px] font-medium uppercase tracking-wider text-rose-400">{pick(STR.sumTitle, lang)}</p>
      <p className="mt-2 text-[11px] text-zinc-400">{pick(STR.sumLossLabel, lang)}</p>
      <p className="text-[22px] font-bold tracking-tight text-rose-200">
        <CountUp to={s.totalLoss} format={(n) => lossLabel(n, lang)} />
      </p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
        <span>{fmt(pick(STR.sumTreaties, lang), { n: s.count })}</span>
        <span className="text-zinc-700">·</span>
        <span>{fmt(pick(STR.sumCedents, lang), { n: s.cedents })}</span>
      </div>
    </motion.div>
  );
}

/** 출재사 알림 패널 — assessed에서 초안 생성 → 일괄 발송 */
export function AlertDraftsPanel() {
  const { phase, draftedCount, drafting, sent, draftAlerts, sendAll } = useWarroom();
  const lang = useLang();
  if (phase !== 'assessed') return null;
  const allDrafted = draftedCount === ALERTS.length;

  return (
    <div className="relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">
          <Mail className="h-3.5 w-3.5" /> {pick(STR.draftsTitle, lang)}
        </p>
        {draftedCount === 0 && (
          <button
            data-demo-id="draft-run"
            onClick={draftAlerts}
            disabled={drafting}
            className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-400 disabled:opacity-60"
          >
            {drafting ? pick(STR.draftingLabel, lang) : pick(STR.draftBtn, lang)}
          </button>
        )}
      </div>
      <div className="mt-2.5 space-y-2">
        {ALERTS.slice(0, draftedCount).map((a) => (
          <motion.div
            key={a.cedent.en}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-zinc-300">{pick(a.cedent, lang)}</p>
              {sent && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> {pick(STR.sentLabel, lang)}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[11.5px] text-zinc-400">{pick(a.subject, lang)}</p>
            <p className="mt-1 line-clamp-2 whitespace-pre-line text-[10.5px] leading-relaxed text-zinc-600">
              {pick(a.body, lang)}
            </p>
          </motion.div>
        ))}
      </div>
      {allDrafted && !sent && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          data-demo-id="send-all"
          onClick={sendAll}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-rose-400"
        >
          {fmt(pick(STR.sendAllBtn, lang), { n: ALERTS.length })}
        </motion.button>
      )}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {fmt(pick(STR.toast, lang), { n: ALERTS.length })}
            </p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-500">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/widgets.tsx
git commit -m "feat(cat-warroom): 속보 배너·이벤트 카드·노출 리스트·합계·알림 패널 위젯"
```

---

### Task 5: 데스크톱 레이아웃 (`Desktop.tsx`)

**Files:**
- Create: `src/demos/aria/cat-warroom/Desktop.tsx`

- [ ] **Step 1: Desktop.tsx 작성**

```tsx
import { Radar } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { EVENT, STR } from './data';
import { useWarroom } from './state';
import { WarroomMap } from './map';
import { AlertBanner, AlertDraftsPanel, EventCard, ExposureList, SummaryCard } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/90 text-white">
          <Radar className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Warroom <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[10.5px] font-medium',
            phase === 'idle' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
          )}
        >
          {phase === 'idle' ? pick(STR.monitoring, lang) : pick(EVENT.name, lang)}
        </span>
      </header>

      {/* 지도 + 사이드 */}
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1 bg-[#0a0e14]">
          <AlertBanner />
          <WarroomMap phase={phase} revealedIds={revealedIds} />
        </main>
        <aside className="demo-scroll flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-white/[0.06] bg-[#0c1014] p-3.5">
          <EventCard />
          <ExposureList />
          <SummaryCard />
          <AlertDraftsPanel />
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/Desktop.tsx
git commit -m "feat(cat-warroom): 데스크톱 — 지도 패널 + 사이드 피드"
```

---

### Task 6: 모바일 레이아웃 (`Mobile.tsx`)

**Files:**
- Create: `src/demos/aria/cat-warroom/Mobile.tsx`

알림 패널은 피드 하단 인라인 (스펙 명시 — 시트 분리 시 시나리오 타깃이 사라짐).

- [ ] **Step 1: Mobile.tsx 작성**

```tsx
import { Radar } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { EVENT, STR } from './data';
import { useWarroom } from './state';
import { WarroomMap } from './map';
import { AlertBanner, AlertDraftsPanel, EventCard, ExposureList, SummaryCard } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-rose-500/90 text-white">
          <Radar className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Warroom</span>
        <span
          className={cn(
            'ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium',
            phase === 'idle' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
          )}
        >
          {phase === 'idle' ? pick(STR.liveBadge, lang) : pick(EVENT.name, lang)}
        </span>
      </header>

      {/* 지도 — 고정 높이 */}
      <div className="relative h-[240px] shrink-0 border-b border-white/[0.06] bg-[#0a0e14]">
        <AlertBanner />
        <WarroomMap phase={phase} revealedIds={revealedIds} />
      </div>

      {/* 피드 */}
      <div className="demo-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <EventCard />
        <ExposureList />
        <SummaryCard />
        <AlertDraftsPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` / Expected: exit 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/cat-warroom/Mobile.tsx
git commit -m "feat(cat-warroom): 모바일 — 상단 지도 + 인라인 피드"
```

---

### Task 7: 시나리오 + 갤러리 등록 (`scenario.ts`, `index.ts`)

**Files:**
- Create: `src/demos/aria/cat-warroom/scenario.ts`
- Create: `src/demos/aria/cat-warroom/index.ts`

타이밍 근거: v1 — 경로 애니메이션 1.8s + 배너 감상 → triggerEvent 후 2800ms 대기. 스캔 7건 × 400ms + 600ms = 3400ms → 4400ms 대기(여유 1s). v2 — 초안 3통 × 700ms = 2100ms → 3000ms 대기.

- [ ] **Step 1: scenario.ts 작성**

```ts
import type { Scenario } from '../../../engine/types';
import { useWarroom } from './state';

const st = () => useWarroom.getState();

/** v1 — 실시간 워룸: 속보 → 태풍 경로 → 노출 분석 → 순차 점등 → 합계 카운트업 */
export const liveScenario: Scenario = {
  id: 'warroom-live',
  steps: [
    { kind: 'wait', ms: 1400 },
    { kind: 'do', run: () => st().triggerEvent() },
    { kind: 'wait', ms: 2800 },
    { kind: 'cursor', target: 'scan-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'scan-run', run: () => st().scanExposures() },
    { kind: 'wait', ms: 4400 },
    { kind: 'cursor', target: 'summary-card', ms: 800 },
    { kind: 'wait', ms: 2200 },
  ],
};

/** v2 — 출재사 알림 30초: 분석 완료 상태 → 초안 순차 작성 → 일괄 발송 */
export const alertsScenario: Scenario = {
  id: 'warroom-alerts',
  steps: [
    { kind: 'do', run: () => st().seedAssessed() },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'draft-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'draft-run', run: () => st().draftAlerts() },
    { kind: 'wait', ms: 3000 },
    { kind: 'cursor', target: 'send-all', ms: 700 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'send-all', run: () => st().sendAll() },
    { kind: 'wait', ms: 2400 },
  ],
};
```

- [ ] **Step 2: index.ts 작성**

```ts
import { Radar } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useWarroom } from './state';
import { alertsScenario, liveScenario } from './scenario';

const catWarroom: FeatureDefinition = {
  id: 'cat-warroom',
  title: 'Cat 이벤트 워룸',
  description: '태풍 상륙 순간, 노출 특약 식별부터 예상 손해 산정·출재사 알림까지 — 재해 대응을 한 화면에서.',
  icon: Radar,
  accent: '#f43f5e',
  Desktop,
  Mobile,
  resetState: () => useWarroom.getState().reset(),
  variants: [
    {
      id: 'live',
      label: '실시간 워룸',
      version: 'v1',
      sellingPoint: '대응 속도',
      url: 'insightre.ai/warroom',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(244,63,94,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(120,20,40,0.3), transparent 60%), linear-gradient(160deg, #170a0f 0%, #0a0507 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-rose-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-red-900/25 blur-[120px]',
        ],
      },
      scenario: liveScenario,
    },
    {
      id: 'alerts',
      label: '출재사 알림 30초',
      version: 'v2',
      sellingPoint: '대응 자동화',
      url: 'insightre.ai/warroom',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(225,29,72,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(90,15,35,0.3), transparent 60%), linear-gradient(165deg, #150810 0%, #090408 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-rose-600/10 blur-[140px]'],
      },
      scenario: alertsScenario,
    },
  ],
};

export default catWarroom;
```

- [ ] **Step 3: 전체 빌드**

Run: `npm run build` / Expected: tsc + vite build 성공 (exit 0)

- [ ] **Step 4: 커밋**

```powershell
git add src/demos/aria/cat-warroom/scenario.ts src/demos/aria/cat-warroom/index.ts
git commit -m "feat(cat-warroom): 시나리오 2종 + 갤러리 등록"
```

---

### Task 8: 런타임 검증

**Files:** 없음 (검증만 — inbox-triage Task 7과 동일한 방식: dev 서버 + 브라우저 구동)

- [ ] **Step 1:** `npm run dev` 백그라운드 기동
- [ ] **Step 2:** 갤러리에 "Cat 이벤트 워룸" 카드(로즈 액센트, Radar 아이콘) 9번째 확인
- [ ] **Step 3: v1 재생 (데스크톱)** — 평시 모니터링 → 속보 배너 + 태풍 경로·영향권 애니메이션 → "노출 분석" → 지도 마커·리스트 7건 순차 점등 → 합계 카드 "₩214억" 카운트업 + "노출 특약 7건 · 영향 출재사 5곳"
- [ ] **Step 4: v2 재생 (데스크톱)** — 분석 완료 시작 → "알림 초안 생성" → 출재사 카드 3통 순차 작성 (한화·삼성·DB) → "일괄 발송 (3통)" → 발송 완료 체크 + 토스트
- [ ] **Step 5:** 모바일 양 변형 + EN 전환 + 스캔/초안 작성 중 리셋 (고스트 타이머 없음 확인)
- [ ] **Step 6:** 발견 이슈 수정·커밋 후 종료
