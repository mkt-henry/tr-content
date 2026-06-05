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
    subject: { ko: '다음 주 미팅 일정 조율', en: 'Scheduling next week\'s meeting' },
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
