import type { L } from '../_shared/i18n';

// ---------------------------------------------------------------------------
// 갱신 결과 보고서 콘텐츠 — 한화생명 Term Life XL 2026 갱신
// ---------------------------------------------------------------------------

/** 갱신 개요 지표 한 줄 */
export interface MetricRow {
  label: L;
  value: L;
  note?: L;
}

/** 재보험사 패널 구성 한 줄 */
export interface PanelMember {
  name: string;
  share: number; // %
  rating: string; // S&P 신용등급
  role?: L; // 리드/팔로우
}

/** 전년 대비 변경 한 줄 */
export interface ChangeRow {
  label: L;
  from: L;
  to: L;
  positive?: boolean;
}

/** 보고서 표지 정보 */
export const DEAL = {
  name: { ko: '한화생명 Term Life XL', en: 'Hanwha Life Term Life XL' } as L,
  renewalDate: '2026.07.01',
  cedent: { ko: '한화생명', en: 'Hanwha Life' } as L,
  period: { ko: '2026.07.01 – 2027.06.30', en: '2026.07.01 – 2027.06.30' } as L,
  reportNo: 'ALZ-RR-2026-0142',
  issued: '2026.06.12',
  classType: { ko: '생명 초과손해액 (XL)', en: 'Life Excess of Loss (XL)' } as L,
};

export const OVERVIEW: MetricRow[] = [
  { label: { ko: '갱신 요율', en: 'Renewal rate' }, value: { ko: '+6.5%', en: '+6.5%' }, note: { ko: '전년 대비', en: 'vs. prior year' } },
  { label: { ko: '보유 (Retention)', en: 'Retention' }, value: { ko: '₩30억', en: '₩3.0bn' } },
  { label: { ko: '재보험 한도 (Limit)', en: 'Limit' }, value: { ko: '₩100억', en: '₩10.0bn' } },
  { label: { ko: 'Sum at Risk', en: 'Sum at Risk' }, value: { ko: '약 ₩800억', en: '~₩80bn' } },
];

export const PANEL: PanelMember[] = [
  { name: 'Korean Re', share: 40, rating: 'A', role: { ko: '리드', en: 'Lead' } },
  { name: 'Gen Re', share: 30, rating: 'AA+' },
  { name: 'Hannover Re', share: 20, rating: 'AA-' },
  { name: 'SCOR', share: 10, rating: 'AA-' },
];

/** 패널 가중평균 신용도 (표시용) */
export const PANEL_SECURITY: L = { ko: '가중평균 S&P AA-', en: 'Weighted avg S&P AA-' };

// ---------------------------------------------------------------------------
// Executive Summary — 서술형 핵심 요약 (문단 배열)
// ---------------------------------------------------------------------------

export const EXEC_SUMMARY: L<string[]> = {
  ko: [
    '한화생명 Term Life XL 2026 갱신을 재보험사 4사 패널로 완료했습니다. 최근 3년 손해율이 71%→49%로 꾸준히 개선되며, 갱신 요율은 시장 평균(+8%) 대비 양호한 +6.5% 수준에서 확정됐습니다.',
    '출재사가 요청한 Cat 사고당 한도는 ₩80억에서 ₩100억으로 상향 반영했고, 주요 약관 조건은 전년 수준을 유지해 커버 공백이 없습니다. Hannover Re를 신규 편입해 패널 수용력과 평균 신용도를 함께 강화했습니다.',
  ],
  en: [
    'The Hanwha Life Term Life XL 2026 renewal has been placed across a four-reinsurer panel. With the three-year loss ratio improving steadily from 71% to 49%, the renewal rate was settled at +6.5% — favourable versus the market average of +8%.',
    'The cedent-requested Cat per-event limit was raised from ₩8.0bn to ₩10.0bn while key wording terms were held at prior-year levels, leaving no cover gap. Adding Hannover Re strengthened both panel capacity and average security.',
  ],
};

// ---------------------------------------------------------------------------
// Loss Experience — 최근 3년 손해율 (요율 근거)
// ---------------------------------------------------------------------------

export interface LossYear {
  year: string;
  ratio: number; // 손해율 %
}

export const LOSS_RUN = {
  years: [
    { year: '2023', ratio: 71 },
    { year: '2024', ratio: 58 },
    { year: '2025', ratio: 49 },
  ] as LossYear[],
  avg: 59, // 3년 평균 손해율 %
  benchmark: 75, // 포트폴리오 벤치마크 손해율 %
};

// ---------------------------------------------------------------------------
// Program Structure — 보유 → 재보험 레이어 → 한도 (타워)
// ---------------------------------------------------------------------------

export interface StructureLayer {
  id: string;
  label: L;
  band: L;
  span: number; // 타워 높이 비중
  kind: 'retention' | 'reinsured';
}

export const STRUCTURE = {
  layers: [
    {
      id: 'reinsured',
      label: { ko: '재보험 레이어', en: 'Reinsured layer' },
      band: { ko: '₩30억 초과 ₩70억', en: '₩7.0bn xs ₩3.0bn' },
      span: 70,
      kind: 'reinsured',
    },
    {
      id: 'retention',
      label: { ko: '자기보유', en: 'Retention' },
      band: { ko: '₩0 – ₩30억', en: '₩0 – ₩3.0bn' },
      span: 30,
      kind: 'retention',
    },
  ] as StructureLayer[],
  limit: { ko: '한도 ₩100억', en: 'Limit ₩10.0bn' } as L,
  catLimit: { ko: 'Cat 1사고당 ₩100억', en: 'Cat per-event ₩10.0bn' } as L,
  sumAtRisk: { ko: 'Sum at Risk 약 ₩800억', en: 'Sum at Risk ~₩80bn' } as L,
};

export const CHANGES: ChangeRow[] = [
  {
    label: { ko: '갱신 요율', en: 'Renewal rate' },
    from: { ko: '전년 기준', en: 'prior' },
    to: { ko: '+6.5%', en: '+6.5%' },
    positive: false,
  },
  {
    label: { ko: 'Cat 1사고 한도', en: 'Cat per-event limit' },
    from: { ko: '₩80억', en: '₩8.0bn' },
    to: { ko: '₩100억', en: '₩10.0bn' },
    positive: true,
  },
  {
    label: { ko: '재보험사 패널', en: 'Reinsurer panel' },
    from: { ko: '3사', en: '3 reinsurers' },
    to: { ko: '4사 (Hannover Re 신규)', en: '4 (Hannover Re added)' },
    positive: true,
  },
  {
    label: { ko: '자살 면책', en: 'Suicide exclusion' },
    from: { ko: '2년', en: '2-year' },
    to: { ko: '2년 (유지)', en: '2-year (kept)' },
    positive: true,
  },
];

export const CONCLUSION: L<string[]> = {
  ko: [
    '패널 4사로 분산 — 신용도·수용력(capacity) 안정적',
    '갱신 요율 +6.5%는 시장 평균(+8%) 대비 양호',
    '주요 조건 전년 수준 유지 — 커버 공백 없음',
    '권고: 출재사 검토 후 서명 진행',
  ],
  en: [
    'Spread across a 4-reinsurer panel — stable credit & capacity',
    'Renewal rate +6.5% is favourable vs. market average (+8%)',
    'Key terms held at prior-year levels — no cover gap',
    'Recommendation: proceed to signing after cedent review',
  ],
};

// ---------------------------------------------------------------------------
// 전달 이메일 — v1(표준) / v2(수신자 맞춤)
// ---------------------------------------------------------------------------

export const ATTACHMENT = {
  file: { ko: 'TermLifeXL_2026_갱신결과보고서.pdf', en: 'TermLifeXL_2026_RenewalReport.pdf' } as L,
  size: '1.2 MB',
};

// ---------------------------------------------------------------------------
// 근거 자료 — 사용자가 선택/첨부하여 보고서 생성 근거로 사용
// ---------------------------------------------------------------------------

export interface SourceDoc {
  id: string;
  label: L;
  meta: L;
  defaultOn: boolean;
}

export const SOURCES: SourceDoc[] = [
  { id: 'slip', label: { ko: 'Term Life XL 슬립', en: 'Term Life XL slip' }, meta: { ko: 'HW_TermLife_XL_Slip_2026.pdf', en: 'HW_TermLife_XL_Slip_2026.pdf' }, defaultOn: true },
  { id: 'lossrun', label: { ko: '손해실적 3년', en: '3-year loss run' }, meta: { ko: '2023–2025 Loss run', en: '2023–2025 loss run' }, defaultOn: true },
  { id: 'quotes', label: { ko: '재보험사 견적 시트', en: 'Reinsurer quote sheets' }, meta: { ko: '4사 Quote sheets', en: '4 reinsurer quotes' }, defaultOn: true },
  { id: 'prior', label: { ko: '전년 갱신 특약', en: 'Prior-year treaty' }, meta: { ko: '2025 Placement', en: '2025 placement' }, defaultOn: false },
  { id: 'notes', label: { ko: '브로커 노트', en: 'Broker notes' }, meta: { ko: '메일 스레드 요약', en: 'email thread summary' }, defaultOn: false },
];

// ---------------------------------------------------------------------------
// 수신자 — 선택 시 AI가 목적·맥락·핵심 메시지·톤을 분석하고 맞춤 이메일 초안 생성
// ---------------------------------------------------------------------------

export interface RecipientAnalysis {
  purpose: L;
  context: L;
  points: L<string[]>;
  tone: L;
}

export interface Recipient {
  id: string;
  name: L;
  role: L;
  addr: string;
  analysis: RecipientAnalysis;
  subject: L;
  body: L;
}

export const RECIPIENTS: Recipient[] = [
  {
    id: 'cedent',
    name: { ko: '김도현 부장', en: 'D.H. Kim' },
    role: { ko: '한화생명 재보험팀 · 출재사', en: 'Hanwha Life Reinsurance · Cedent' },
    addr: 'dhkim@hanwhalife.com',
    analysis: {
      purpose: { ko: '갱신 결과 보고 및 검토 후 서명 요청', en: 'Report the renewal result & request sign-off' },
      context: { ko: '지난 대화에서 김 부장이 "Cat 사고당 한도 확대"를 요청 → 반영 결과를 우선 강조', en: 'Mr. Kim previously asked to raise the Cat per-event limit → lead with that it was applied' },
      points: {
        ko: ['Cat 1사고 한도 ₩80억→₩100억 반영', '요율 +6.5% (시장 평균 +8% 대비 양호)', '검토 후 서명 권고'],
        en: ['Cat per-event limit ₩8.0bn→₩10.0bn applied', 'Rate +6.5% (favourable vs. market +8%)', 'Recommend signing after review'],
      },
      tone: { ko: '정중한 보고체', en: 'Courteous reporting' },
    },
    subject: {
      ko: '[갱신 완료] Term Life XL 2026 — 요청하신 Cat 한도 상향 반영 결과',
      en: '[Placed] Term Life XL 2026 — incl. the Cat limit increase you requested',
    },
    body: {
      ko: `한화생명 재보험팀 김도현 부장님,

지난 갱신 때 말씀하신 Cat 사고당 한도 확대 요청을 반영해, Term Life XL 2026 갱신 결과를 보고드립니다.

· Cat 1사고 한도: ₩80억 → ₩100억 상향 반영
· 갱신 요율: 전년 대비 +6.5% (시장 평균 +8% 대비 양호)
· 재보험사 패널: Korean Re 40% · Gen Re 30% · Hannover Re 20% · SCOR 10% (Hannover Re 신규)

커버 공백 여부도 함께 점검했으며, 상세는 첨부한 「갱신 결과 보고서」에 정리했습니다. 검토 후 서명 진행을 권고드립니다.

감사합니다.
AlphaLenz 재보험 중개팀 드림`,
      en: `Dear Mr. Kim, Hanwha Life Reinsurance,

Reflecting the Cat per-event limit increase you raised last time, here is the Term Life XL 2026 renewal result.

· Cat per-event limit: ₩8.0bn → ₩10.0bn (increase applied)
· Renewal rate: +6.5% vs. prior year (favourable vs. market avg +8%)
· Reinsurer panel: Korean Re 40% · Gen Re 30% · Hannover Re 20% · SCOR 10% (Hannover Re new)

We also checked for any cover gap; details are in the attached Renewal Result Report. We recommend proceeding to signing after your review.

Best regards,
AlphaLenz Reinsurance Broking`,
    },
  },
  {
    id: 'lead',
    name: { ko: '박영준 인수역', en: 'Y.J. Park' },
    role: { ko: 'Korean Re · 리드 40%', en: 'Korean Re · Lead 40%' },
    addr: 'yjpark@koreanre.com',
    analysis: {
      purpose: { ko: '플레이스먼트 확정 통지 및 슬립 서명(Firm order) 요청', en: 'Confirm placement & request signed slip (firm order)' },
      context: { ko: 'Korean Re가 리드 40% 인수 확정 → 펌오더·서명 단계, 회신 기한 명시 필요', en: 'Korean Re confirmed as lead at 40% → firm-order/signing stage; state a reply deadline' },
      points: {
        ko: ['Lead 40% 인수 확정', '최종 슬립·조건 첨부', '서명 회신 요청 (기한 6/20)'],
        en: ['Lead 40% confirmed', 'Final slip & terms attached', 'Request signed slip by Jun 20'],
      },
      tone: { ko: '간결한 실무 비즈니스체', en: 'Concise business' },
    },
    subject: {
      ko: '[Firm Order] HW Term Life XL 2026 — Lead 40% 서명 요청',
      en: '[Firm Order] HW Term Life XL 2026 — Lead 40% signature requested',
    },
    body: {
      ko: `박영준 인수역님,

HW Term Life XL 2026 갱신 플레이스먼트가 확정되어 펌오더를 전달드립니다. Korean Re는 리드로 40% 인수합니다.

· 인수 지분: Lead 40% (패널: Gen Re 30 · Hannover Re 20 · SCOR 10)
· 조건: 보유 ₩30억 / 한도 ₩100억 · Cat 1사고 한도 ₩100억
· 보험기간: 2026.07.01 – 2027.06.30

최종 슬립과 조건 요약(「갱신 결과 보고서」)을 첨부합니다. 6월 20일까지 서명 슬립 회신 부탁드립니다.

감사합니다.
AlphaLenz 재보험 중개팀 드림`,
      en: `Dear Mr. Park,

The HW Term Life XL 2026 renewal is confirmed; please find our firm order. Korean Re takes the lead at 40%.

· Share: Lead 40% (panel: Gen Re 30 · Hannover Re 20 · SCOR 10)
· Terms: Retention ₩3.0bn / Limit ₩10.0bn · Cat per-event limit ₩10.0bn
· Period: 2026.07.01 – 2027.06.30

The final slip and a terms summary (Renewal Result Report) are attached. Please return the signed slip by June 20.

Best regards,
AlphaLenz Reinsurance Broking`,
    },
  },
  {
    id: 'exec',
    name: { ko: '경영진', en: 'Management' },
    role: { ko: '사내 · 실적 보고', en: 'Internal · Performance report' },
    addr: 'cro@alphalenz.com',
    analysis: {
      purpose: { ko: '갱신 완료 실적 내부 보고', en: 'Internal report of the completed renewal' },
      context: { ko: '분기 갱신 파이프라인 성과 — Term Life XL 마감 건을 요점 중심으로', en: 'Quarterly renewal pipeline performance — summarise the closed Term Life XL deal' },
      points: {
        ko: ['요율 +6.5%, 시장 평균(+8%) 대비 선방', '패널 4사 확보 (Hannover Re 신규)', '커버 공백 없음 — 리스크 안정'],
        en: ['Rate +6.5%, ahead of market (+8%)', '4-reinsurer panel secured (Hannover Re new)', 'No cover gap — risk stable'],
      },
      tone: { ko: '요점 중심 내부 보고체', en: 'Crisp internal summary' },
    },
    subject: {
      ko: '[내부보고] Term Life XL 갱신 완료 — 요율 +6.5%, 패널 4사 확보',
      en: '[Internal] Term Life XL placed — rate +6.5%, 4-reinsurer panel secured',
    },
    body: {
      ko: `경영진 보고드립니다.

한화생명 Term Life XL 2026 갱신 플레이스먼트를 완료했습니다.

· 갱신 요율: +6.5% (시장 평균 +8% 대비 선방)
· 패널: Korean Re 40 · Gen Re 30 · Hannover Re 20 · SCOR 10 — 4사 확보, 신용도·수용력 안정
· 주요 조건 전년 수준 유지, 커버 공백 없음

상세는 첨부한 「갱신 결과 보고서」 참고 부탁드립니다. 출재사 서명 절차 진행 예정입니다.

AlphaLenz 재보험 중개팀`,
      en: `For management,

We have completed the Hanwha Life Term Life XL 2026 renewal placement.

· Renewal rate: +6.5% (ahead of market avg +8%)
· Panel: Korean Re 40 · Gen Re 30 · Hannover Re 20 · SCOR 10 — 4 reinsurers, stable credit & capacity
· Key terms held at prior-year levels, no cover gap

See the attached Renewal Result Report for details. Cedent signing is next.

AlphaLenz Reinsurance Broking`,
    },
  },
];

export function getRecipient(id: string | null): Recipient | undefined {
  return RECIPIENTS.find((r) => r.id === id);
}

/** 보고서 섹션 등장 순서 */
export const REPORT_SECTIONS = [
  'cover',
  'summary',
  'overview',
  'lossrun',
  'structure',
  'panel',
  'changes',
  'conclusion',
] as const;
export type ReportSectionId = (typeof REPORT_SECTIONS)[number];

// ---------------------------------------------------------------------------
// UI 문자열
// ---------------------------------------------------------------------------

export const STR = {
  appTitle: { ko: '갱신 결과 보고서', en: 'Renewal Result Report' },
  panelMeta: { ko: '플레이스먼트 완료 · 2026.07.01 갱신', en: 'Placement complete · 2026.07.01 renewal' },

  generateBtn: { ko: '보고서 생성', en: 'Generate report' },
  regenerateBtn: { ko: '다시 생성', en: 'Regenerate' },
  generating: { ko: '생성 중…', en: 'Generating…' },
  statusAnalyzing: { ko: '계약·플레이스먼트 데이터 분석 중…', en: 'Analysing treaty & placement data…' },
  statusReport: { ko: '보고서 작성 중…', en: 'Drafting report…' },
  statusEmail: { ko: '전달 이메일 초안 작성 중…', en: 'Drafting delivery email…' },
  statusDone: { ko: '보고서·전달 이메일 초안 완료', en: 'Report & delivery email ready' },

  reportEmptyTitle: { ko: '갱신 결과 보고서가 여기에 생성됩니다', en: 'The renewal result report appears here' },
  reportEmptySub: { ko: '“보고서 생성”을 누르면 플레이스먼트 데이터로 초안을 만듭니다', en: 'Tap “Generate report” to draft from placement data' },
  reportReadyBadge: { ko: '보고서 완성', en: 'Report ready' },

  overviewTitle: { ko: '갱신 개요', en: 'Renewal overview' },
  panelTitle: { ko: '재보험사 패널 구성', en: 'Reinsurer panel' },
  changesTitle: { ko: '전년 대비 주요 변경', en: 'Key changes vs. prior year' },
  conclusionTitle: { ko: '결론 · 권고', en: 'Conclusion & recommendation' },
  coverTag: { ko: '갱신 결과 보고서', en: 'Renewal Result Report' },

  // 신규 섹션
  summaryTitle: { ko: 'Executive Summary', en: 'Executive Summary' },
  lossTitle: { ko: '손해실적 · 최근 3년', en: 'Loss experience · 3-year' },
  lossAvgLabel: { ko: '3년 평균', en: '3-yr avg' },
  lossBenchLabel: { ko: '포트폴리오 벤치마크', en: 'Portfolio benchmark' },
  lossImproving: { ko: '개선 추세', en: 'Improving' },
  lossNote: {
    ko: '손해율 개선이 요율 인상 폭(+6.5%)을 시장 평균 이하로 억제',
    en: 'Improving loss ratio held the rate increase (+6.5%) below the market average',
  },
  structureTitle: { ko: '프로그램 구조', en: 'Program structure' },
  panelSecurityLabel: { ko: '패널 보안성', en: 'Panel security' },
  ratingTag: { ko: 'S&P', en: 'S&P' },

  // 표지 메타
  reportNoLabel: { ko: '보고서 번호', en: 'Report no.' },
  issuedLabel: { ko: '발행일', en: 'Issued' },
  classLabel: { ko: '담보 종류', en: 'Class' },
  statusPlaced: { ko: '플레이스먼트 완료', en: 'Placement complete' },

  // 이메일 CTA · 모달
  emailCta: { ko: '이메일로 전달', en: 'Send via email' },
  emailModalTitle: { ko: '전달 이메일 작성', en: 'Compose delivery email' },
  closeLabel: { ko: '닫기', en: 'Close' },

  // 근거 자료 선택
  sourcesTitle: { ko: '근거 자료 선택', en: 'Select source materials' },
  sourcesHint: { ko: '보고서 생성에 사용할 자료를 선택하세요', en: 'Pick the materials to build the report from' },
  sourceSummary: { ko: '근거 자료 {n}건', en: '{n} source materials' },

  // 수신자 선택 + AI 의도 분석
  statusPickRecipient: { ko: '전달 대상을 선택하세요', en: 'Select a recipient' },
  statusAnalyzingIntent: { ko: '지난 대화·자료 기반 의도 분석 중…', en: 'Analysing intent from context & materials…' },
  recipientTitle: { ko: '전달 대상 선택', en: 'Select recipient' },
  recipientHint: { ko: '수신자를 고르면 AI가 목적·제목·내용을 분석합니다', en: 'Pick a recipient — AI infers the purpose, subject & content' },
  analysisTitle: { ko: 'AI 의도 분석', en: 'AI intent analysis' },
  purposeLabel: { ko: '목적', en: 'Purpose' },
  contextLabel: { ko: '근거 맥락', en: 'Context' },
  pointsLabel: { ko: '핵심 메시지', en: 'Key points' },
  toneLabel: { ko: '톤', en: 'Tone' },
  changeRecipient: { ko: '수신자 변경', en: 'Change recipient' },

  emailTitle: { ko: '전달 이메일 초안', en: 'Delivery email draft' },
  emailEmpty: { ko: '보고서가 완성되면 전달 이메일 초안이 여기에 작성됩니다', en: 'Once the report is ready, the delivery email is drafted here' },
  emailDoneBadge: { ko: '초안 완성 · 검토 후 발송', en: 'Draft ready · review & send' },
  toLabel: { ko: '받는 사람', en: 'To' },
  subjectLabel: { ko: '제목', en: 'Subject' },
  attachmentLabel: { ko: '첨부', en: 'Attachment' },
  sendBtn: { ko: '검토 후 발송', en: 'Review & send' },
} satisfies Record<string, L>;
