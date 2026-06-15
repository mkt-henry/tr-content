# AlphaLenz 카드뉴스 — 설계 문서

- **작성일**: 2026-06-15
- **대상**: AlphaLenz 프로젝트에 영상 데모와 별개로 "카드뉴스"(슬라이드형 SNS 콘텐츠) 영역 추가
- **반복 워크플로**: 사용자가 앵글 리포트 등 **링크**를 전달하면, 그 내용을 한국어·영어 **2개 버전** 카드뉴스 덱으로 제작

---

## 1. 목표와 배경

ARIA Demo Studio는 더미 데이터로 동작하는 데모를 **화면 녹화(영상)** 해 SNS 콘텐츠를 만드는 쇼케이스 앱이다. AlphaLenz(AI 투자 분석 플랫폼) 프로젝트에는 현재 5개 영상 데모가 있다.

여기에 **영상이 아닌, 넘겨보는 슬라이드 덱(카드뉴스)** 콘텐츠 영역을 추가한다. 카드뉴스는 인스타·링크드인 캐러셀에 그대로 올릴 수 있는 **이미지(PNG) 묶음 + PDF**로 산출된다.

핵심 사용 시나리오(반복):
1. 사용자가 AlphaLenz 앵글 리포트 URL을 전달한다.
2. Claude가 본문을 가져와 **제작 지침**(아래 §6)에 따라 한/영 카드뉴스 덱 데이터를 생성한다.
3. 앱의 카드뉴스 뷰어에서 덱을 확인하고, PNG/PDF로 내보낸다.

이 흐름이 매번 **일관된 품질**로 나오도록, 데이터 모델·슬라이드 템플릿·제작 지침을 함께 정의한다.

---

## 2. 결정 사항 요약 (브레인스토밍 합의)

| 항목 | 결정 |
|---|---|
| 배치 | AlphaLenz 갤러리 헤더 아래 **`영상 / 카드뉴스` 세그먼트 토글**. 프로젝트 탭 구조는 그대로 |
| 비율 | **1:1 정사각형** (기본) |
| 산출물 | 넘겨보는 뷰어 + **각 슬라이드 PNG 추출 + 덱 전체 PDF 내보내기** |
| 언어 | **한국어·영어 2개 버전** 필수. 직역이 아닌 **의역(transcreation)** |
| 톤 | 신뢰감 있는 애널리스트 보이스(단정형 `-다`). 후킹은 헤드라인 프레이밍으로 |
| 차트 | 절제 사용(덱당 최대 3개), 임팩트 있는 곳에만. Recharts로 구현 |
| 넘침 | 슬라이드 고정 1:1 + `overflow:hidden` + 슬라이드 타입별 카피 글자수 예산 |
| 첫 콘텐츠 | 비트코인 앵글 리포트(2026-06-13, 위험회피 레짐) |

---

## 3. 아키텍처

기존 데모 자동 등록 패턴(`src/demos/<project>/<name>/index.ts` glob)을 모방하되, 카드뉴스는 **풀 React 기능 모듈이 아니라 데이터 중심**이다.

```
src/cardnews/
├─ types.ts                 # CardNewsDeck / Slide / 차트 스펙 타입
├─ registry.ts              # import.meta.glob('./*/*/deck.ts') 자동 수집
├─ <project>/<slug>/
│  └─ deck.ts               # CardNewsDeck default export (ko/en 텍스트 + 차트 데이터)
│
src/shell/cardnews/         # 뷰어 UI (데모 비종속)
├─ CardNewsGallery.tsx      # 토글 ON일 때 덱 카드 그리드
├─ CardNewsViewer.tsx       # 1:1 슬라이드 뷰어(이전/다음·언어 토글·내보내기)
├─ Slide.tsx                # 슬라이드 타입별 렌더 디스패처
├─ slides/                  # 타입별 슬라이드 컴포넌트(Cover, Thesis, Data, …)
├─ charts/                  # Recharts 래퍼(DivergenceBar, AreaSpark, Donut, StatChips)
└─ export.ts                # PNG(단건/일괄) + PDF 내보내기
```

- **레지스트리**: `src/cardnews/registry.ts`가 `./<project>/<slug>/deck.ts`를 glob으로 모아 `getDecksByProject(projectId)` 제공. 폴더만 추가하면 등록(기존 데모 철학과 동일).
- **갤러리 통합**: `Gallery.tsx`의 AlphaLenz(및 카드뉴스를 가진 프로젝트) 헤더 아래에 세그먼트 토글을 둔다. 상태는 `shellStore`에 `galleryMode: 'video' | 'cardnews'`(프로젝트별)로 보관. 카드뉴스 모드면 `getDecksByProject`로 덱 카드를 렌더.
- **뷰어**: 덱 카드를 클릭하면 `CardNewsViewer`가 스테이지에 뜬다. 영상 데모의 녹화 워크플로와 독립적이다(자동 재생/녹화 엔진 사용 안 함).

토글은 **카드뉴스 덱이 1개 이상 있는 프로젝트에서만** 노출한다(없으면 기존과 동일하게 영상만).

---

## 4. 데이터 모델

```ts
// src/cardnews/types.ts
export type Lang = 'ko' | 'en';
export type LangText = Record<Lang, string>;   // { ko, en } — 의역된 각 언어 원문

export interface CardNewsDeck {
  id: string;                 // 'btc-riskoff-2026-06-13'
  project: string;            // 'alphalenz'
  title: LangText;            // 덱 제목(갤러리 카드용)
  source?: string;            // 원본 리포트 URL
  date: string;               // '2026-06-13'
  accent?: string;            // 카드 액센트(기본 AlphaLenz 퍼플)
  slides: Slide[];
}

export type Slide =
  | { type: 'cover';   eyebrow: LangText; headline: LangText; tag: LangText; chart?: ChartSpec }
  | { type: 'thesis';  eyebrow: LangText; headline: LangText; body: LangText }
  | { type: 'contrast';eyebrow: LangText; headline?: LangText; left: ContrastBox; right: ContrastBox }
  | { type: 'data';    eyebrow: LangText; headline: LangText; chart: ChartSpec; note?: LangText }
  | { type: 'context'; eyebrow: LangText; headline: LangText; stats: StatItem[]; note?: LangText }
  | { type: 'action';  eyebrow: LangText; headline: LangText; chart?: ChartSpec; note?: LangText }
  | { type: 'list';    eyebrow: LangText; headline?: LangText; items: LangText[]; note?: LangText }
  | { type: 'cta';     eyebrow: LangText; headline: LangText; body: LangText; url?: string };

export interface ContrastBox { label: LangText; text: LangText; tone: 'down' | 'up' | 'neutral' }
export interface StatItem { label: LangText; value: string; tone?: 'down' | 'up' | 'gold' | 'neutral' }

// 숫자·티커·지표는 언어 중립 — 한 번만 저장하고 양 언어가 공유한다.
export type ChartSpec =
  | { kind: 'divergenceBar'; rows: { name: LangText; value: string; pct: number; tone: 'up'|'down'|'neutral' }[] }
  | { kind: 'areaSpark'; points: number[]; tone: 'up' | 'down' }
  | { kind: 'donut'; segments: { label: LangText; value: number; tone: 'down'|'gold'|'neutral' }[] }
  | { kind: 'statChips'; items: StatItem[] };
```

원칙:
- **텍스트는 `LangText`(ko/en 동시 보유)**. 언어 토글은 같은 슬라이드의 다른 언어 필드를 보여줄 뿐, 슬라이드 구조/장수는 동일.
- **수치·티커·날짜는 언어 중립**(한 번만 저장). 양 언어에서 동일 값이 보장된다 — 번역 과정의 숫자 오염 방지.

---

## 5. 슬라이드 템플릿 · 비주얼 규칙

### 슬라이드 타입(덱 기본 골격, 6~10장)
1. **cover** — 후킹 헤드라인 + 태그(주제·레짐·날짜) + 브랜드 (+ 무드 차트)
2. **thesis** — 핵심 결론 한 줄 + 보강 1문장
3. **contrast**(선택) — 시장의 해석 vs 실제 (2박스)
4. **data** — 히어로 차트(다이버전스 바/스파크) + 1줄 해설
5. **context** — 거시·배경 스탯 칩
6. **action** — 권고 + 배분 도넛(선택)
7. **list**(선택) — 대안 자산/체크리스트 + 무효화 조건
8. **cta** — 브랜드 마무리 + URL

### 비주얼 토큰 (AlphaLenz)
- 배경 `linear-gradient(160deg,#11132a,#0a0b14)`, 보더 `rgba(124,92,255,.22)`
- 액센트 퍼플 `#7c5cff` / 시안 `#22d3ee` / 상승 `#34d399` / 하락 `#f43f5e` / 금 `#e3b341`
- eyebrow는 퍼플 대문자 트래킹, headline 800 굵기, body opacity .78

### 넘침 방지 (필수)
- 슬라이드 컨테이너: 고정 1:1, `overflow:hidden`, `word-break:keep-all; overflow-wrap:break-word`
- **카피 글자수 예산**(슬라이드 타입·필드·언어별) — §6 표 참조
- 렌더 시 **오토핏 폴백**: 예산 초과 시 폰트를 하한까지 단계적 축소, 그래도 넘치면 클립
- dev 모드에서 예산 초과 필드를 콘솔 경고로 표시(작성 품질 가드)

### 차트
- 덱당 **최대 3개**, "인사이트를 더하는 곳"에만(단순 장식 금지)
- 종류: `divergenceBar`(대비), `areaSpark`(추세·무드), `donut`(배분), `statChips`(지표 나열)
- Recharts로 구현, 슬라이드 비주얼 토큰을 따른다

---

## 6. 카드뉴스 제작 지침 (Authoring Guide)

> 이 절은 별도 파일 **`docs/cardnews/authoring-guide.md`** 로도 저장해, 향후 "이 링크를 카드뉴스로" 요청 시 Claude가 따르는 정본(正本)으로 쓴다. 아래는 그 핵심.

### 6.1 입력 → 산출 흐름
1. 링크 본문을 가져온다(WebFetch). 제목·발행일·핵심 주장·섹션별 요지·**모든 수치/티커/날짜**·결론/권고를 구조적으로 추출.
2. 덱 골격(§5 타입)에 매핑. 기본 8장, 내용에 따라 6~10장 가감.
3. **한국어 버전을 먼저 완성** → 영어를 **의역(transcreation)** 으로 작성(직역 금지).
4. `src/cardnews/alphalenz/<slug>/deck.ts` 생성. 폴더 추가만으로 등록됨.

### 6.2 의역(Transcreation) 원칙
- 각 언어를 **그 언어 화자에게 자연스럽게** 새로 쓴다. 한국어 문장을 영어로 옮기는 게 아니라, **같은 메시지·같은 후킹을 영어 카피로 다시 만든다**.
- 길이·줄 수가 언어별로 달라도 좋다. 슬라이드 영역에 맞는 게 우선 — 한국어가 2줄이어도 영어는 1줄/3줄일 수 있다.
- 관용 표현·뉘앙스는 현지화. 예) "모두가 저점을 외칠 때, AI는 다르게 봤다" → "While everyone screamed 'buy the dip,' our AI saw it differently."
- **숫자·티커·지표·날짜는 양 언어에서 100% 동일**(데이터 모델상 언어 중립 필드라 자동 보장). 단위·소수점 표기는 각 언어 관례를 따른다.

### 6.3 톤 & 카피
- **신뢰감 있는 애널리스트 보이스.** 한국어 어미는 단정형 `-다`. 영어는 confident declarative.
- 구어 슬랭·과한 감탄(줍줍/~거든요/!! 등) 금지. 후킹은 **헤드라인 프레이밍과 대비 구조**로.
- 슬라이드 1장 = 메시지 1개. 결론을 앞에, 근거를 뒤에.

### 6.4 카피 글자수 예산(가이드 상한)

| 필드 | 한국어 | 영어 |
|---|---|---|
| eyebrow | ≤ 16자 | ≤ 28 chars |
| headline | ≤ 22자(≤2줄) | ≤ 42 chars(≤2 lines) |
| body / note | ≤ 95자 | ≤ 160 chars |
| contrast 박스 | ≤ 40자 | ≤ 72 chars |
| list 항목 | ≤ 30자 | ≤ 55 chars |

초과 시 카피를 줄이는 게 우선. 폰트 오토핏은 보조 수단.

### 6.5 데이터 정확성 가드
- 추출한 수치는 원문과 **자릿수까지 일치**시킨다. 추정·창작 금지.
- 권고/무효화 조건/리스크는 원문 의도를 왜곡하지 않는다(특히 매수/매도 방향).
- 출처 URL을 `deck.source`에 보존.

---

## 7. 내보내기 (Export)

- **PNG**: `html-to-image`(toPng)로 각 슬라이드 노드를 1080×1080(pixelRatio 스케일)로 렌더. 단건 다운로드 + 전체 일괄(zip 없이 순차 다운로드 또는 8장 개별).
- **PDF**: `jspdf`로 1:1 페이지에 각 PNG를 1장씩 배치해 덱 전체를 한 파일로.
- 내보내기 시 현재 선택 언어 기준. ko/en 각각 따로 추출 가능.
- 신규 의존성: `html-to-image`, `jspdf`.

---

## 8. 범위(Scope) & YAGNI

**포함**: 세그먼트 토글, 1:1 카드뉴스 뷰어(이전/다음·언어 토글), 슬라이드 타입 8종, 차트 4종, PNG/PDF 내보내기, 제작 지침 문서, 비트코인 덱 1편(ko/en).

**제외(당장 안 함)**: 다중 비율(4:5·9:16) 토글, 슬라이드 자동 전환 애니메이션 녹화, 덱 편집 UI(데이터는 코드로 작성), zip 일괄 다운로드, ko/en 외 언어.

---

## 9. 작업 순서(개요)

1. 데이터 모델·레지스트리(`src/cardnews/types.ts`, `registry.ts`)
2. 슬라이드 컴포넌트 + 차트 래퍼(넘침 가드 포함)
3. 갤러리 세그먼트 토글 + `shellStore.galleryMode`
4. 카드뉴스 뷰어(이전/다음·언어 토글)
5. PNG/PDF 내보내기
6. 제작 지침 문서(`docs/cardnews/authoring-guide.md`)
7. 비트코인 덱 1편 작성(ko/en) — 지침 적용 검증
