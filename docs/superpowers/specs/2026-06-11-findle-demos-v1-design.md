# Findle 데모 영상 기획 (1차) — 학생 데일리 퀴즈 + 교사 AI Quiz Generator

날짜: 2026-06-11 · 참고: findle.io · 에셋: `src/assets/findle/`

## 제품 요약 (findle.io)

학생(중·고·대학) 대상 게임형 금융 리터러시 앱. **"오늘의 뉴스가 오늘의 수업"** — 실시간 금융
뉴스를 AI가 데일리 퀴즈로 변환. 학생은 풀고 → XP·Fins 획득 → 클래스 리더보드 → 뱃지 → 리워드
교환. 교사는 뉴스 URL로 퀴즈를 생성하고 진도를 대시보드로 추적. 브랜드: 그린 컬러, 밝고 경쾌한
카드형 UI, 하단탭(Home/Learn/Ranks/Rewards/Me).

## 1차 범위 (확정)

- **데모 2개**: ★1 학생 뉴스→AI 데일리 퀴즈 / ★2 교사 AI Quiz Generator
- **언어**: 한국어 + 영어 (ARIA식 ko/en)

## 프로젝트 셋업 (`src/registry/projects.ts`)

- `findle` 항목 갱신: tagline `"Today's news becomes today's lesson"`, languages `ko/en`,
  description(데모 스튜디오 안내문). `mobileOnly`는 설정하지 않음(교사 데모가 데스크탑).
- 그린 액센트(목업 기준 ~`#1f9d63` 계열) — 빌드 시 확정.
- (인트로/아웃트로 브랜딩은 후속. 1차는 데모 본체.)

## ★1 데모: `findle/daily-quiz` (학생)

- **화면(에셋 참고)**: Home(대시보드: Lv·XP·streak·fins·클래스 순위) → 오늘의 뉴스 카드(Stock)
  → 퀴즈 러너(문항·보기·제출·해설) → 결과(+XP·+Fins·레벨 진행) → 홈 갱신.
- **상태(state.ts)**: `screen: home|news|quiz|result`, `currentQ`, `selected`, `submitted`,
  `xp/fins/level/streak`, `quizCount`. (Treazer `ai-daily-quiz` 패턴 재사용)
- **데이터(data.ts, ko/en)**: 뉴스 헤드라인 1건(예: 금리/주식) + 퀴즈 2문항(질문·보기4·정답·해설) +
  보상치(XP/Fins).
- **시나리오**: v1 *"뉴스→퀴즈→보상 30초"*(속도) — 뉴스 탭→풀이(정답)→결과 적립.
  v2 *"해설·오답 follow-up"*(학습 깊이) — 1정답 + 1오답 후 AI 추가 문항·해설 강조.
- **컴포넌트**: Desktop + Mobile(모바일 우선), 그린 테마.

## ★2 데모: `findle/quiz-gen` (교사·데스크탑)

- **화면(에셋: Quiz Generator)**: 좌측 입력(뉴스 URL·문항수·난이도 Beginner/Intermediate/
  Advanced/Mixed·Generate) / 우측 결과 패널.
- **플로우**: URL 입력 → 난이도·문항수 선택 → Generate → "기사 분석 중" → 생성된 문항이
  우측에 순차 스트리밍(질문+보기4+정답+해설) → 저장/클래스 배정.
- **상태(state.ts)**: `url`, `count`, `difficulty`, `phase: idle|reading|generating|done`,
  `questions[]`(스트리밍 누적). (ARIA `ai-doc-gen` 생성 스트리밍 패턴 재사용)
- **데이터(data.ts, ko/en)**: 샘플 금융 기사 1건 + 생성 문항 3개(난이도별 톤).
- **시나리오**: v1 *"어떤 뉴스든 30초 퀴즈화"* / v2 *"난이도 적응(중→대학)"*.
- **컴포넌트**: Desktop(메인) + Mobile(간소화 버전).

## 재사용 매핑

- ★1 ← Treazer `ai-daily-quiz`(뉴스 퀴즈 루프·XP), `gold-store`(리워드 연출)
- ★2 ← ARIA `ai-doc-gen`(생성 단계 스트리밍), `aria-match`(결과 패널)

## 검증 (빌드 시)

- `tsc --noEmit` 통과
- 갤러리 Findle 탭에 2개 카드 등장, v1/v2 자동재생: ★1 홈→뉴스→퀴즈→리워드, ★2 URL→생성→문항 스트리밍 (스크린샷)

## 범위 밖 (후속)

- 리더보드·뱃지·리워드 교환·교사 대시보드 데모(2차), Findle 인트로/아웃트로 브랜딩, 실데이터/실발송
