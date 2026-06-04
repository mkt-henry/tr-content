# ARIA Demo Studio

재보험 중개 특화 AI 에이전트 **ARIA**(insightre.ai, by Treasurer)의 SNS 콘텐츠용 데모 영상을
화면 녹화로 제작하기 위한 데모 UIUX 쇼케이스 앱입니다.
모든 데모는 더미 데이터로 실제 기능이 동작하는 것처럼 시뮬레이션됩니다.

## 데모 구성 (7종)

| 데모 | 내용 | 벤치마크 |
|---|---|---|
| 문서 비교 Matrix | 슬립/특약 문서 × 추출 항목 그리드, 셀 자동 채움 + 원문 인용 | Hebbia Matrix |
| 리스크 요약·번역 | 영문 슬립 → 한국어 구조화 요약, 원문 구절 하이라이트 동기화 | citation-first |
| 재보험사 매칭 + 영업 이메일 | 적합도 랭킹 → 담당자 맞춤 영문 이메일 스트리밍 | ARIA 고유 |
| 갱신 파이프라인 + 미팅 브리핑 | D-day 칸반 → 미팅 전 자동 브리핑 4카드 | Rogo Meeting Prep |
| AI 갱신 제안서 생성 | Treaty 갱신 제안서 슬라이드 자동 생성 | — |
| 계약·클레임 Q&A | 특약 문서 질의응답 + 원문 근거 카드 | — |
| 수재 매출 포캐스트 | 수재/출재 KPI·차트 + 갱신 파이프라인 위젯 | — |

원문 인용 UI는 V7 Go의 "AI Citations"(가짜 PDF 페이지 미리보기 + 하이라이트 영역 박스)를 참고했습니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 정적 빌드 (Vercel 배포 가능)
```

## 사용법 (녹화 워크플로)

1. 갤러리에서 기능 카드 또는 버전·소구점 칩을 클릭해 데모 진입
2. 하단 컨트롤 바에서 디바이스/프레임/배경 구성을 맞춤
3. `F`로 전체 화면 → 화면 녹화 시작 → `Space`로 자동 재생
4. 재생 중에는 컨트롤 바가 자동으로 숨겨지고, 하단 가장자리에 마우스를 가져가면 다시 나타납니다
5. 재생 중 데모를 직접 클릭하면 자동 재생이 멈추고 그 상태 그대로 수동 조작으로 이어집니다

### 키보드 단축키

| 키 | 동작 |
|---|---|
| `Space` | 자동 재생 / 정지 |
| `R` | 리셋 |
| `F` | 전체 화면 |
| `D` | 데스크탑 ↔ 모바일 |
| `P` | 폰 목업 프레임 토글 (모바일) |
| `B` | 브라우저 프레임 토글 |

## 새 데모 추가하기

`src/demos/<name>/` 폴더를 만들고 `index.ts`에서 `FeatureDefinition`을 default export하면
자동으로 갤러리에 등록됩니다 (중앙 등록 파일 수정 불필요 — `import.meta.glob` 자동 수집).

```
src/demos/my-feature/
├─ index.ts      # FeatureDefinition export (제목, 변형, 배경, 시나리오)
├─ state.ts      # Zustand store — 자동/수동 모드가 공유하는 상태
├─ scenario.ts   # 자동 재생 시나리오 (Step[])
├─ Desktop.tsx   # 데스크탑 UI
├─ Mobile.tsx    # 모바일 UI (생략 시 Desktop을 모바일 뷰포트에 렌더)
└─ data.ts       # 한국어 더미 데이터
```

### 핵심 아키텍처: 자동/수동 공유 상태

- 데모 UI는 **store 상태만 보고 렌더**합니다. 수동 입력(`onChange`)도, 자동 재생 엔진도
  결국 같은 store action을 호출하므로 양쪽 모드에서 동일하게 동작합니다.
- 인터랙티브 요소에는 `data-demo-id="..."`를 붙입니다. 시나리오의 `cursor`/`click`/`type`
  스텝이 이 ID로 요소 위치를 찾아 가짜 커서를 움직입니다.
- 생성·스트리밍 같은 비동기 시뮬레이션은 store 안에 두고(runId 토큰으로 abort),
  시나리오에서는 action 호출 + `wait`로 연출합니다.

### 시나리오 스텝

```ts
{ kind: 'wait', ms: 800 }                                      // 대기
{ kind: 'cursor', target: 'kpi-revenue' }                      // 커서 이동
{ kind: 'click', target: 'send-btn', run: () => st().send() }  // 클릭 + action
{ kind: 'type', target: 'input', text: '…', set: v => st().setInput(v) }  // 타이핑
{ kind: 'stream', text: '…', append: c => st().append(c) }     // 스트리밍
{ kind: 'do', run: () => st().load() }                         // 임의 조작
```

### 버전 · 소구점 변형

`FeatureDefinition.variants`에 변형을 추가하면 갤러리 칩과 컨트롤 바 드롭다운에 나타납니다.
변형마다 배경(`gradient` | `image`), 시나리오, 주소창 URL을 다르게 지정할 수 있습니다.

## 디렉토리 구조

```
src/
├─ shell/       # 갤러리·스테이지·프레임·컨트롤 바 (데모 비종속)
├─ engine/      # 자동 재생 엔진 (스텝 인터프리터, 가짜 커서, 재생 상태)
├─ registry/    # 데모 자동 수집 + 타입
├─ demos/       # ★ 데모들 — 폴더만 추가하면 등록
├─ store/       # 셸 상태 (디바이스, 프레임 토글 등)
└─ ui/, lib/    # 공용 유틸
```
