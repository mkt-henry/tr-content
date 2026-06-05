# 인박스 AI Triage 데모 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ARIA Demo Studio에 "인박스 AI Triage" 데모(이메일 자동 분류·우선순위화 → 핵심 추출 → 파이프라인 등록)를 추가한다.

**Architecture:** 기존 데모 패턴 그대로 — `src/demos/aria/inbox-triage/` 폴더에 zustand 스토어 + 자동 재생 시나리오 + Desktop/Mobile 컴포넌트. registry가 `demos/*/*/index.ts`를 glob으로 자동 수집하므로 별도 등록 코드는 없다. 스펙: `docs/superpowers/specs/2026-06-05-inbox-triage-design.md`

**Tech Stack:** React 18 + TypeScript + zustand 5 + framer-motion 11 + Tailwind 4 + lucide-react. 테스트 러너 없음(기존 관례) — 검증은 `npx tsc --noEmit` 타입체크와 dev 서버 수동 재생.

**검증 공통 사항:** 이 프로젝트에는 테스트 프레임워크가 없다(기존 데모 전부 동일). 각 태스크의 검증은 ① `npx tsc --noEmit` 통과 ② 최종 태스크에서 dev 서버 수동 재생 확인으로 한다.

---

### Task 1: 데이터 모델 + 더미 데이터 (`data.ts`)

**Files:**
- Create: `src/demos/aria/inbox-triage/data.ts`

- [ ] **Step 1: data.ts 작성**

이메일 9통(시간 역순 = 도착 순서), 카테고리/우선순위 메타, 추출 필드, UI 문자열. i18n은 기존 `_shared/i18n`의 `L` 타입 패턴.

```ts
import type { L } from '../_shared/i18n';

export type Category = 'submission' | 'renewal' | 'claim' | 'accounting' | 'general';
export type Priority = 'urgent' | 'high' | 'normal';

export interface EmailAnalysis {
  category: Category;
  priority: Priority;
  /** 마감 배지 — 있으면 표시 (예: 오늘 마감) */
  due?: L;
  /** 정리 후 호버 시 보여줄 AI 한줄 요약 */
  summary: L;
}

export interface Email {
  id: number;
  /** 발신자 — 이름 · 회사 */
  sender: L;
  subject: L;
  preview: L;
  body: L;
  /** 수신 시각 표기 */
  time: L;
  /** 첨부 파일명 (있으면 칩 표시) */
  attachment?: string;
  analysis: EmailAnalysis;
}

export const CATEGORY_META: Record<Category, { label: L; badge: string }> = {
  submission: {
    label: { ko: '신규 의뢰', en: 'Submission' },
    badge: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  },
  renewal: {
    label: { ko: '갱신', en: 'Renewal' },
    badge: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
  },
  claim: {
    label: { ko: '클레임 통지', en: 'Claim notice' },
    badge: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
  },
  accounting: {
    label: { ko: '정산', en: 'Accounting' },
    badge: 'border-violet-500/30 bg-violet-500/15 text-violet-300',
  },
  general: {
    label: { ko: '일반', en: 'General' },
    badge: 'border-white/10 bg-white/[0.06] text-zinc-400',
  },
};

export const PRIORITY_META: Record<Priority, { label: L; badge: string; rank: number }> = {
  urgent: { label: { ko: '긴급', en: 'Urgent' }, badge: 'border-rose-500/40 bg-rose-500/20 text-rose-300', rank: 0 },
  high: { label: { ko: '높음', en: 'High' }, badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300/90', rank: 1 },
  normal: { label: { ko: '보통', en: 'Normal' }, badge: 'border-white/10 bg-white/[0.05] text-zinc-500', rank: 2 },
};

/** 도착 순서(시간 역순) — 분류 전 '지저분한 인박스'의 기본 정렬 */
export const EMAILS: Email[] = [
  {
    id: 1,
    sender: { ko: '보험연수원', en: 'Insurance Training Institute' },
    subject: { ko: '[초청] 2026 하반기 재보험 실무 세미나 안내', en: '[Invitation] H2 2026 Reinsurance Seminar' },
    preview: {
      ko: '안녕하세요. 오는 7월 개최되는 재보험 실무 세미나에 귀사를 초청합니다…',
      en: 'Hello. We are pleased to invite your firm to the reinsurance seminar this July…',
    },
    body: {
      ko: '안녕하세요. 오는 7월 개최되는 재보험 실무 세미나에 귀사를 초청합니다. 자세한 일정과 등록 방법은 추후 안내드리겠습니다.',
      en: 'Hello. We are pleased to invite your firm to the reinsurance practice seminar this July. Schedule and registration details to follow.',
    },
    time: { ko: '09:41', en: '09:41' },
    analysis: {
      category: 'general',
      priority: 'normal',
      summary: { ko: '7월 세미나 초청 — 액션 불필요, 일정만 확인', en: 'July seminar invite — no action, note the date' },
    },
  },
  {
    id: 2,
    sender: { ko: '김민서 · 한화손해보험', en: 'Minseo Kim · Hanwha General' },
    subject: { ko: 'Property Cat XoL 출재 의뢰 — 금일 회신 요청', en: 'Property Cat XoL cession request — reply due today' },
    preview: {
      ko: '슬립 첨부드립니다. TSI ₩1.2조 규모이며 금일 중 인수 가능 여부 회신 부탁드립니다…',
      en: 'Slip attached. TSI around ₩1.2tn — please confirm capacity today…',
    },
    body: {
      ko: '안녕하세요, 한화손해보험 김민서입니다.\n\n당사 Property 포트폴리오의 Cat XoL 출재를 의뢰드립니다. 슬립을 첨부했으며, TSI는 약 ₩1.2조, 보험기간은 2026.07.01부터 1년입니다. 희망 조건은 Retention ₩50억에 Limit ₩250억입니다.\n\n갱신 일정상 금일 중으로 인수 가능 여부 회신을 부탁드립니다.',
      en: 'Hello, this is Minseo Kim at Hanwha General.\n\nWe would like to cede the Cat XoL layer of our property portfolio. The slip is attached; TSI is approx. ₩1.2tn, period from 1 Jul 2026 for 12 months. Requested terms: ₩5bn retention, ₩25bn limit.\n\nGiven our renewal schedule, please confirm capacity today.',
    },
    time: { ko: '09:12', en: '09:12' },
    attachment: 'HW_Property_CatXoL_Slip_2026.pdf',
    analysis: {
      category: 'submission',
      priority: 'urgent',
      due: { ko: '오늘 마감', en: 'Due today' },
      summary: {
        ko: 'TSI ₩1.2조 Property Cat XoL 신규 출재 의뢰 — 금일 회신 필요',
        en: '₩1.2tn TSI Property Cat XoL submission — reply required today',
      },
    },
  },
  {
    id: 3,
    sender: { ko: 'Korean Re 정산팀', en: 'Korean Re Accounts' },
    subject: { ko: '2026 Q2 분기 정산서 송부', en: 'Q2 2026 quarterly statement' },
    preview: {
      ko: '2분기 정산서를 송부드립니다. 차액 ₩3.2억은 익월 5일까지…',
      en: 'Please find the Q2 statement attached. Balance of ₩320m due by the 5th…',
    },
    body: {
      ko: '2분기 정산서를 송부드립니다. 차액 ₩3.2억은 익월 5일까지 송금 부탁드립니다.',
      en: 'Please find the Q2 statement attached. Kindly remit the balance of ₩320m by the 5th of next month.',
    },
    time: { ko: '08:55', en: '08:55' },
    attachment: 'KR_Q2_Statement_2026.xlsx',
    analysis: {
      category: 'accounting',
      priority: 'normal',
      summary: { ko: 'Q2 정산서 수령 — 차액 ₩3.2억 익월 5일까지 송금', en: 'Q2 statement received — ₩320m balance due by the 5th' },
    },
  },
  {
    id: 4,
    sender: { ko: '박지훈 · DB손해보험', en: 'Jihoon Park · DB Insurance' },
    subject: { ko: '[클레임 통지] 태풍 11호 관련 손해 발생 보고', en: '[Claim notice] Typhoon No.11 loss advice' },
    preview: {
      ko: 'Property Cat XoL 특약 관련 태풍 11호로 인한 손해 발생을 통지드립니다. 예상 손해액…',
      en: 'We hereby notify a loss under the Property Cat XoL treaty arising from Typhoon No.11…',
    },
    body: {
      ko: 'Property Cat XoL 특약 관련 태풍 11호로 인한 손해 발생을 통지드립니다. 현재 예상 손해액은 ₩85억이며, 상세 내역은 산정 후 추가 송부하겠습니다. 규정상 금일 중 접수 확인 회신을 부탁드립니다.',
      en: 'We hereby notify a loss under the Property Cat XoL treaty arising from Typhoon No.11. Current loss estimate is ₩8.5bn; details to follow. Please acknowledge receipt today as required.',
    },
    time: { ko: '08:21', en: '08:21' },
    analysis: {
      category: 'claim',
      priority: 'urgent',
      due: { ko: '오늘 마감', en: 'Due today' },
      summary: {
        ko: '태풍 11호 손해 통지 — 예상 ₩85억, 금일 접수 확인 필요',
        en: 'Typhoon No.11 loss advice — est. ₩8.5bn, acknowledge today',
      },
    },
  },
  {
    id: 5,
    sender: { ko: '이서연 · 현대해상', en: 'Seoyeon Lee · Hyundai M&F' },
    subject: { ko: 'Engineering CAR 출재 문의', en: 'Engineering CAR cession inquiry' },
    preview: {
      ko: '신규 플랜트 건설 프로젝트의 CAR 출재 가능 여부를 문의드립니다…',
      en: 'Inquiring about CAR cession capacity for a new plant construction project…',
    },
    body: {
      ko: '신규 플랜트 건설 프로젝트의 CAR 출재 가능 여부를 문의드립니다. 공사 금액은 약 ₩4,800억이며, 상세 자료는 첨부 참조 부탁드립니다.',
      en: 'We are inquiring about CAR cession capacity for a new plant construction project. Contract value approx. ₩480bn; details attached.',
    },
    time: { ko: '어제', en: 'Yesterday' },
    attachment: 'HD_Plant_CAR_Summary.pdf',
    analysis: {
      category: 'submission',
      priority: 'high',
      summary: { ko: '₩4,800억 플랜트 CAR 신규 출재 문의', en: '₩480bn plant CAR submission inquiry' },
    },
  },
  {
    id: 6,
    sender: { ko: '최태형 · 삼성화재', en: 'Taehyung Choi · Samsung F&M' },
    subject: { ko: 'Marine Hull Treaty 갱신 협의 요청', en: 'Marine Hull treaty renewal discussion' },
    preview: {
      ko: '7월 갱신 예정인 Marine Hull Treaty 관련 조건 협의를 시작하고자 합니다…',
      en: 'We would like to begin terms discussion for the Marine Hull treaty renewing in July…',
    },
    body: {
      ko: '7월 갱신 예정인 Marine Hull Treaty 관련 조건 협의를 시작하고자 합니다. 다음 주 중 미팅 가능한 일정 회신 부탁드립니다.',
      en: 'We would like to begin terms discussion for the Marine Hull treaty renewing in July. Please share your availability next week.',
    },
    time: { ko: '어제', en: 'Yesterday' },
    analysis: {
      category: 'renewal',
      priority: 'high',
      summary: { ko: 'Marine Hull 7월 갱신 — 다음 주 미팅 일정 회신 필요', en: 'Marine Hull July renewal — meeting slot reply needed' },
    },
  },
  {
    id: 7,
    sender: { ko: '한승우 · 코리안리', en: 'Seungwoo Han · Korean Re' },
    subject: { ko: '다음 주 미팅 일정 조율', en: 'Scheduling next week’s meeting' },
    preview: {
      ko: '지난번 논의 이어서 다음 주 화/수 중 미팅 가능하실까요…',
      en: 'Following up on our last discussion — would Tue/Wed next week work…',
    },
    body: {
      ko: '지난번 논의 이어서 다음 주 화/수 중 미팅 가능하실까요? 편하신 시간 알려주시면 맞추겠습니다.',
      en: 'Following up on our last discussion — would Tue/Wed next week work? Happy to fit your schedule.',
    },
    time: { ko: '어제', en: 'Yesterday' },
    analysis: {
      category: 'general',
      priority: 'normal',
      summary: { ko: '미팅 일정 조율 — 화/수 중 회신', en: 'Meeting scheduling — reply with Tue/Wed' },
    },
  },
  {
    id: 8,
    sender: { ko: '정유진 · KB손해보험', en: 'Yujin Jung · KB Insurance' },
    subject: { ko: 'Casualty XoL 갱신 자료 요청', en: 'Casualty XoL renewal data request' },
    preview: {
      ko: '9월 갱신 준비를 위해 최근 3년 손해율 분석 자료를 요청드립니다…',
      en: 'For the September renewal, we request the 3-year loss ratio analysis…',
    },
    body: {
      ko: '9월 갱신 준비를 위해 최근 3년 손해율 분석 자료를 요청드립니다. 6월 말까지 수령 가능하면 감사하겠습니다.',
      en: 'For the September renewal, we request the 3-year loss ratio analysis. Receipt by end of June would be appreciated.',
    },
    time: { ko: '6/3', en: 'Jun 3' },
    analysis: {
      category: 'renewal',
      priority: 'high',
      summary: { ko: 'Casualty XoL 9월 갱신 — 손해율 자료 6월 말까지', en: 'Casualty XoL Sept renewal — loss data by end of June' },
    },
  },
  {
    id: 9,
    sender: { ko: '오현수 · 메리츠화재', en: 'Hyunsoo Oh · Meritz F&M' },
    subject: { ko: 'Cyber 출재 의뢰 검토 요청', en: 'Cyber cession review request' },
    preview: {
      ko: '당사 Cyber 포트폴리오 출재 의뢰드립니다. 급하지 않으니 검토 후 회신 주세요…',
      en: 'Requesting review of our cyber portfolio cession. No rush — reply after review…',
    },
    body: {
      ko: '당사 Cyber 포트폴리오 출재 의뢰드립니다. 급하지 않으니 검토 후 회신 주세요. 관련 자료 첨부합니다.',
      en: 'Requesting review of our cyber portfolio cession. No rush — please reply after review. Materials attached.',
    },
    time: { ko: '6/3', en: 'Jun 3' },
    attachment: 'MZ_Cyber_Portfolio_2026.pdf',
    analysis: {
      category: 'submission',
      priority: 'normal',
      summary: { ko: 'Cyber 신규 출재 의뢰 — 여유 있게 검토', en: 'Cyber submission — review at leisure' },
    },
  },
];

/** 분류 후 정렬 — 우선순위 rank 오름차순, 동순위는 도착 순서 유지 */
export function sortedEmails(): Email[] {
  return [...EMAILS].sort((a, b) => {
    const d = PRIORITY_META[a.analysis.priority].rank - PRIORITY_META[b.analysis.priority].rank;
    return d !== 0 ? d : a.id - b.id;
  });
}

/** 요약 바 카운트 — 데이터에서 계산 (하드코딩 금지) */
export function summaryCounts() {
  const by = (c: Category) => EMAILS.filter((e) => e.analysis.category === c).length;
  return {
    submission: by('submission'),
    renewal: by('renewal'),
    claim: by('claim'),
    dueToday: EMAILS.filter((e) => e.analysis.due).length,
  };
}

/** v2 추출 대상 메일과 추출 필드 */
export interface ExtractField {
  label: L;
  value: L;
}

export const EXTRACTION: { emailId: number; fields: ExtractField[] } = {
  emailId: 2,
  fields: [
    { label: { ko: '보종', en: 'Line of business' }, value: { ko: 'Property Cat XoL', en: 'Property Cat XoL' } },
    { label: { ko: '출재사', en: 'Cedent' }, value: { ko: '한화손해보험', en: 'Hanwha General' } },
    { label: { ko: 'TSI', en: 'TSI' }, value: { ko: '약 ₩1.2조', en: 'approx. ₩1.2tn' } },
    {
      label: { ko: '보험기간', en: 'Period' },
      value: { ko: '2026.07.01 – 2027.06.30', en: '01 Jul 2026 – 30 Jun 2027' },
    },
    {
      label: { ko: '희망 조건', en: 'Requested terms' },
      value: { ko: 'Retention ₩50억 · Limit ₩250억', en: 'Retention ₩5bn · Limit ₩25bn' },
    },
    { label: { ko: '회신 마감', en: 'Reply due' }, value: { ko: '2026.06.05 (오늘)', en: '5 Jun 2026 (today)' } },
  ],
};

/** 앱 UI 문자열 */
export const STR = {
  inboxTitle: { ko: '받은편지함', en: 'Inbox' },
  unread: { ko: '안읽음 {n}', en: '{n} unread' },
  triageBtn: { ko: 'AI 분류', en: 'AI triage' },
  triaging: { ko: '분석 중…', en: 'Analyzing…' },
  triageDone: { ko: '분류 완료', en: 'Triaged' },
  sumSubmission: { ko: '신규 의뢰 {n}', en: '{n} submissions' },
  sumRenewal: { ko: '갱신 {n}', en: '{n} renewals' },
  sumClaim: { ko: '클레임 {n}', en: '{n} claims' },
  sumDueToday: { ko: '오늘 마감 {n}', en: '{n} due today' },
  aiSummary: { ko: 'AI 요약', en: 'AI summary' },
  detailEmpty: { ko: '메일을 선택하면 내용이 표시됩니다', en: 'Select an email to read it' },
  extractTitle: { ko: 'AI 핵심 추출', en: 'AI key extraction' },
  extractBtn: { ko: '핵심 추출', en: 'Extract' },
  extractingLabel: { ko: '추출 중…', en: 'Extracting…' },
  pipelineBtn: { ko: '갱신 파이프라인에 등록', en: 'Add to renewal pipeline' },
  pipelineAdded: { ko: '등록 완료', en: 'Added' },
  toast: {
    ko: '갱신 파이프라인에 등록되었습니다 · 한화 Property Cat XoL',
    en: 'Added to renewal pipeline · Hanwha Property Cat XoL',
  },
  toastSub: { ko: '갱신 파이프라인 데모에서 이어집니다', en: 'Continues in the renewals pipeline demo' },
} satisfies Record<string, L>;
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0 (data.ts는 아직 어디서도 import되지 않지만 컴파일 대상에 포함됨)

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/inbox-triage/data.ts
git commit -m "feat(inbox-triage): 데이터 모델 + 이메일 더미 9통"
```

---

### Task 2: zustand 스토어 (`state.ts`)

**Files:**
- Create: `src/demos/aria/inbox-triage/state.ts`

ai-chat의 `runId` 가드 패턴(`src/demos/aria/ai-chat/state.ts:26-43`)을 그대로 따른다 — 리셋/재생 중복 시 진행 중인 setTimeout 체인이 이전 상태를 덮어쓰지 않게 한다.

- [ ] **Step 1: state.ts 작성**

```ts
import { create } from 'zustand';
import { EMAILS, EXTRACTION } from './data';

export type Phase = 'raw' | 'scanning' | 'sorted';

interface InboxState {
  phase: Phase;
  /** 분석 완료된 메일 id — 스캔 애니메이션이 순차로 채움 */
  scannedIds: number[];
  selectedId: number | null;
  /** 정리 후 호버 요약 카드 대상 — 시나리오/마우스 공용 */
  hoveredId: number | null;
  extracting: boolean;
  /** 추출되어 표시할 필드 수 (스트리밍 연출) */
  extractedCount: number;
  pipelineAdded: boolean;
  /** v1 — 메일을 위→아래 순차 스캔 후 우선순위 정렬 */
  startTriage: () => void;
  /** v2 시작 상태 — 애니메이션 없이 분류 완료 상태로 세팅 */
  seedSorted: () => void;
  selectEmail: (id: number | null) => void;
  /** 선택 메일에서 핵심 필드를 하나씩 추출 */
  extract: () => void;
  addToPipeline: () => void;
  setHovered: (id: number | null) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useInbox = create<InboxState>((set, get) => ({
  phase: 'raw',
  scannedIds: [],
  selectedId: null,
  hoveredId: null,
  extracting: false,
  extractedCount: 0,
  pipelineAdded: false,

  startTriage: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (const email of EMAILS) {
        await sleep(320);
        if (id !== runId) return;
        set((s) => ({ scannedIds: [...s.scannedIds, email.id] }));
      }
      await sleep(550);
      if (id !== runId) return;
      set({ phase: 'sorted' });
    })();
  },

  seedSorted: () => {
    runId++;
    set({ phase: 'sorted', scannedIds: EMAILS.map((e) => e.id) });
  },

  selectEmail: (selectedId) => set({ selectedId, hoveredId: null, extracting: false, extractedCount: 0, pipelineAdded: false }),

  extract: () => {
    const { selectedId, extracting } = get();
    if (extracting || selectedId !== EXTRACTION.emailId) return;
    const id = ++runId;
    set({ extracting: true, extractedCount: 0 });
    void (async () => {
      for (let i = 1; i <= EXTRACTION.fields.length; i++) {
        await sleep(380);
        if (id !== runId) return;
        set({ extractedCount: i });
      }
      if (id !== runId) return;
      set({ extracting: false });
    })();
  },

  addToPipeline: () => {
    if (get().extractedCount === EXTRACTION.fields.length) set({ pipelineAdded: true });
  },

  setHovered: (hoveredId) => set({ hoveredId }),

  reset: () => {
    runId++;
    set({
      phase: 'raw',
      scannedIds: [],
      selectedId: null,
      hoveredId: null,
      extracting: false,
      extractedCount: 0,
      pipelineAdded: false,
    });
  },
}));
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/inbox-triage/state.ts
git commit -m "feat(inbox-triage): zustand 스토어 — 스캔/정렬/추출/등록 단계"
```

---

### Task 3: 공용 위젯 (`widgets.tsx`)

**Files:**
- Create: `src/demos/aria/inbox-triage/widgets.tsx`

Desktop/Mobile이 함께 쓰는 단위: 배지, 요약 바, 메일 리스트(스캔 글로우 + 재정렬 layout 애니메이션 + 호버 요약 카드), 상세/추출 패널.

- [ ] **Step 1: widgets.tsx 작성**

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import {
  CATEGORY_META,
  EMAILS,
  EXTRACTION,
  PRIORITY_META,
  STR,
  sortedEmails,
  summaryCounts,
  type Email,
} from './data';
import { useInbox } from './state';

/** 카테고리·우선순위·마감 배지 줄 — 분석 완료된 메일에 표시 */
function BadgeRow({ email }: { email: Email }) {
  const lang = useLang();
  const { category, priority, due } = email.analysis;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 flex flex-wrap items-center gap-1.5"
    >
      <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', CATEGORY_META[category].badge)}>
        {pick(CATEGORY_META[category].label, lang)}
      </span>
      <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_META[priority].badge)}>
        {pick(PRIORITY_META[priority].label, lang)}
      </span>
      {due && (
        <span className="rounded-md border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
          {pick(due, lang)}
        </span>
      )}
    </motion.div>
  );
}

/** 분류 완료 후 상단 요약 바 */
export function SummaryBar() {
  const phase = useInbox((s) => s.phase);
  const lang = useLang();
  if (phase !== 'sorted') return null;
  const c = summaryCounts();
  const items = [
    fmt(pick(STR.sumSubmission, lang), { n: c.submission }),
    fmt(pick(STR.sumRenewal, lang), { n: c.renewal }),
    fmt(pick(STR.sumClaim, lang), { n: c.claim }),
    fmt(pick(STR.sumDueToday, lang), { n: c.dueToday }),
  ];
  return (
    <motion.div
      data-demo-id="summary-bar"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 border-b border-amber-500/15 bg-amber-500/[0.06] px-4 py-2"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
      {items.map((t, i) => (
        <span key={i} className={cn('text-[11px]', i === items.length - 1 ? 'font-semibold text-rose-300' : 'text-amber-200/90')}>
          {t}
          {i < items.length - 1 && <span className="ml-2 text-amber-500/40">·</span>}
        </span>
      ))}
    </motion.div>
  );
}

/** 메일 리스트 — phase에 따라 도착순/우선순위순, layout 애니메이션으로 재정렬 */
export function EmailList({ compact }: { compact?: boolean }) {
  const { phase, scannedIds, selectedId, hoveredId, selectEmail, setHovered } = useInbox();
  const lang = useLang();
  const emails = phase === 'sorted' ? sortedEmails() : EMAILS;
  const lastScanned = scannedIds[scannedIds.length - 1];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {emails.map((e) => {
        const analyzed = scannedIds.includes(e.id);
        const scanningNow = phase === 'scanning' && lastScanned === e.id;
        return (
          <motion.button
            key={e.id}
            layout
            transition={{ layout: { type: 'spring', stiffness: 320, damping: 30 } }}
            data-demo-id={`email-row-${e.id}`}
            onClick={() => selectEmail(e.id)}
            onMouseEnter={() => phase === 'sorted' && setHovered(e.id)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'block w-full border-b border-white/[0.04] px-4 py-3 text-left transition-colors',
              selectedId === e.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
              scanningNow && 'bg-amber-500/[0.07] ring-1 ring-inset ring-amber-400/40',
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {!analyzed && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                <span className="truncate text-[12px] font-semibold text-zinc-200">{pick(e.sender, lang)}</span>
              </span>
              <span className="shrink-0 text-[10.5px] text-zinc-600">{pick(e.time, lang)}</span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-zinc-300">{pick(e.subject, lang)}</p>
            {!compact && <p className="mt-0.5 truncate text-[11px] text-zinc-600">{pick(e.preview, lang)}</p>}
            {e.attachment && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <Paperclip className="h-3 w-3" /> {e.attachment}
              </span>
            )}
            <AnimatePresence>{analyzed && <BadgeRow email={e} />}</AnimatePresence>
            <AnimatePresence>
              {hoveredId === e.id && analyzed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-2.5 py-2">
                    <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-amber-400">
                      <Sparkles className="h-3 w-3" /> {pick(STR.aiSummary, lang)}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-amber-100/90">{pick(e.analysis.summary, lang)}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/** 상세 패널 — 본문 + 첨부 칩 + (추출 대상이면) 핵심 추출 → 파이프라인 등록 */
export function DetailPane({ compact }: { compact?: boolean }) {
  const { selectedId, extracting, extractedCount, pipelineAdded, extract, addToPipeline } = useInbox();
  const lang = useLang();
  const email = EMAILS.find((e) => e.id === selectedId);

  if (!email) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[12px] text-zinc-600">
        {pick(STR.detailEmpty, lang)}
      </div>
    );
  }

  const extractable = email.id === EXTRACTION.emailId;
  const allExtracted = extractedCount === EXTRACTION.fields.length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className={cn('border-b border-white/[0.06] px-5 py-4', compact && 'px-4 py-3')}>
        <p className="text-[14px] font-semibold text-zinc-100">{pick(email.subject, lang)}</p>
        <p className="mt-1 text-[11.5px] text-zinc-500">
          {pick(email.sender, lang)} · {pick(email.time, lang)}
        </p>
      </div>
      <div className={cn('px-5 py-4', compact && 'px-4 py-3')}>
        <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-zinc-300">{pick(email.body, lang)}</p>
        {email.attachment && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-400">
            <FileText className="h-3.5 w-3.5 text-amber-400" /> {email.attachment}
          </span>
        )}

        {extractable && (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" /> {pick(STR.extractTitle, lang)}
              </p>
              {extractedCount === 0 && (
                <button
                  data-demo-id="extract-run"
                  onClick={extract}
                  disabled={extracting}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11.5px] font-semibold text-[#27180a] transition-colors hover:bg-amber-400 disabled:opacity-60"
                >
                  {extracting ? pick(STR.extractingLabel, lang) : pick(STR.extractBtn, lang)}
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {EXTRACTION.fields.slice(0, extractedCount).map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">{pick(f.label, lang)}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-zinc-200">{pick(f.value, lang)}</p>
                </motion.div>
              ))}
            </div>
            {allExtracted && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                data-demo-id="pipeline-add"
                onClick={addToPipeline}
                disabled={pipelineAdded}
                className={cn(
                  'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors',
                  pipelineAdded
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500 text-[#27180a] hover:bg-amber-400',
                )}
              >
                {pipelineAdded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> {pick(STR.pipelineAdded, lang)}
                  </>
                ) : (
                  pick(STR.pipelineBtn, lang)
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* 등록 완료 토스트 */}
      <AnimatePresence>
        {pipelineAdded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-emerald-500/30 bg-[#0a1410]/95 px-4 py-3 shadow-xl backdrop-blur"
          >
            <p className="flex items-center gap-2 text-[12px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {pick(STR.toast, lang)}
            </p>
            <p className="mt-0.5 pl-6 text-[10.5px] text-zinc-500">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/inbox-triage/widgets.tsx
git commit -m "feat(inbox-triage): 메일 리스트·요약 바·상세/추출 패널 위젯"
```

---

### Task 4: 데스크톱 레이아웃 (`Desktop.tsx`)

**Files:**
- Create: `src/demos/aria/inbox-triage/Desktop.tsx`

이메일 클라이언트 2-pane: 좌측 메일 리스트(고정 폭) + 우측 상세 패널. 상단 툴바에 "AI 분류" 버튼(`data-demo-id="triage-run"`).

- [ ] **Step 1: Desktop.tsx 작성**

```tsx
import { Inbox, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { EMAILS, STR } from './data';
import { useInbox } from './state';
import { DetailPane, EmailList, SummaryBar } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, startTriage } = useInbox();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#12100b] text-zinc-200">
      {/* 툴바 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/90 text-[#27180a]">
          <Inbox className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Inbox <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-zinc-500">
          {fmt(pick(STR.unread, lang), { n: EMAILS.length })}
        </span>
        <button
          data-demo-id="triage-run"
          onClick={startTriage}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'raw' && 'bg-amber-500 text-[#27180a] hover:bg-amber-400',
            phase === 'scanning' && 'bg-amber-500/20 text-amber-300',
            phase === 'sorted' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'raw' && pick(STR.triageBtn, lang)}
          {phase === 'scanning' && pick(STR.triaging, lang)}
          {phase === 'sorted' && pick(STR.triageDone, lang)}
        </button>
      </header>

      <SummaryBar />

      {/* 2-pane */}
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e0c08]">
          <EmailList />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <DetailPane />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/inbox-triage/Desktop.tsx
git commit -m "feat(inbox-triage): 데스크톱 2-pane 레이아웃"
```

---

### Task 5: 모바일 레이아웃 (`Mobile.tsx`)

**Files:**
- Create: `src/demos/aria/inbox-triage/Mobile.tsx`

단일 컬럼 리스트, 메일 선택 시 상세가 풀스크린 시트로 덮는다.

- [ ] **Step 1: Mobile.tsx 작성**

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Inbox, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useInbox } from './state';
import { DetailPane, EmailList, SummaryBar } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, startTriage, selectedId, selectEmail } = useInbox();
  const lang = useLang();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#12100b] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-amber-500/90 text-[#27180a]">
          <Inbox className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Inbox</span>
        <button
          data-demo-id="triage-run"
          onClick={startTriage}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
            phase === 'raw' && 'bg-amber-500 text-[#27180a]',
            phase === 'scanning' && 'bg-amber-500/20 text-amber-300',
            phase === 'sorted' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {phase === 'raw' && pick(STR.triageBtn, lang)}
          {phase === 'scanning' && pick(STR.triaging, lang)}
          {phase === 'sorted' && pick(STR.triageDone, lang)}
        </button>
      </header>

      <SummaryBar />
      <EmailList compact />

      {/* 상세 풀스크린 시트 */}
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="absolute inset-0 z-10 flex flex-col bg-[#12100b]"
          >
            <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
              <button onClick={() => selectEmail(null)} className="flex items-center gap-0.5 text-[12px] text-zinc-400">
                <ChevronLeft className="h-4 w-4" /> {pick(STR.inboxTitle, lang)}
              </button>
            </header>
            <DetailPane compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/inbox-triage/Mobile.tsx
git commit -m "feat(inbox-triage): 모바일 레이아웃 — 풀스크린 상세 시트"
```

---

### Task 6: 시나리오 + 갤러리 등록 (`scenario.ts`, `index.ts`)

**Files:**
- Create: `src/demos/aria/inbox-triage/scenario.ts`
- Create: `src/demos/aria/inbox-triage/index.ts`

`index.ts`를 만들면 registry glob(`src/registry/index.ts:9`)이 자동 수집해 갤러리에 등장한다.

- [ ] **Step 1: scenario.ts 작성**

타이밍 근거: 스캔 9통 × 320ms ≈ 2.9s + 정렬 전환 0.55s → 4.6s 대기. 추출 6필드 × 380ms ≈ 2.3s → 3.4s 대기.

```ts
import type { Scenario } from '../../../engine/types';
import { EXTRACTION } from './data';
import { useInbox } from './state';

const st = () => useInbox.getState();
const TARGET = EXTRACTION.emailId;

/** v1 — 인박스 자동 정리: 분류 클릭 → 순차 스캔 → 우선순위 재정렬 → 긴급 메일 호버 요약 */
export const sortScenario: Scenario = {
  id: 'inbox-sort',
  steps: [
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'triage-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'triage-run', run: () => st().startTriage() },
    { kind: 'wait', ms: 4600 },
    { kind: 'cursor', target: `email-row-${TARGET}`, ms: 800 },
    { kind: 'do', run: () => st().setHovered(TARGET) },
    { kind: 'wait', ms: 2400 },
    { kind: 'do', run: () => st().setHovered(null) },
    { kind: 'wait', ms: 600 },
  ],
};

/** v2 — 메일에서 파이프라인까지: 분류된 인박스에서 긴급 의뢰 클릭 → 핵심 추출 → 파이프라인 등록 */
export const pipelineScenario: Scenario = {
  id: 'inbox-pipeline',
  steps: [
    { kind: 'do', run: () => st().seedSorted() },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: `email-row-${TARGET}`, ms: 700 },
    { kind: 'click', target: `email-row-${TARGET}`, run: () => st().selectEmail(TARGET) },
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'extract-run', run: () => st().extract() },
    { kind: 'wait', ms: 3400 },
    { kind: 'cursor', target: 'pipeline-add', ms: 700 },
    { kind: 'click', target: 'pipeline-add', run: () => st().addToPipeline() },
    { kind: 'wait', ms: 2400 },
  ],
};
```

- [ ] **Step 2: index.ts 작성**

```ts
import { Inbox } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useInbox } from './state';
import { pipelineScenario, sortScenario } from './scenario';

const inboxTriage: FeatureDefinition = {
  id: 'inbox-triage',
  title: '인박스 AI Triage',
  description: '쏟아지는 출재 의뢰 메일을 AI가 분류·우선순위화하고, 핵심 정보 추출부터 파이프라인 등록까지.',
  icon: Inbox,
  accent: '#f59e0b',
  Desktop,
  Mobile,
  resetState: () => useInbox.getState().reset(),
  variants: [
    {
      id: 'sort',
      label: '인박스 자동 정리',
      version: 'v1',
      sellingPoint: '시간 절약',
      url: 'insightre.ai/inbox',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 82% 10%, rgba(245,158,11,0.22), transparent 58%), radial-gradient(ellipse 60% 55% at 8% 90%, rgba(120,53,15,0.28), transparent 60%), linear-gradient(160deg, #171107 0%, #0b0804 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-amber-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-orange-800/20 blur-[120px]',
        ],
      },
      scenario: sortScenario,
    },
    {
      id: 'pipeline',
      label: '메일에서 파이프라인까지 30초',
      version: 'v2',
      sellingPoint: '엔드투엔드',
      url: 'insightre.ai/inbox',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(249,115,22,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(146,64,14,0.26), transparent 60%), linear-gradient(165deg, #151008 0%, #0a0703 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-orange-500/10 blur-[140px]'],
      },
      scenario: pipelineScenario,
    },
  ],
};

export default inboxTriage;
```

- [ ] **Step 3: 전체 빌드**

Run: `npm run build`
Expected: `tsc --noEmit` 통과 + vite build 성공 (exit 0)

- [ ] **Step 4: 커밋**

```powershell
git add src/demos/aria/inbox-triage/scenario.ts src/demos/aria/inbox-triage/index.ts
git commit -m "feat(inbox-triage): 시나리오 2종 + 갤러리 등록"
```

---

### Task 7: 수동 검증

**Files:** 없음 (검증만)

- [ ] **Step 1: dev 서버 기동**

Run: `npm run dev`
Expected: vite dev 서버 기동, localhost URL 출력

- [ ] **Step 2: 갤러리 확인**

브라우저에서 ARIA 프로젝트 갤러리에 "인박스 AI Triage" 카드(앰버 액센트, Inbox 아이콘)가 8번째로 보이는지 확인.

- [ ] **Step 3: v1 시나리오 재생 확인 (데스크톱)**

체크 항목:
- 시작 시 도착순 인박스, 전 메일에 안읽음 점
- "AI 분류" 클릭 → 위에서부터 한 통씩 앰버 글로우 + 배지 부착
- 마지막 메일 스캔 후 우선순위순으로 부드럽게 재정렬 (긴급 2통이 맨 위로)
- 요약 바 등장: 신규 의뢰 3 · 갱신 2 · 클레임 1 · 오늘 마감 2
- 커서가 한화 메일로 이동 → AI 요약 카드 펼쳐짐 → 닫힘

- [ ] **Step 4: v2 시나리오 재생 확인 (데스크톱)**

체크 항목:
- 시작 시 이미 분류 완료된 인박스 (요약 바 표시)
- 한화 메일 클릭 → 우측에 본문 + 첨부 칩
- "핵심 추출" 클릭 → 필드 6개가 하나씩 채워짐
- "갱신 파이프라인에 등록" 클릭 → 버튼이 "등록 완료"로 바뀌고 토스트 등장

- [ ] **Step 5: 모바일 + 언어 전환 + 리셋 확인**

체크 항목:
- 모바일 모드에서 v1/v2 재생 — v2에서 메일 선택 시 풀스크린 시트 전환
- 언어를 EN으로 바꿔 양 시나리오 재생 (영문 문자열 확인)
- 재생 중 리셋/변형 전환을 눌러도 이전 타이머가 상태를 덮어쓰지 않는지 (runId 가드)

- [ ] **Step 6: 이슈 발견 시 수정 후 커밋, 없으면 완료**

```powershell
git status
```
Expected: working tree clean (검증 중 수정이 있었다면 수정 커밋 후 clean)
