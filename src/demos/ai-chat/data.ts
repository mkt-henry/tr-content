export interface Evidence {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

export interface Answer {
  text: string;
  evidence?: Evidence[];
  source?: string;
}

export const SUGGESTED = [
  '이 특약의 사고당 한도와 면책금액은?',
  '최근 3년 클레임 이력을 요약해줘',
  'Hours Clause 조건은 어떻게 돼?',
];

export const ANSWERS: Record<string, Answer> = {
  [SUGGESTED[0]]: {
    text: '본 Property Cat XoL 특약의 사고당 한도(per occurrence limit)는 ₩300억, 자기보유(retention)는 ₩60억입니다.\n\n연간 누적 한도(aggregate)는 ₩600억이며, Reinstatement는 연 2회 · 100% 추가보험료 조건입니다. 한도 산정은 Ultimate Net Loss 기준이고, 풍수해의 경우 Hours Clause 168시간이 적용됩니다.',
    evidence: [
      { label: '사고당 한도', value: '₩300억', delta: 'Per Occurrence', positive: true },
      { label: '자기보유 (Retention)', value: '₩60억', delta: 'UNL 기준', positive: true },
      { label: '연간 누적 한도', value: '₩600억', delta: 'Aggregate', positive: true },
      { label: 'Reinstatement', value: '2회', delta: '@100% A.P.', positive: true },
    ],
    source: 'Slip p.3 §Limits · Treaty Wording Art.4',
  },
  [SUGGESTED[1]]: {
    text: '최근 3년간 본 특약에서 접수된 클레임은 총 4건, 지급 보험금 합계는 ₩142억입니다.\n\n2023년 태풍 카눈 관련 2건(₩96억)이 가장 컸고, 2024년 공장 화재 1건(₩31억), 2025년 집중호우 1건(₩15억)입니다. 3년 평균 손해율은 66%로 상승 추세이며, 태풍 익스포저 누적이 주요 요인입니다.',
    evidence: [
      { label: '클레임 건수 (3년)', value: '4건', delta: '지급 완료 3 · 진행 1', positive: true },
      { label: '지급 보험금 합계', value: '₩142억', delta: '태풍 카눈 ₩96억 포함', positive: false },
      { label: '3년 평균 손해율', value: '66%', delta: "'25년 74%로 상승", positive: false },
    ],
    source: 'Claims Bordereaux 2023–2025 · 분기 정산서',
  },
  [SUGGESTED[2]]: {
    text: 'Hours Clause는 풍수해(windstorm) 기준 연속 168시간입니다.\n\n하나의 사고(loss occurrence)로 간주되는 손해의 시간적 범위를 정하는 조항으로, 168시간 내 발생한 동일 원인 손해는 1건의 사고로 합산되어 사고당 한도와 자기보유가 1회만 적용됩니다. 지진의 경우 별도로 72시간이 적용됩니다.',
    evidence: [
      { label: '풍수해 (Windstorm)', value: '168시간', delta: '연속 기준', positive: true },
      { label: '지진 (Earthquake)', value: '72시간', delta: '연속 기준', positive: true },
      { label: '적용 기준', value: '동일 원인', delta: '1 Loss Occurrence 합산', positive: true },
    ],
    source: 'Treaty Wording Art.6 §Hours Clause',
  },
};

export const FALLBACK: Answer = {
  text: '해당 질문은 현재 선택된 Korean Re Property Cat XoL 특약 문서를 기준으로 답변드릴 수 있습니다. 한도, 면책, 클레임 이력, 특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 특약의 사고당 한도와 면책금액은?"',
};
