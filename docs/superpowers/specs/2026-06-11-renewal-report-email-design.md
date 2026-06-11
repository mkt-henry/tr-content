# ARIA 갱신 결과 보고서 + 전달 이메일 데모 설계

날짜: 2026-06-11

## 목적

재보험 중개 플로우에서 "보고서 생성 → 그 보고서를 전달하는 이메일 초안 자동 작성"을
하나로 묶은 새 ARIA 데모. 기존에 분리돼 있던 두 패턴(보고서 생성=ai-doc-gen, 전달 이메일
초안=aria-match/cat-warroom)을 결합한다.

## 결정 사항 (브레인스토밍 합의)

- **시나리오**: 한화생명 Term Life XL 2026 갱신 플레이스먼트 완료 직후, 갱신 결과 보고서를
  생성하고 출재사(원수사) 담당자에게 보낼 전달 이메일 초안을 작성.
- **레이아웃**: 한 화면 2패널 — 좌측 보고서(섹션 순차 생성) / 우측 전달 이메일 초안.
- **변형 2개** (컴포넌트·상태 공유, 시나리오·소구점만 차이):
  - v1 「갱신 끝나면 보고서·이메일 30초」 — 속도/엔드투엔드
  - v2 「수신자 맞춤 전달 이메일」 — 신뢰성(수신자 컨텍스트 강조)
- **국제화**: ko/en (다른 ARIA 데모와 동일).
- 헤더: brass 아이콘 + 타이틀 + "ARIA by AlphaLenz" (aria-summary/match 패턴).

## 폴더 / 등록

- 신규 폴더: `src/demos/aria/renewal-report/`
- `import.meta.glob('../demos/*/*/index.ts')` 로 자동 등록 — `index.ts` default export만 하면 갤러리에 등장.
- feature id: `renewal-report`, accent: brass(`#d9ad78`) 계열, icon: `FileText`/`Send` 류.

## 파일 구조 (기존 데모 컨벤션)

- `data.ts` — 타입 + 콘텐츠 + `STR` i18n
  - 보고서: 표지(딜명·갱신일), 갱신 개요(요율 +6.5%·보유 ₩30억·한도 ₩100억·TSI ₩800억·보험기간),
    재보험사 패널(Korean Re 40 / Gen Re 30 / Hannover Re 20 / SCOR 10 — 비중 바), 전년 대비 변경, 결론·권고
  - 이메일: 수신(한화생명 재보험팀), 제목, 본문, 첨부 파일명, 상태 배지 문구
- `state.ts` — zustand. phase: `idle → report → reportDone → email → done`
  - 보고서 섹션을 하나씩 push(ai-doc-gen outline 패턴), 이메일 제목·본문 스트리밍(aria-match 패턴)
  - `generate()` 가 전체 시뮬레이션, runId 가드로 reset 시 무효화
- `scenario.ts` — `reportEmailScenario`(v1), `tailoredScenario`(v2). click/type/cursor/wait 스텝으로 generate 구동
- `Desktop.tsx` — 2패널(좌 보고서 / 우 이메일). data-demo-id: `generate-btn`, `report-panel`, `email-panel`, `attachment-chip`
- `Mobile.tsx` — 세로 스택(보고서 → 이메일)
- `index.ts` — FeatureDefinition + variants(v1/v2)

## 상태 모델 (state.ts)

```
phase: 'idle' | 'report' | 'reportDone' | 'email' | 'done'
reportSections: ReportSection[]   // 순차적으로 채워짐
emailSubject: string              // 스트리밍 누적
emailBody: string                 // 스트리밍 누적
emailStatus: 'idle' | 'streaming' | 'done'
generate(): 보고서 섹션 → reportDone → 이메일 스트리밍 → done
reset(): runId++, 초기화
```

## 데이터 흐름

scenario → state.generate() → (async) 보고서 섹션 push + 이메일 텍스트 스트리밍 → 컴포넌트가
phase/sections/email* 구독해 렌더. 외부 라이브러리 없음(SVG/div로 비중 바).

## 의존성

- `framer-motion`(기존), `_shared/i18n`(pick/fmt/useLang), `lib/cn`, lucide-react 아이콘
- `branding`은 무관(아리아 인트로/아웃트로는 별개)

## 검증

- `tsc --noEmit` 통과
- dev 서버: 갤러리에 "갱신 결과 보고서 + 전달 이메일" 카드 등장, v1/v2 재생 시
  좌측 보고서 생성 → 우측 이메일 초안 스트리밍 → 첨부칩·완료 배지 표시 확인 (스크린샷)

## 범위 밖 (YAGNI)

- 실제 PDF 생성/다운로드 (첨부는 파일명 칩만)
- 실제 메일 발송 (초안까지만 — "검토 후 발송" 배지)
- 보고서 섹션의 편집 기능
