import type { DistributionPost } from '../../../registry/types';

// ---------------------------------------------------------------------------
// 데모 영상 배포용 게시 카피 — 유튜브(제목·설명) + 링크드인 본문
// ko/en은 직역이 아니라 언어별로 자연스럽게 따로 작성한다.
// 데모 실제 내용(뒤섞인 메일 9통 → 유형·우선순위 자동 분류 + AI 요약 →
// 긴급 출재 슬립 보안검사 → 핵심 추출 → 갱신 파이프라인 등록)을 반영.
// ---------------------------------------------------------------------------

const ytTitleKo = "쏟아지는 출재 의뢰 메일 → 분류·핵심 추출·파이프라인 등록까지 30초 | AlphaLenz 재보험 AI";
const ytTitleEn = "A flooded cession inbox → sorted, extracted, into the pipeline in 30s | AlphaLenz Reinsurance AI";

const ytDescKo = `출재 의뢰, 갱신 협의, 클레임 통지, 정산서, 세미나 초청… 재보험 브로커의 인박스는 늘 뒤섞여 있습니다. 오늘 회신해야 할 급한 건이 세미나 안내 밑에 묻히기도 하죠.

AlphaLenz는 인박스를 정리하는 데서 끝나지 않습니다. 급한 메일을 골라 첨부 슬립에서 핵심 조건을 추출하고, 갱신 파이프라인에 등록하는 것까지 — 메일에서 파이프라인까지 약 30초입니다.

■ 이 영상에서 보는 것
· 뒤섞인 9통의 메일을 AI가 유형(신규 의뢰·갱신·클레임·정산·일반)과 우선순위(긴급·높음·보통)로 자동 분류
· 메일마다 한 줄 AI 요약 + "오늘 마감" 배지로 놓치는 건 방지
· 긴급 출재 의뢰의 첨부 슬립을 보안 검사(악성코드 스캔)한 뒤 핵심 정보 추출 — 보종·출재사·TSI·보험기간·희망 조건·회신 마감
· 추출 결과를 클릭 한 번으로 갱신 파이프라인에 등록

읽고 분류하고 옮겨 적는 아침 30분을, 판단하는 30초로.

AlphaLenz — 재보험 중개를 위한 AI 워크스페이스
데모 요청: treasurer.co.kr

#재보험 #Reinsurance #InsurTech #보험 #AI #AlphaLenz #워크플로우자동화 #언더라이팅`;

const ytDescEn = `Cession requests, renewal talks, claim notices, statements, seminar invites — a reinsurance broker's inbox is always a jumble, and the urgent one you must answer today hides under the newsletter.

AlphaLenz doesn't stop at tidying the inbox. It picks the urgent mail, pulls the key terms from the attached slip, and registers it in the renewal pipeline — mail to pipeline in about 30 seconds.

■ What you'll see
· AI sorts 9 mixed emails by type (submission, renewal, claim, accounting, general) and priority (urgent, high, normal)
· A one-line AI summary per email, plus "Due today" badges so nothing slips
· The attached slip on an urgent submission is security-scanned (malware check), then key fields are extracted — line of business, cedent, TSI, period, requested terms, reply deadline
· The extraction is added to the renewal pipeline in one click

Turn a 30-minute morning of reading and sorting into a 30-second decision.

AlphaLenz — an AI workspace for reinsurance broking
Request a demo: treasurer.co.kr

#Reinsurance #InsurTech #Insurance #AI #AlphaLenz #WorkflowAutomation #Underwriting`;

const liBodyKo = `재보험 브로커의 하루는 인박스를 여는 데서 시작합니다.

출재 의뢰, 갱신 협의, 클레임 통지, 정산서, 세미나 초청이 뒤섞여 있고 — 오늘 회신해야 할 긴급 건이 그 사이에 묻혀 있죠.

AlphaLenz는 정리에서 멈추지 않습니다.

✔ 뒤섞인 메일을 유형·우선순위로 자동 분류 + 한 줄 요약
✔ 긴급 출재 슬립을 보안 검사한 뒤 핵심 조건 추출 (보종·TSI·기간·희망 조건·마감)
✔ 클릭 한 번으로 갱신 파이프라인에 등록

메일에서 파이프라인까지, 약 30초.

읽고 분류하는 아침 30분을 판단하는 시간으로 바꾼 데모를 공유합니다 👇

#재보험 #Reinsurance #InsurTech #AI #워크플로우자동화 #AlphaLenz`;

const liBodyEn = `A reinsurance broker's day starts by opening the inbox.

Cession requests, renewal talks, claim notices, statements and seminar invites, all mixed together — and the urgent one you must answer today is buried in the middle.

AlphaLenz doesn't stop at tidying up.

✔ Mixed mail auto-sorted by type and priority, with a one-line summary each
✔ Urgent submission slips security-scanned, then key terms extracted (LoB, TSI, period, requested terms, deadline)
✔ Added to the renewal pipeline in one click

Mail to pipeline in about 30 seconds.

Sharing a demo that turns a 30-minute morning of sorting into decision time 👇

#Reinsurance #InsurTech #AI #WorkflowAutomation #AlphaLenz`;

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
