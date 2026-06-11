# 갱신 결과 보고서 데모 — 플로우 개선 (자료 선택 + 수신자별 AI 의도 분석)

날짜: 2026-06-11 · 대상: `src/demos/aria/renewal-report/`

## 개선 목적

1. **근거 자료 가시성**: 어떤 자료로 보고서가 생성됐는지 보이지 않음 → 사용자가 자료를 선택/첨부하고, 보고서에 "근거 자료 N건"을 명시.
2. **수신자 선택 + 의도 분석**: 누구에게 보내는지 고르는 단계가 없음 → 수신자를 선택하면 AI가 지난 대화·자료를 근거로 목적·제목·내용을 분석한 뒤 맞춤 초안 생성.

## 플로우 (단일 통합)

```
[자료 선택] → 보고서 생성 → 보고서 완성
                              → [수신자 선택] → [AI 의도 분석] → 전달 이메일 초안
```
phase: `sources → report → reportReady → analyzing → email → done`

## 좌측 — 자료 → 보고서

- 상단 **근거 자료 선택**(phase=sources): 후보 목록 체크/첨부. 1건 이상 선택 시 "보고서 생성" 활성.
  - 후보: HW Term Life XL 슬립 / 손해실적 3년(Loss run) / 전년 갱신 특약 / 재보험사 견적 시트 ×4 / 브로커 노트 (일부 기본 선택)
- 생성 후: 자료 패널이 **"근거 자료 N건"** 요약 헤더로 접힘 + 보고서 섹션 순차 표시.

## 우측 — 수신자 → 분석 → 이메일 (phase별 전환)

- `report` 이전: 플레이스홀더
- `reportReady`: **수신자 3인 카드** (선택 대기)
- `analyzing`: 선택 수신자 칩 + **AI 의도 분석 카드** (분석 로더 → 목적/근거 맥락/핵심 메시지/톤)
- `email`/`done`: 분석 카드 유지 + **이메일 초안**(제목·첨부·본문 스트리밍·발송)

## 수신자별 분석·이메일 (3)

| id | 수신자 | 목적 | 인용 맥락 | 제목 |
|---|---|---|---|---|
| cedent | 한화생명 김도현 부장 | 갱신 결과 보고 + 서명 요청 | 지난 대화: Cat 한도 확대 요청 | [갱신 완료] …Cat 한도 상향 반영 |
| lead | Korean Re 리더(40%) | Firm order·서명 요청 | Lead 40% 인수 확정 | [Firm Order] …Lead 40% 서명 |
| exec | 사내 경영진 | 갱신 실적 내부 보고 | 분기 갱신 성과 | [내부보고] …요율 +6.5%, 패널 4사 |

각 수신자는 `analysis{purpose,context,points[],tone}` + `subject` + `body` (ko/en) 보유.

## 상태 모델 (state.ts)

```
phase, statusText
selectedSources: string[]           // SOURCES.defaultOn으로 초기화
sections: ReportSectionId[]
recipientId: string | null
analysisReady: boolean              // analyzing 중 로더→결과 전환
emailSubject, emailBody, emailStatus
toggleSource(id)                    // phase 'sources'|'done'에서만
generate()                          // sources → report 섹션 스트리밍 → reportReady
selectRecipient(id)                 // reportReady → analyzing(로더→분석) → email 스트리밍 → done
reset()
```

## 컴포넌트 (widgets.tsx)

- `SourcePicker` / 접힌 `SourceSummary` (근거 자료 N건)
- `ReportColumn`(기존, 자료 헤더 추가) · `Section`(기존)
- `RecipientPicker`(3 카드) · `AnalysisCard`(로더→필드) · `EmailPanel`(기존 확장: 분석 카드 + 수신자)
- data-demo-id: `source-toggle-<id>`, `generate-btn`, `report-panel`, `recipient-<id>`, `analysis-card`, `attachment-chip`, `email-send`

## 시나리오 (단일)

자료 기본선택 + 1건 토글(브로커 노트) → 생성 → 보고서 → 출재사(cedent) 선택 → 의도 분석 → 맞춤 이메일 → 첨부 강조.

## 변형

기존 v1/v2 → **단일 변형**으로 통합 (`index.ts` variants 1개).

## 검증

- `tsc --noEmit` 통과
- dev: 자료 선택 → 보고서 "근거 자료 N건" → 수신자 선택 → 분석 카드 → 맞춤 이메일까지 재생 확인(스크린샷)

## 범위 밖 (YAGNI)

- 실제 파일 업로드/파싱, 실제 발송, 수신자 임의 추가/검색
