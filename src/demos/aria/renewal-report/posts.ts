import type { DistributionPost } from '../../../registry/types';

// ---------------------------------------------------------------------------
// 데모 영상 배포용 게시 카피 — 유튜브(제목·설명) + 링크드인 본문
// ko/en은 직역이 아니라 언어별로 자연스럽게 따로 작성한다.
// 데모 실제 내용(한화생명 Term Life XL 2026 갱신, 근거 자료 5건 → 보고서 → 맞춤 이메일)을 반영.
// ---------------------------------------------------------------------------

const ytTitleKo = "흩어진 자료 5건 → 갱신 결과 보고서와 맞춤 전달 이메일까지 | AlphaLenz 재보험 AI";
const ytTitleEn = "5 scattered files → a full renewal report + tailored delivery emails | AlphaLenz Reinsurance AI";

const ytDescKo = `재보험 갱신에서 정작 시간을 잡아먹는 건 협상이 끝난 다음입니다. 결과를 보고서로 정리하고, 관계자마다 다른 톤으로 전달 메일을 쓰는 일이죠.

AlphaLenz는 흩어진 근거 자료를 골라 넣기만 하면, 갱신 결과 보고서 초안과 수신자별 맞춤 전달 이메일을 한 번에 만들어 줍니다. 이 영상은 한화생명 Term Life XL 2026 갱신 건을 예시로 그 전 과정을 담았습니다.

■ 이 영상에서 보는 것
· 사내 드라이브·출재사 포털·메일함에 흩어진 근거 자료 5건을 직접 선택
· Executive Summary·손해실적(3년)·프로그램 구조·패널 구성·전년 대비 변경까지 자동 구조화된 보고서 초안
· 수신자(출재사·리드 재보험사·경영진)마다 목적·맥락·톤을 읽어내는 AI 의도 분석
· 맥락에 맞춘 전달 이메일 초안 + 보고서 자동 첨부

브로커의 판단은 그대로 두고, 반복 작업만 걷어냅니다.

AlphaLenz — 재보험 중개를 위한 AI 워크스페이스
데모 요청: treasurer.co.kr

#재보험 #Reinsurance #InsurTech #보험 #AI #AlphaLenz #생명재보험 #보험중개`;

const ytDescEn = `In reinsurance, the real time sink starts after the deal is placed — writing up the result and drafting a differently-toned delivery email for every stakeholder.

AlphaLenz turns that into a single step: pick your scattered source materials and it drafts the renewal result report and a recipient-tailored delivery email for each contact. This walkthrough uses the Hanwha Life Term Life XL 2026 renewal as the example.

■ What you'll see
· Select 5 source files scattered across an internal drive, the cedent portal, and a mailbox
· An auto-structured report draft — Executive Summary, 3-year loss experience, program structure, reinsurer panel, key changes vs. prior year
· AI intent analysis reading the purpose, context and tone for each recipient (cedent, lead reinsurer, management)
· A context-fit delivery email draft with the report attached automatically

The broker's judgement stays; only the repetitive work is removed.

AlphaLenz — an AI workspace for reinsurance broking
Request a demo: treasurer.co.kr

#Reinsurance #InsurTech #Insurance #AI #AlphaLenz #LifeReinsurance #Broking`;

const liBodyKo = `재보험 갱신에서 진짜 시간을 잡아먹는 건 협상이 끝난 다음입니다.

결과를 보고서로 정리하고, 출재사·리드 재보험사·경영진에게 각각 다른 톤으로 전달 메일을 쓰는 일. 브로커의 반나절이 여기서 사라집니다.

AlphaLenz는 이 구간을 자동화했습니다.

흩어진 근거 자료(슬립·견적시트·손해실적·브로커 노트)를 고르면 —

✔ 갱신 결과 보고서 초안 (Executive Summary·손해실적·프로그램 구조·패널 구성)
✔ 수신자별 목적·맥락·톤을 분석한 맞춤 전달 이메일
✔ 보고서 자동 첨부까지

판단은 브로커가, 반복은 AI가.

한화생명 Term Life XL 2026 갱신 건으로 만든 데모 영상을 공유합니다 👇

#재보험 #Reinsurance #InsurTech #AI #보험 #AlphaLenz`;

const liBodyEn = `In reinsurance, the real time sink starts after the deal is placed.

Writing up the result, then drafting a delivery email in a different tone for the cedent, the lead reinsurer, and management. That's where half a broker's day goes.

AlphaLenz automates exactly that stretch.

Pick your scattered source materials (slip, quote sheets, loss run, broker notes) and it drafts —

✔ A renewal result report (Executive Summary · loss experience · program structure · panel)
✔ A recipient-tailored delivery email, with the purpose, context and tone read per contact
✔ The report attached, automatically

The judgement stays with the broker; the repetition goes to the AI.

Sharing a demo built on the Hanwha Life Term Life XL 2026 renewal 👇

#Reinsurance #InsurTech #AI #Insurance #AlphaLenz`;

export const POSTS: DistributionPost[] = [
  {
    platform: 'youtube',
    label: { ko: '제목', en: 'Title' },
    text: { ko: ytTitleKo, en: ytTitleEn },
    limit: 100,
  },
  {
    platform: 'youtube',
    label: { ko: '설명', en: 'Description' },
    text: { ko: ytDescKo, en: ytDescEn },
  },
  {
    platform: 'linkedin',
    label: { ko: '본문', en: 'Post body' },
    text: { ko: liBodyKo, en: liBodyEn },
  },
];
