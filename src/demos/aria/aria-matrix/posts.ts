import type { DistributionPost } from '../../../registry/types';

// ---------------------------------------------------------------------------
// 데모 영상 배포용 게시 카피 — 유튜브(제목·설명) + 링크드인 본문
// ko/en은 직역이 아니라 언어별로 자연스럽게 따로 작성한다.
// 데모 실제 내용(슬립·특약 5건 → 핵심 조건 자동 추출 비교표 + 원문 인용 검증, ARIA-R1)을 반영.
// ---------------------------------------------------------------------------

const ytTitleKo = "슬립·특약 5건을 한 화면 비교표로 — 핵심 조건 자동 추출·원문 검증 | AlphaLenz 재보험 AI";
const ytTitleEn = "5 slips into one comparison matrix — key terms auto-extracted & cited | AlphaLenz Reinsurance AI";

const ytDescKo = `슬립·특약 문서 5건을 일일이 열어 조건을 표로 옮기는 일, 브로커라면 익숙하실 겁니다. AlphaLenz는 그 표를 자동으로 채웁니다.

여러 재보험 문서를 올리고 비교할 항목(열)만 고르면, ARIA가 각 문서에서 핵심 조건을 한 화면 비교표로 추출합니다. 게다가 모든 셀은 원문 페이지 인용과 연결돼, 클릭 한 번으로 근거 구절까지 확인할 수 있습니다.

■ 이 영상에서 보는 것
· Property Cat·Marine Cargo·Casualty XoL·Energy·Aviation — 서로 다른 5개 슬립/특약을 한 번에 로드
· 담보 종목(LoB)·Per Occurrence Limit·Deductible·Rate/Premium·Reinstatement·주요 면책까지 항목별 자동 추출
· 추출된 모든 값에 원문 인용(p.3 등) — 클릭하면 영문 원문 구절이 하이라이트되어 검증
· ARIA-R1 고추론 모델이 문서 구조가 달라도 같은 기준으로 정규화

읽고 옮기고 대조하는 시간을, 검토하는 시간으로.

AlphaLenz — 재보험 중개를 위한 AI 워크스페이스
데모 요청: treasurer.co.kr

#재보험 #Reinsurance #InsurTech #보험 #AI #AlphaLenz #슬립비교 #언더라이팅`;

const ytDescEn = `Opening 5 slips and treaties one by one to copy their terms into a table — every broker knows the drill. AlphaLenz fills that table for you.

Upload several reinsurance documents, pick the fields (columns) you want to compare, and ARIA extracts the key terms from each into a single comparison matrix. Every cell is linked to its source citation, so one click takes you to the exact original clause.

■ What you'll see
· Load 5 different slips/treaties at once — Property Cat, Marine Cargo, Casualty XoL, Energy, Aviation
· Auto-extract each field — Line of Business, Per Occurrence Limit, Deductible, Rate/Premium, Reinstatement, Key Exclusions
· Every extracted value carries a citation (p.3, etc.) — click to highlight the original English clause and verify
· ARIA-R1 high-reasoning normalises differently-structured documents to the same basis

Turn reading, copying and cross-checking into reviewing.

AlphaLenz — an AI workspace for reinsurance broking
Request a demo: treasurer.co.kr

#Reinsurance #InsurTech #Insurance #AI #AlphaLenz #Underwriting #SlipComparison`;

const liBodyKo = `슬립 하나를 읽는 건 어렵지 않습니다. 문제는 5개를 나란히 비교할 때죠. 이제 PDF를 올리기만 하면 됩니다.

담보 종목, 한도, 자기부담금, 요율, 복원 조항, 면책… 문서마다 표현도 위치도 다른 조건을 일일이 표로 옮기다 보면 반나절이 갑니다.

AlphaLenz는 이 표를 자동으로 채웁니다.

문서를 올리고 비교할 항목만 고르면 —

✔ 서로 다른 5개 슬립·특약에서 핵심 조건을 한 화면 비교표로 추출
✔ 모든 셀에 원문 인용(p.3 등) — 클릭하면 영문 원문 구절로 바로 검증
✔ 문서 구조가 달라도 ARIA-R1이 같은 기준으로 정규화

옮기는 시간이 아니라, 판단하는 시간으로.

Property Cat·Marine·Casualty·Energy·Aviation 슬립으로 만든 데모 영상을 공유합니다 👇

#재보험 #Reinsurance #InsurTech #AI #언더라이팅 #AlphaLenz`;

const liBodyEn = `Reading one slip is easy. The pain is comparing five side by side. Now you just upload the PDFs.

Line of business, limits, deductibles, rates, reinstatements, exclusions — every document words them differently and buries them in different places. Copying it all into a table burns half a day.

AlphaLenz fills that table for you.

Upload the documents, pick the fields to compare —

✔ Key terms from 5 different slips/treaties pulled into one comparison matrix
✔ Every cell carries a source citation (p.3, etc.) — click to verify against the original clause
✔ ARIA-R1 normalises differently-structured documents to the same basis

Less time moving data, more time judging it.

Sharing a demo built on Property Cat, Marine, Casualty, Energy and Aviation slips 👇

#Reinsurance #InsurTech #AI #Underwriting #AlphaLenz`;

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
