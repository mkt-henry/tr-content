import type { L, Lang } from '../i18n';

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

/** 질문·답변 한 쌍 — 질문/답변 모두 언어별 버전을 가진다 */
export interface QAItem {
  question: L;
  answer: L<Answer>;
}

/** 갱신 파이프라인에 등록된 출재 건 — "/"·"+"로 컨텍스트(출처)로 지정한다 */
export interface Pipeline {
  id: string;
  /** "/" 명령어 토큰 (예: 'termlife' → /termlife) */
  slash: string;
  /** 표시 라벨 */
  label: L;
  /** 연결되는 문서(슬립) 파일명 */
  file: string;
  /** 메뉴 부제 한 줄 (예: '마감 임박 · TSI ₩800억') */
  meta: L;
  /** 우선순위 강조 (긴급 갱신 건) */
  urgent?: boolean;
  /** 이 건 기준 추천 질문·답변 */
  qa: QAItem[];
  /** 매칭되는 질문이 없을 때의 안내 */
  fallback: L<Answer>;
}

/** 한화생명 Term Life XL — 인박스 → 파이프라인 데모와 연결된 주력 건 */
const termLifeXL: Pipeline = {
  id: 'termlife',
  slash: 'termlife',
  label: { ko: '한화생명 Term Life XL', en: 'Hanwha Life Term Life XL' },
  file: 'HW_TermLife_XL_Slip_2026.pdf',
  meta: { ko: '마감 임박 · TSI ₩800억', en: 'Due soon · TSI ₩80bn' },
  urgent: true,
  qa: [
    {
      question: {
        ko: '이 출재 건의 보유·한도 조건은?',
        en: "What are this cession's retention and limit?",
      },
      answer: {
        ko: {
          text: '본 건은 단체 정기보험(Term Life) 초과손해(XL) 재보험으로, 출재사 보유(Retention)는 ₩30억, 재보험 한도(Limit)는 ₩100억입니다.\n\nSum at Risk(SAR)는 약 ₩800억 규모이며, 한도와 보유는 1인당(per life) · 1사고당(per event) 기준으로 적용됩니다. 즉 단일 피보험자 또는 단일 집단사고에서 보유 ₩30억을 초과하는 손해를 ₩100억 한도까지 재보험사가 부담합니다.',
          evidence: [
            { label: '보종 (Line)', value: '단체 정기보험 XL', delta: 'Excess of Loss', positive: true },
            { label: 'Retention (보유)', value: '₩30억', delta: 'per life / per event', positive: true },
            { label: 'Limit (한도)', value: '₩100억', delta: '보유 초과분', positive: true },
            { label: 'Sum at Risk', value: '약 ₩800억', delta: 'TSI 기준', positive: true },
          ],
          source: 'Slip p.2 §Cover · Reinsurance Wording Art.3',
        },
        en: {
          text: 'This is a group term life excess-of-loss (XL) reinsurance, with a cedent retention of ₩3bn and a reinsurance limit of ₩10bn.\n\nThe Sum at Risk (SAR) is approximately ₩80bn. Limit and retention apply on a per-life and per-event basis: for any single insured life or a single catastrophe event, the reinsurer covers losses above the ₩3bn retention up to the ₩10bn limit.',
          evidence: [
            { label: 'Line', value: 'Group Term Life XL', delta: 'Excess of Loss', positive: true },
            { label: 'Retention', value: '₩3bn', delta: 'per life / per event', positive: true },
            { label: 'Limit', value: '₩10bn', delta: 'above retention', positive: true },
            { label: 'Sum at Risk', value: '~₩80bn', delta: 'TSI basis', positive: true },
          ],
          source: 'Slip p.2 §Cover · Reinsurance Wording Art.3',
        },
      },
    },
    {
      question: {
        ko: '보험기간과 담보 범위는?',
        en: 'What is the period and scope of cover?',
      },
      answer: {
        ko: {
          text: '보험기간은 2026.07.01부터 2027.06.30까지 1년이며, 출재사는 한화생명입니다.\n\n담보 범위는 단체 정기보험의 사망담보 초과손해로, 피보험 집단에서 발생한 사망보험금 중 보유(₩30억)를 초과하는 부분을 재보험사가 부담합니다. 1년 누적 기준으로 보장되며, 출재 방식은 XL(Excess of Loss) 구조입니다.',
          evidence: [
            { label: '보험기간 (Period)', value: '2026.07.01–2027.06.30', delta: '1년', positive: true },
            { label: '담보 (Cover)', value: '사망담보 초과손해', delta: 'Term Life death benefit', positive: true },
            { label: '출재방식 (Basis)', value: 'XL', delta: 'Excess of Loss', positive: true },
            { label: '출재사 (Cedent)', value: '한화생명', delta: 'Hanwha Life', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured',
        },
        en: {
          text: 'The period of cover runs one year, from 2026.07.01 to 2027.06.30, with Hanwha Life as the ceding company.\n\nCover is excess of loss on the death benefit of a group term life portfolio: the reinsurer pays death claims above the ₩3bn retention. Cover applies on a one-year aggregate basis under an excess-of-loss (XL) structure.',
          evidence: [
            { label: 'Period', value: '2026.07.01–2027.06.30', delta: '1 year', positive: true },
            { label: 'Cover', value: 'Death benefit XL', delta: 'Group term life', positive: true },
            { label: 'Basis', value: 'XL', delta: 'Excess of Loss', positive: true },
            { label: 'Cedent', value: 'Hanwha Life', delta: '한화생명', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured',
        },
      },
    },
    {
      question: {
        ko: '주요 면책·특별 조항은?',
        en: 'What are the key exclusions and special clauses?',
      },
      answer: {
        ko: {
          text: '주요 면책·특별 조항은 다음과 같습니다.\n\n자살은 계약(또는 부활) 후 2년 이내 발생 시 면책되며, 전쟁·테러·내란으로 인한 사망은 담보에서 제외됩니다. 집단사고(catastrophe)는 1사고당 한도가 적용되어 단일 사고에서 다수 사망이 발생하더라도 ₩100억 한도로 제한됩니다. 위험 직업·위험등급 가입자에 대해서는 별도 인수기준과 할증이 적용됩니다.',
          evidence: [
            { label: '자살 면책', value: '계약 후 2년', delta: '부활 시 재기산', positive: true },
            { label: '전쟁·테러', value: '면책', delta: 'War & Terrorism 제외', positive: false },
            { label: '집단사고 (Cat)', value: '1사고 한도', delta: '₩100억 cap', positive: true },
            { label: '직업·위험등급', value: '별도 인수기준', delta: '할증 적용', positive: true },
          ],
          source: 'Reinsurance Wording Art.7 §Exclusions & Special Conditions',
        },
        en: {
          text: 'The key exclusions and special clauses are as follows.\n\nSuicide is excluded if it occurs within 2 years of inception (or reinstatement). Death caused by war, terrorism or civil commotion is excluded. A catastrophe (single-event) limit applies, so even multiple deaths from one event are capped at the ₩10bn limit. Hazardous occupations and substandard risk classes are subject to separate underwriting terms and loadings.',
          evidence: [
            { label: 'Suicide exclusion', value: '2-year', delta: 'resets on reinstatement', positive: true },
            { label: 'War & terrorism', value: 'Excluded', delta: 'no cover', positive: false },
            { label: 'Catastrophe', value: 'Per-event cap', delta: '₩10bn limit', positive: true },
            { label: 'Occupation / class', value: 'Separate terms', delta: 'loadings apply', positive: true },
          ],
          source: 'Reinsurance Wording Art.7 §Exclusions & Special Conditions',
        },
      },
    },
  ],
  fallback: {
    ko: {
      text: '현재 지정된 한화생명 Term Life XL 슬립을 기준으로 답변드립니다. 보유·한도 조건, 보험기간·담보 범위, 면책·특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 출재 건의 보유·한도 조건은?"',
    },
    en: {
      text: 'I answer based on the selected Hanwha Life Term Life XL slip. Which would you like to explore — retention & limit, period & scope of cover, or exclusions & special clauses?\n\ne.g. "What are this cession\'s retention and limit?"',
    },
  },
};

export const samsungCI: Pipeline = {
  id: 'samsung-ci',
  slash: 'samsung',
  label: { ko: '삼성화재 CI 재보험', en: 'Samsung F&M CI Reinsurance' },
  file: 'SamsungFM_CI_QS_Slip_2026.pdf',
  meta: { ko: '비례 50% · TSI ₩1,200억', en: 'Quota share 50% · TSI ₩120bn' },
  qa: [
    {
      question: {
        ko: '이 출재 건의 출재율·보유 조건은?',
        en: "What are this cession's cession rate and retention?",
      },
      answer: {
        ko: {
          text: '본 건은 중대질병(Critical Illness) 비례재보험(Quota Share)으로, 출재율(Cession rate)은 50%, 출재사 보유(Retention)는 나머지 50%입니다.\n\n원수 포트폴리오의 총보험가입금액(TSI)은 ₩1,200억 규모로, 재보험사는 그중 50%인 약 ₩600억을 비례 인수합니다. 보험료·보험금·사업비가 출재 비율과 동일하게 안분되며, 1인당 자동인수한도(Automatic acceptance)는 ₩3억으로 설정되어 이를 초과하는 위험은 임의재보험(Facultative)으로 별도 처리합니다.',
          evidence: [
            { label: '보종 (Line)', value: '중대질병 QS', delta: 'Critical Illness Quota Share', positive: true },
            { label: 'Cession rate (출재율)', value: '50%', delta: '보유 50%', positive: true },
            { label: 'TSI (총가입금액)', value: '₩1,200억', delta: '출재분 약 ₩600억', positive: true },
            { label: '자동인수한도', value: '₩3억', delta: 'per life · 초과분 Fac', positive: true },
          ],
          source: 'Slip p.2 §Cession Basis · Reinsurance Wording Art.2',
        },
        en: {
          text: 'This is a Critical Illness (CI) quota share reinsurance, with a cession rate of 50% and the cedent retaining the remaining 50%.\n\nThe ceding portfolio carries a Total Sum Insured (TSI) of about ₩120bn, of which the reinsurer accepts 50% (~₩60bn) on a proportional basis. Premium, claims and expenses are shared in the same proportion as the cession. The automatic acceptance limit is ₩300m per life; risks above that limit are placed facultatively.',
          evidence: [
            { label: 'Line', value: 'CI Quota Share', delta: 'Critical Illness', positive: true },
            { label: 'Cession rate', value: '50%', delta: '50% retained', positive: true },
            { label: 'TSI', value: '₩120bn', delta: 'ceded ~₩60bn', positive: true },
            { label: 'Auto acceptance', value: '₩300m', delta: 'per life · excess Fac', positive: true },
          ],
          source: 'Slip p.2 §Cession Basis · Reinsurance Wording Art.2',
        },
      },
    },
    {
      question: {
        ko: '보험기간과 담보(CI) 범위는?',
        en: 'What is the period and the CI scope of cover?',
      },
      answer: {
        ko: {
          text: '보험기간은 2026.08.01부터 2027.07.31까지 1년이며, 출재사는 삼성화재입니다.\n\n담보는 중대질병(CI) 진단보험금으로, 약관상 정의된 암(Cancer)·급성심근경색(Acute Myocardial Infarction)·뇌졸중(Stroke)을 핵심 3대 질병으로 하며 말기신부전·주요장기이식 등을 포함합니다. 진단 확정 시 가입금액의 100%를 정액 지급하는 구조로, 재보험사는 지급된 진단보험금의 50%를 비례 부담합니다.',
          evidence: [
            { label: '보험기간 (Period)', value: '2026.08.01–2027.07.31', delta: '1년', positive: true },
            { label: '담보 (Cover)', value: 'CI 진단보험금', delta: '암·심근경색·뇌졸중', positive: true },
            { label: '지급방식', value: '진단 정액 100%', delta: 'lump-sum on diagnosis', positive: true },
            { label: '출재사 (Cedent)', value: '삼성화재', delta: 'Samsung Fire & Marine', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured · Wording Art.4 §CI Definitions',
        },
        en: {
          text: 'The period of cover runs one year, from 2026.08.01 to 2027.07.31, with Samsung Fire & Marine as the ceding company.\n\nCover is the Critical Illness (CI) diagnosis benefit. The three core insured conditions are Cancer, Acute Myocardial Infarction and Stroke as defined in the wording, alongside end-stage renal failure and major organ transplant. The benefit is a lump sum of 100% of the sum insured on confirmed diagnosis, and the reinsurer bears 50% of each benefit paid on a proportional basis.',
          evidence: [
            { label: 'Period', value: '2026.08.01–2027.07.31', delta: '1 year', positive: true },
            { label: 'Cover', value: 'CI diagnosis benefit', delta: 'cancer · AMI · stroke', positive: true },
            { label: 'Benefit', value: '100% lump sum', delta: 'on diagnosis', positive: true },
            { label: 'Cedent', value: 'Samsung F&M', delta: '삼성화재', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured · Wording Art.4 §CI Definitions',
        },
      },
    },
    {
      question: {
        ko: '주요 면책·특별 조항은?',
        en: 'What are the key exclusions and special clauses?',
      },
      answer: {
        ko: {
          text: '주요 면책·특별 조항은 다음과 같습니다.\n\n보장개시일로부터 90일의 대기기간(Waiting period)이 적용되어, 이 기간 내 진단된 중대질병은 면책됩니다. 청약 전 이미 발병·진단된 기왕증(Pre-existing condition) 및 보장개시 전 진단 건은 담보에서 제외됩니다. 또한 암 담보에는 보험계약일로부터 90일 부담보(암 대기기간)가, 갑상선암·제자리암 등 소액암에는 별도 지급률(예: 가입금액의 10~20%)이 적용됩니다.',
          evidence: [
            { label: '대기기간 (Waiting)', value: '90일', delta: '개시 후 진단 면책', positive: true },
            { label: '기왕증·개시 전 진단', value: '면책', delta: 'Pre-existing 제외', positive: false },
            { label: '암 부담보', value: '계약 후 90일', delta: 'cancer waiting', positive: true },
            { label: '소액암', value: '별도 지급률', delta: '10~20% 지급', positive: true },
          ],
          source: 'Reinsurance Wording Art.8 §Exclusions & Waiting Periods',
        },
        en: {
          text: 'The key exclusions and special clauses are as follows.\n\nA 90-day waiting period applies from the cover commencement date; any CI diagnosed within that window is excluded. Pre-existing conditions already manifested or diagnosed before application, and any condition diagnosed before cover commencement, are excluded. In addition, cancer cover carries a 90-day cancer waiting period from inception, while minor cancers (e.g. thyroid, carcinoma in situ) are settled at a reduced benefit rate (typically 10–20% of the sum insured).',
          evidence: [
            { label: 'Waiting period', value: '90 days', delta: 'no cover within window', positive: true },
            { label: 'Pre-existing / prior dx', value: 'Excluded', delta: 'no cover', positive: false },
            { label: 'Cancer waiting', value: '90 days', delta: 'from inception', positive: true },
            { label: 'Minor cancers', value: 'Reduced benefit', delta: '10–20% payout', positive: true },
          ],
          source: 'Reinsurance Wording Art.8 §Exclusions & Waiting Periods',
        },
      },
    },
  ],
  fallback: {
    ko: {
      text: '현재 지정된 삼성화재 CI Quota Share 슬립을 기준으로 답변드립니다. 출재율·보유 조건, 보험기간·담보(CI) 범위, 면책·특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 출재 건의 출재율·보유 조건은?"',
    },
    en: {
      text: 'I answer based on the selected Samsung F&M CI quota share slip. Which would you like to explore — cession rate & retention, period & CI scope of cover, or exclusions & special clauses?\n\ne.g. "What are this cession\'s cession rate and retention?"',
    },
  },
};

export const kyoboGroupPA: Pipeline = {
  id: 'kyobo-gpa',
  slash: 'kyobo',
  label: { ko: '교보생명 단체상해 QS', en: 'Kyobo Life Group PA Quota Share' },
  file: 'Kyobo_GroupPA_QS_Slip_2026.pdf',
  meta: { ko: '비례 40% · 1사고 한도 ₩50억', en: 'Quota share 40% · Event limit ₩5bn' },
  qa: [
    {
      question: {
        ko: '이 출재 건의 출재율과 사고당 한도는?',
        en: "What are this cession's cession rate and event limit?",
      },
      answer: {
        ko: {
          text: '본 건은 단체상해(Group Personal Accident) 비례재보험(Quota Share)으로, 출재율(Cession rate)은 40%, 출재사 보유(Retention)는 60%입니다.\n\n비례 구조 위에 1사고당 한도(Event Limit) ₩50억이 별도로 적용되어, 버스 전복·집단 재해 등 단일 사고에서 다수 피보험자가 동시 손해를 입더라도 재보험 부담은 사고당 ₩50억으로 제한됩니다. 연간 누적한도(Aggregate)는 ₩150억으로 설정되어 있습니다.',
          evidence: [
            { label: '보종 (Line)', value: '단체상해 QS', delta: 'Group PA Quota Share', positive: true },
            { label: 'Cession rate (출재율)', value: '40%', delta: '보유 60%', positive: true },
            { label: 'Event Limit (사고당)', value: '₩50억', delta: 'per occurrence', positive: true },
            { label: 'Aggregate (연 누적)', value: '₩150억', delta: 'annual cap', positive: true },
          ],
          source: 'Slip p.2 §Cession & Limits · Reinsurance Wording Art.2',
        },
        en: {
          text: 'This is a Group Personal Accident (PA) quota share reinsurance, with a cession rate of 40% and the cedent retaining 60%.\n\nOn top of the proportional split, a per-event limit (Event Limit) of ₩5bn applies, so even where a single occurrence — such as a coach overturn or a mass accident — injures many insured members at once, the reinsurer\'s exposure is capped at ₩5bn per event. An annual aggregate of ₩15bn is also in place.',
          evidence: [
            { label: 'Line', value: 'Group PA Quota Share', delta: 'Personal Accident', positive: true },
            { label: 'Cession rate', value: '40%', delta: '60% retained', positive: true },
            { label: 'Event limit', value: '₩5bn', delta: 'per occurrence', positive: true },
            { label: 'Aggregate', value: '₩15bn', delta: 'annual cap', positive: true },
          ],
          source: 'Slip p.2 §Cession & Limits · Reinsurance Wording Art.2',
        },
      },
    },
    {
      question: {
        ko: '보험기간과 담보 범위는?',
        en: 'What is the period and scope of cover?',
      },
      answer: {
        ko: {
          text: '보험기간은 2026.09.01부터 2027.08.31까지 1년이며, 출재사는 교보생명입니다.\n\n담보는 단체상해의 사망·후유장해 및 의료비로, 상해사망(가입금액 100%)·후유장해(장해율 비례)·상해의료비를 포함합니다. 재보험사는 각 담보에서 지급된 보험금의 40%를 비례 부담하며, 후유장해는 약관상 지급률표(payment schedule)에 따라 장해 정도별로 안분 지급됩니다.',
          evidence: [
            { label: '보험기간 (Period)', value: '2026.09.01–2027.08.31', delta: '1년', positive: true },
            { label: '담보 (Cover)', value: '사망·후유장해·의료비', delta: 'death / disability / medical', positive: true },
            { label: '후유장해', value: '장해율 비례', delta: 'per payment schedule', positive: true },
            { label: '출재사 (Cedent)', value: '교보생명', delta: 'Kyobo Life', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured · Wording Art.5 §Benefits',
        },
        en: {
          text: 'The period of cover runs one year, from 2026.09.01 to 2027.08.31, with Kyobo Life as the ceding company.\n\nCover comprises Group PA death, permanent disability and medical expenses: accidental death (100% of the sum insured), permanent disability (pro-rated to the degree of disability) and accident medical expenses. The reinsurer bears 40% of each benefit paid, with disability benefits apportioned by degree under the policy\'s payment schedule.',
          evidence: [
            { label: 'Period', value: '2026.09.01–2027.08.31', delta: '1 year', positive: true },
            { label: 'Cover', value: 'Death / disability / medical', delta: 'Group PA', positive: true },
            { label: 'Disability', value: 'Degree-rated', delta: 'per payment schedule', positive: true },
            { label: 'Cedent', value: 'Kyobo Life', delta: '교보생명', positive: true },
          ],
          source: 'Slip p.1 §Period & Reassured · Wording Art.5 §Benefits',
        },
      },
    },
    {
      question: {
        ko: '주요 면책·특별 조항은?',
        en: 'What are the key exclusions and special clauses?',
      },
      answer: {
        ko: {
          text: '주요 면책·특별 조항은 다음과 같습니다.\n\n피보험 집단의 직업급수(Occupation class)에 따라 인수기준과 요율이 차등 적용되며, 고위험 직업급수(예: 4급 이상)는 별도 합의 없이는 담보에서 제외됩니다. 전쟁·테러, 위험스포츠(스카이다이빙·암벽등반 등), 음주운전·무면허운전 중 발생한 상해는 면책됩니다. 또한 직업적 항공승무 및 군 작전 중 사고는 별도 특약이 없는 한 담보하지 않습니다.',
          evidence: [
            { label: '직업급수 (Occupation)', value: '급수별 차등', delta: '고위험 4급+ 제외', positive: true },
            { label: '전쟁·위험스포츠', value: '면책', delta: 'war & hazardous sports', positive: false },
            { label: '음주·무면허운전', value: '면책', delta: 'DUI / unlicensed', positive: false },
            { label: '항공·군작전', value: '특약 필요', delta: 'aviation / military', positive: true },
          ],
          source: 'Reinsurance Wording Art.9 §Exclusions & Occupation Classes',
        },
        en: {
          text: 'The key exclusions and special clauses are as follows.\n\nUnderwriting terms and rates vary by the occupation class of the insured group, and high-risk classes (e.g. class 4 and above) are excluded unless separately agreed. Injuries arising from war and terrorism, hazardous sports (skydiving, rock climbing, etc.), and driving under the influence or without a licence are excluded. Accidents during professional aviation crew duty or military operations are not covered without a specific endorsement.',
          evidence: [
            { label: 'Occupation class', value: 'Class-rated', delta: 'class 4+ excluded', positive: true },
            { label: 'War & hazardous sports', value: 'Excluded', delta: 'no cover', positive: false },
            { label: 'DUI / unlicensed', value: 'Excluded', delta: 'no cover', positive: false },
            { label: 'Aviation / military', value: 'Endorsement needed', delta: 'not auto-covered', positive: true },
          ],
          source: 'Reinsurance Wording Art.9 §Exclusions & Occupation Classes',
        },
      },
    },
  ],
  fallback: {
    ko: {
      text: '현재 지정된 교보생명 단체상해 Quota Share 슬립을 기준으로 답변드립니다. 출재율·사고당 한도, 보험기간·담보 범위, 면책·특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 출재 건의 출재율과 사고당 한도는?"',
    },
    en: {
      text: 'I answer based on the selected Kyobo Life Group PA quota share slip. Which would you like to explore — cession rate & event limit, period & scope of cover, or exclusions & special clauses?\n\ne.g. "What are this cession\'s cession rate and event limit?"',
    },
  },
};

/** 갱신 파이프라인 목록 — 메뉴/자동완성 표시 순서 (긴급 건이 최상단) */
export const PIPELINES: Pipeline[] = [termLifeXL, samsungCI, kyoboGroupPA];

/** id로 파이프라인 조회 */
export function getPipeline(id: string | null): Pipeline | undefined {
  return PIPELINES.find((p) => p.id === id);
}

/** "/" 입력값(슬래시 토큰 일부)으로 파이프라인 필터 — query는 '/' 제외 */
export function filterBySlash(query: string): Pipeline[] {
  const q = query.toLowerCase();
  if (!q) return PIPELINES;
  return PIPELINES.filter(
    (p) => p.slash.startsWith(q) || p.label.ko.toLowerCase().includes(q) || p.label.en.toLowerCase().includes(q),
  );
}

/** 지정된 파이프라인의 추천 질문 목록 */
export function suggested(pipeline: Pipeline, lang: Lang): string[] {
  return pipeline.qa.map((q) => q.question[lang]);
}

/** 앱 UI 문자열 */
export const STR = {
  newChat: { ko: '새 대화', en: 'New chat' },
  searchChats: { ko: '대화 검색', en: 'Search chats' },
  recentChats: { ko: '최근 대화', en: 'Recent chats' },
  userName: { ko: '김중개', en: 'J. Kim' },
  userRole: { ko: '재보험팀 · Broker', en: 'Reinsurance · Broker' },
  placeholder: { ko: '질문을 입력하거나 / 로 출처를 지정하세요…', en: 'Ask a question, or type / to set a source…' },
  placeholderShort: { ko: '/ 로 출처 지정 · 질문 입력…', en: 'Type / for source · ask…' },
  footerNote: {
    ko: '지정한 출처의 원문만 근거로 답변합니다 · 모든 답변에 인용이 함께 표시됩니다.',
    en: 'Answers are grounded only in the selected source · every answer includes citations.',
  },
  evidenceHeader: { ko: '원문 근거', en: 'Source evidence' },
  // 빈 화면 — 출처 미지정(전체 파이프라인 종합)
  globalTitle: { ko: '전체 갱신 파이프라인에 물어보세요', en: 'Ask across the renewal pipeline' },
  globalSubtitle: {
    ko: '지정된 출처가 없으면 모든 출재 건을 종합해 답합니다 · + 또는 / 로 특정 건만 볼 수 있어요',
    en: 'With no source set, answers span all cessions · use + or / to focus on one',
  },
  globalReady: { ko: '전체 파이프라인 3건 기반', en: 'across 3 pipeline cessions' },
  // 빈 화면 — 출처 지정 상태
  emptyTitle: { ko: '연결된 출재 슬립에 물어보세요', en: 'Ask the connected cession slip' },
  sourceReady: { ko: '연결됨', en: 'connected' },
  // 빈 화면 — 출처 미지정 상태
  noSourceTitle: { ko: '출처를 지정해 질문하세요', en: 'Set a source, then ask' },
  emptySubtitle: {
    ko: '+ 또는 / 로 갱신 파이프라인의 출재 건을 지정하세요',
    en: 'Use + or / to set a renewal-pipeline cession',
  },
  // 출처 메뉴 / 자동완성
  sourceMenuTitle: { ko: '출처 지정 · 갱신 파이프라인', en: 'Set source · Renewal pipeline' },
  addSource: { ko: '출처 추가', en: 'Add source' },
  slashHint: { ko: '/ 입력 후 파이프라인을 선택하세요', en: 'Type / then pick a pipeline' },
  noSourceBody: {
    ko: '입력창 왼쪽 + 버튼을 누르거나 / 를 입력해 답변 근거가 될 출재 건을 선택하세요.',
    en: 'Tap the + button or type / to pick the cession that should ground the answer.',
  },
  // 출처 칩
  sourceChipLabel: { ko: '출처', en: 'Source' },
  urgentTag: { ko: '긴급', en: 'Urgent' },
  pipelineBadge: { ko: '갱신 파이프라인', en: 'Renewal pipeline' },
} satisfies Record<string, L>;

/** 사이드바 최근 대화 목록 */
export const HISTORY: L<string[]> = {
  ko: ['삼성화재 CI 출재율 검토', '한화생명 Term Life XL', '교보 단체상해 면책', '생명재보험 면책 조항'],
  en: ['Samsung F&M CI cession review', 'Hanwha Life Term Life XL', 'Kyobo Group PA exclusions', 'Life reinsurance exclusions'],
};

/* === GLOBAL — 출처 미지정 시 전체 갱신 파이프라인(3건)을 종합해 답변 === */
export const GLOBAL_QA: QAItem[] = [
  {
    question: {
      ko: '지금 갱신 마감이 가장 임박한 출재 건은? 우선순위를 정리해줘.',
      en: 'Which cession has the most imminent renewal deadline right now? Give me the priority order.',
    },
    answer: {
      ko: {
        text: '갱신 파이프라인 3건을 종합하면, 회신·갱신 마감이 가장 임박한 건은 한화생명 Term Life XL입니다. 보험기간이 2026.07.01에 개시되어 회신 마감이 6월 중으로 가장 촉박하므로 최우선 처리 대상입니다.\n\n다음 순위는 삼성화재 CI 재보험(2026.08.01 개시), 그다음이 교보생명 단체상해 QS(2026.09.01 개시)입니다. 즉 개시일 기준 7월·8월·9월로 한 달 간격을 두고 순차 도래하므로, Term Life XL을 즉시 처리한 뒤 삼성 CI·교보 PA 순으로 진행하시면 됩니다.\n\nTerm Life XL은 단체 정기보험 초과손해(XL) 구조로 보유 ₩30억·한도 ₩100억 규모라 회신 지연 시 커버 공백 리스크가 가장 크므로, 잔여 기일이 짧은 점까지 감안하면 우선순위는 명확히 1순위입니다.',
        evidence: [
          { label: '한화 Term Life XL', value: '2026.07.01 개시 · 회신 마감 임박', delta: '1순위 (긴급)', positive: false },
          { label: '삼성 CI 재보험', value: '2026.08.01 개시', delta: '2순위', positive: true },
          { label: '교보 단체상해 QS', value: '2026.09.01 개시', delta: '3순위', positive: true },
          { label: '도래 간격', value: '7월 → 8월 → 9월 (월 1건)', positive: true },
        ],
        source: '갱신 파이프라인 3건 · HW Term Life XL / 삼성 CI / 교보 PA 슬립',
      },
      en: {
        text: 'Across the three renewal pipeline cessions, the most imminent deadline belongs to Hanwha Life Term Life XL. Its policy period inception is 2026.07.01, so the reply deadline falls within June and is the tightest, making it the top-priority item.\n\nNext in line is Samsung Fire CI Reinsurance (inception 2026.08.01), followed by Kyobo Life Group PA QS (inception 2026.09.01). The inceptions arrive in sequence at roughly one-month intervals (July, August, September), so handle Term Life XL immediately, then proceed with Samsung CI and Kyobo PA in order.\n\nTerm Life XL is an Excess of Loss (XL) structure with a Retention of ₩3.0bn and a Limit of ₩10.0bn, so a delayed reply carries the highest cover-gap risk. Combined with the shortest remaining lead time, its rank as priority #1 is unambiguous.',
        evidence: [
          { label: 'Hanwha Term Life XL', value: 'Inception 2026.07.01 · reply deadline imminent', delta: '#1 (urgent)', positive: false },
          { label: 'Samsung CI Reinsurance', value: 'Inception 2026.08.01', delta: '#2', positive: true },
          { label: 'Kyobo Group PA QS', value: 'Inception 2026.09.01', delta: '#3', positive: true },
          { label: 'Arrival spacing', value: 'Jul → Aug → Sep (1 per month)', positive: true },
        ],
        source: 'Renewal pipeline (3) · HW Term Life XL / Samsung CI / Kyobo PA slips',
      },
    },
  },
  {
    question: {
      ko: '세 건의 출재 구조(보유·출재율·한도)를 비교해줘.',
      en: 'Compare the cession structures (retention, cession rate, limits) of the three deals.',
    },
    answer: {
      ko: {
        text: '갱신 파이프라인 3건은 출재 구조가 서로 다릅니다. 한화생명 Term Life XL은 초과손해(Excess of Loss) 방식으로, 보유(Retention) ₩30억을 초과하는 손해를 한도(Limit) ₩100억까지 커버합니다. TSI는 약 ₩800억(SAR) 규모입니다.\n\n삼성화재 CI 재보험과 교보생명 단체상해는 모두 비례재보험(Quota Share) 구조입니다. 삼성 CI는 출재율(Cession rate) 50%로 TSI ₩1,200억 중 출재분이 약 ₩600억이며, 교보 PA는 출재율 40%에 더해 1사고 한도 ₩50억·연 누적 한도 ₩150억의 사고당·연간 cap이 붙습니다.\n\n요약하면 Term Life XL만 손해초과(비비례) 구조이고 나머지 두 건은 비례 구조이며, 교보 PA는 비례임에도 Event Limit·연 누적 한도로 출재사 익스포저가 추가로 제한된다는 점이 구조상 핵심 차이입니다.',
        evidence: [
          { label: '한화 Term Life XL', value: 'XL · 보유 ₩30억 / 한도 ₩100억 · TSI ~₩800억', positive: true },
          { label: '삼성 CI 재보험', value: 'Quota Share · 출재율 50% · 출재분 ~₩600억', positive: true },
          { label: '교보 단체상해 QS', value: 'Quota Share · 출재율 40% · 1사고 ₩50억 / 연 ₩150억', positive: true },
          { label: '구조 구분', value: '비비례(XL) 1건 / 비례(QS) 2건', positive: true },
        ],
        source: '갱신 파이프라인 3건 · HW Term Life XL / 삼성 CI / 교보 PA 슬립',
      },
      en: {
        text: 'The three pipeline cessions use different structures. Hanwha Life Term Life XL is an Excess of Loss (non-proportional) treaty, covering losses above a Retention of ₩3.0bn up to a Limit of ₩10.0bn. Its TSI (SAR) is approximately ₩80bn.\n\nSamsung Fire CI Reinsurance and Kyobo Life Group PA are both Quota Share (proportional). Samsung CI runs at a 50% cession rate, ceding roughly ₩60bn of its ₩120bn TSI, while Kyobo PA cedes 40% with an added per-event Event Limit of ₩5.0bn and an annual aggregate cap of ₩15bn.\n\nIn short, only Term Life XL is non-proportional; the other two are proportional. The key structural nuance is that Kyobo PA, though proportional, further caps the reinsurer exposure via the Event Limit and annual aggregate.',
        evidence: [
          { label: 'Hanwha Term Life XL', value: 'XL · Retention ₩3.0bn / Limit ₩10.0bn · TSI ~₩80bn', positive: true },
          { label: 'Samsung CI Reinsurance', value: 'Quota Share · 50% cession · ~₩60bn ceded', positive: true },
          { label: 'Kyobo Group PA QS', value: 'Quota Share · 40% cession · ₩5.0bn/event / ₩15bn annual', positive: true },
          { label: 'Structure split', value: '1 non-proportional (XL) / 2 proportional (QS)', positive: true },
        ],
        source: 'Renewal pipeline (3) · HW Term Life XL / Samsung CI / Kyobo PA slips',
      },
    },
  },
  {
    question: {
      ko: '전체 포트폴리오의 주요 면책(Exclusion) 공통점과 차이는?',
      en: 'What are the common and differing key exclusions across the whole portfolio?',
    },
    answer: {
      ko: {
        text: '갱신 파이프라인 3건의 면책을 종합하면, 전쟁·테러는 3건 모두에 공통으로 적용되는 면책 사유입니다. 따라서 전쟁·테러 익스포저는 포트폴리오 전반에서 일관되게 배제된다고 보시면 됩니다.\n\n건별 특이 면책은 담보 성격에 따라 갈립니다. 한화 Term Life XL은 자살 2년 면책과 집단사고 1사고 ₩100억 cap이 핵심이고, 삼성 CI는 90일 대기기간·기왕증·암 90일 부담보가, 교보 단체상해는 직업급수(4급 이상 제외)·위험스포츠·음주/무면허운전이 주요 면책입니다.\n\n정리하면 공통 축은 전쟁·테러 한 가지이며, 나머지는 생명(자살 면책)·질병(대기기간/기왕증)·상해(직업급수/음주운전)라는 담보 유형별 고유 면책으로 나뉩니다.',
        evidence: [
          { label: '3건 공통', value: '전쟁 · 테러 면책', positive: false },
          { label: '한화 Term Life XL', value: '자살 2년 · 집단사고 1사고 ₩100억 cap', positive: true },
          { label: '삼성 CI 재보험', value: '90일 대기 · 기왕증 · 암 90일 부담보', positive: true },
          { label: '교보 단체상해 QS', value: '직업급수(4급+ 제외) · 위험스포츠 · 음주/무면허', positive: true },
        ],
        source: '갱신 파이프라인 3건 · HW Term Life XL / 삼성 CI / 교보 PA 슬립',
      },
      en: {
        text: 'Aggregating the exclusions across the three pipeline cessions, war and terrorism are common exclusions in all three. So war/terror exposure is consistently excluded across the entire portfolio.\n\nDeal-specific exclusions diverge by the nature of cover. For Hanwha Term Life XL the key items are a 2-year suicide exclusion and a ₩10.0bn per-event cap on catastrophe/mass accidents; Samsung CI carries a 90-day waiting period, pre-existing conditions, and a 90-day cancer exclusion; Kyobo Group PA excludes high occupational classes (class 4 and above), hazardous sports, and drunk/unlicensed driving.\n\nIn summary, the single common axis is war/terrorism, while the rest split into cover-type-specific exclusions: life (suicide), illness (waiting period / pre-existing), and accident (occupational class / drunk driving).',
        evidence: [
          { label: 'Common to all 3', value: 'War & terrorism exclusion', positive: false },
          { label: 'Hanwha Term Life XL', value: '2-yr suicide · ₩10.0bn per-event cat cap', positive: true },
          { label: 'Samsung CI Reinsurance', value: '90-day waiting · pre-existing · 90-day cancer', positive: true },
          { label: 'Kyobo Group PA QS', value: 'Occ. class 4+ excl. · hazardous sports · drunk/unlicensed', positive: true },
        ],
        source: 'Renewal pipeline (3) · HW Term Life XL / Samsung CI / Kyobo PA slips',
      },
    },
  },
];

export const GLOBAL_FALLBACK: L<Answer> = {
  ko: {
    text: '현재 질문은 특정 출처(출재 건)를 지정하지 않아, 전체 갱신 파이프라인 3건(한화 Term Life XL · 삼성 CI 재보험 · 교보 단체상해 QS)을 종합해 답변합니다.\n\n특정 건만 기준으로 보고 싶으시면 출처를 지정해 주세요. 해당 건만을 기준으로 다시 답변드립니다. 예: "한화 Term Life XL의 보유와 한도는?"',
  },
  en: {
    text: 'Since this question does not specify a particular source (cession), the answer aggregates all three deals in the renewal pipeline (Hanwha Term Life XL · Samsung CI Reinsurance · Kyobo Group PA QS).\n\nIf you want to base the answer on a single deal, please specify the source and I will answer using that deal only. e.g., "What are the retention and limit for Hanwha Term Life XL?"',
  },
};

/** 출처 미지정 시 추천 질문 — 전체 포트폴리오 기반 */
export function suggestedGlobal(lang: Lang): string[] {
  return GLOBAL_QA.map((q) => q.question[lang]);
}
