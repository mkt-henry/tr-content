# Treazer AI 데일리 퀴즈 고도화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Treazer `ai-daily-quiz` 데모를 단일 화면에서 "피드 → 기사+퀴즈 → 풀이 → 결과" 전체 여정으로 확장하고, 풀이+골드 적립(v1)·콤보/스트릭(v2) 루프를 자동재생으로 시연한다.

**Architecture:** mobileOnly 자동재생 데모. zustand 상태(`screen` 라우팅)로 3화면 전환, framer-motion 애니메이션, 모든 상태 변화는 store action 경유(엔진 `run.ts`가 `data-demo-id`로 커서 조작). 콘텐츠는 EN/JA/VI/TH 4개 언어(`L` 타입).

**Tech Stack:** React 18, TypeScript(strict), Vite, Tailwind v4, framer-motion, zustand, lucide-react. 검증은 `npm run build`(tsc --noEmit && vite build) + dev 서버(`localhost:5173`) 브라우저 스모크.

**참조 파일(실행 전 정독):**
- 스펙: `docs/superpowers/specs/2026-06-09-treazer-ai-daily-quiz-design.md`
- 기존 구현(덮어쓸 대상): `src/demos/treazer/ai-daily-quiz/*`
- 패턴 참조: `src/demos/treazer/quiz-gold/`(멀티스크린+풀이), `src/demos/treazer/gold-store/`(화면 라우팅), `src/demos/aria/ai-chat/state.ts`(async 단계 진행)
- 공용: `src/demos/treazer/_shared/ui.tsx`(Coin/GoldPill/BottomNav/Wordmark/TZ_BACKGROUND), `src/demos/treazer/_shared/i18n.ts`(L/Lang/pick/fmt/getLang)
- 엔진/타입: `src/registry/types.ts`, `src/engine/types.ts`, `src/engine/run.ts`, `src/ui/CountUp.tsx`

**전역 제약:**
- 오직 `src/demos/treazer/ai-daily-quiz/` 안에서만 작업. `_shared`·다른 데모·공용(`registry/engine/shell/ui`) 수정 금지.
- FeatureDefinition `id`는 `tz-ai-daily-quiz` 유지(레지스트리/녹화 파일명 호환).
- 모든 사용자 표시 텍스트는 `L = {en, ja, vi, th}`. 시나리오/스토어(훅 밖)는 `getLang()`.
- 커밋은 사용자 환경 규칙상 사용자가 명시 요청할 때만(아래 커밋 step은 사용자 승인 후 실행). 현재 main에 알파렌즈 미커밋 변경이 섞여 있으므로, 커밋 시 먼저 `feat/treazer-quiz-upgrade` 브랜치 생성 + 이 데모 폴더 + 스펙/플랜 파일만 stage.

---

## 파일 구조

| 파일 | 책임 | 상태 |
|---|---|---|
| `ai-daily-quiz/data.ts` | 피드 기사·풀이 기사·퀴즈·UI 문자열(4개 언어) | 전면 재작성 |
| `ai-daily-quiz/state.ts` | zustand: screen 라우팅, 골드/적립, 답안, combo/streak | 전면 재작성 |
| `ai-daily-quiz/widgets.tsx` | Thumbnail, AdBanner, GoldFloat, ComboBadge 등 공용 소품 | 신규 |
| `ai-daily-quiz/FeedScreen.tsx` | 피드 화면(기사 리스트 + 광고 배너) | 신규 |
| `ai-daily-quiz/ArticleQuizScreen.tsx` | 기사 상세 + 퀴즈 묶음 + 풀이 인터랙션 | 신규 |
| `ai-daily-quiz/ResultScreen.tsx` | 결과 오버레이(v1 총합 / v2 스트릭·콤보) | 신규 |
| `ai-daily-quiz/screens.tsx` | `AppScreens` 래퍼 + screen 상태 라우팅 | 전면 재작성 |
| `ai-daily-quiz/scenario.ts` | v1/v2 자동재생 시나리오 | 전면 재작성 |
| `ai-daily-quiz/index.ts` | FeatureDefinition + variant 2종 | 수정 |
| `ai-daily-quiz/Mobile.tsx` / `Desktop.tsx` | `AppScreens` 렌더 | 변경 없음(확인만) |

---

## Task 1: 데이터 레이어 (`data.ts`)

**Files:**
- Modify(전면 재작성): `src/demos/treazer/ai-daily-quiz/data.ts`

- [ ] **Step 1: 타입 + 상수 정의**

```ts
import type { L, Lang } from '../_shared/i18n';

export const INITIAL_GOLD = 8077;

/** 피드 카드용 기사 요약 */
export interface FeedArticle {
  id: string;
  title: L;
  category: L;
  reward: number;            // up to N G
  thumb: { from: string; to: string; emoji: string }; // 추상 썸네일(그라디언트+이모지)
  /** true면 이 카드가 풀이 대상(클릭 시 ArticleQuiz로) */
  solvable?: boolean;
}

/** 4지선다 퀴즈 1문제 */
export interface Quiz {
  question: L;
  options: L<string[]>;      // 길이 4
  correctIndex: number;      // 0~3
  explanation: L;            // 정답 후 1~2줄 해설
  reward: number;            // 정답 시 적립 골드
}

/** 풀이 대상 기사(상세 + 퀴즈 묶음) */
export interface SolvableArticle {
  headline: L;
  summary: L;                // 2~3문단(줄바꿈 \n\n)
  source: string;
  time: L;
  thumb: { from: string; to: string; emoji: string };
  quizzes: Quiz[];           // 3문제
}

/** 언어 칩 — EN/JA/VI/TH */
export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'en', label: 'EN', flag: '🇸🇬' },
  { id: 'ja', label: 'JA', flag: '🇯🇵' },
  { id: 'vi', label: 'VI', flag: '🇻🇳' },
  { id: 'th', label: 'TH', flag: '🇹🇭' },
];
```

- [ ] **Step 2: 피드 기사 6개 작성**

`FEED_ARTICLES: FeedArticle[]` 6개. 첫 항목은 `solvable: true`(FRB 금리 기사). 나머지 5개는 실제 화면 톤의 경제/뉴스 헤드라인(증시·원자재·기업·교육·EV 등). 모든 `title`/`category`는 4개 언어. `reward`는 실제 화면처럼 큰 수(예: 14050, 10270, 49100, 47400, 26950). `thumb`는 카테고리별 색 + 이모지(📈 💹 🏭 🎓 🚗 등).

예시(첫 항목):
```ts
export const FEED_ARTICLES: FeedArticle[] = [
  {
    id: 'fed-rate',
    title: {
      en: 'Fed holds benchmark rate, hints at a cut later this year',
      ja: 'FRB、政策金利を据え置き 年内利下げを示唆',
      vi: 'Fed giữ nguyên lãi suất, ám chỉ cắt giảm cuối năm',
      th: 'เฟดคงดอกเบี้ย ส่งสัญญาณลดภายในปีนี้',
    },
    category: { en: 'Markets', ja: '市場', vi: 'Thị trường', th: 'ตลาด' },
    reward: 14050,
    thumb: { from: '#fb923c', to: '#ea580c', emoji: '📈' },
    solvable: true,
  },
  // … 5개 더 (solvable 없음)
];
```

- [ ] **Step 3: 풀이 대상 기사 + 퀴즈 3개 작성**

`SOLVABLE = FEED_ARTICLES[0]`와 동일 주제. `SOLVABLE_ARTICLE: SolvableArticle` 작성. `summary`는 4개 언어 2~3문단. `quizzes` 3개는 기존 `data.ts`의 문제를 4지선다+해설로 확장:

```ts
export const SOLVABLE_ARTICLE: SolvableArticle = {
  headline: FEED_ARTICLES[0].title,
  source: 'Treazer News',
  time: { en: 'Today 08:12 AM', ja: '今日 午前08:12', vi: 'Hôm nay 08:12', th: 'วันนี้ 08:12 น.' },
  thumb: FEED_ARTICLES[0].thumb,
  summary: {
    en: 'The U.S. Federal Reserve held its benchmark rate at 5.50%...\n\nWith inflation cooling, markets now expect a possible cut before year-end...',
    ja: '…', vi: '…', th: '…',
  },
  quizzes: [
    {
      question: { en: 'What did the Fed do with its benchmark rate?', ja: '今回、FRBは政策金利をどうしましたか？', vi: 'Fed đã làm gì với lãi suất cơ bản?', th: 'เฟดทำอย่างไรกับอัตราดอกเบี้ย?' },
      options: {
        en: ['Held it steady', 'Raised it', 'Cut it sharply', 'Abolished it'],
        ja: ['据え置いた', '引き上げた', '大幅に下げた', '廃止した'],
        vi: ['Giữ nguyên', 'Tăng lên', 'Cắt giảm mạnh', 'Bãi bỏ'],
        th: ['คงไว้เท่าเดิม', 'ปรับขึ้น', 'ลดแรง', 'ยกเลิก'],
      },
      correctIndex: 0,
      explanation: { en: 'The Fed left rates unchanged at 5.50% to assess incoming data.', ja: 'FRBはデータを見極めるため5.50%で据え置きました。', vi: 'Fed giữ 5,50% để chờ thêm dữ liệu.', th: 'เฟดคงไว้ที่ 5.50% เพื่อรอข้อมูลเพิ่ม' },
      reward: 50,
    },
    // 2번 문제(correctIndex 임의), 3번 문제 — 동일 구조, reward 40/30
  ],
};
```
(2·3번 문제는 기존 data.ts의 "냉각된 인플레이션", "연내 금리 인하" 주제를 4지선다+해설로 확장. 오답 보기 2개씩 추가.)

- [ ] **Step 4: UI 문자열 `STR` 작성**

```ts
export const STR = {
  dailyQuizTitle: { en: 'Daily Quiz', ja: 'デイリークイズ', vi: 'Quiz hằng ngày', th: 'ควิซประจำวัน' },
  feedSubtitle: { en: 'Read today’s news, earn gold.', ja: '今日のニュースを読んでゴールドを獲得', vi: 'Đọc tin hôm nay, nhận vàng.', th: 'อ่านข่าววันนี้ รับทอง' },
  upTo: { en: 'up to {n} G', ja: '最大{n}G', vi: 'tới {n} G', th: 'สูงสุด {n} G' },
  aiQuizHeader: { en: 'AI-generated Quiz', ja: 'AIが作ったクイズ', vi: 'Quiz do AI tạo', th: 'ควิซที่ AI สร้าง' },
  correct: { en: 'Correct!', ja: '正解！', vi: 'Chính xác!', th: 'ถูกต้อง!' },
  wrong: { en: 'Not quite', ja: '不正解', vi: 'Chưa đúng', th: 'ยังไม่ถูก' },
  earned: { en: '+{n} G', ja: '+{n}G', vi: '+{n} G', th: '+{n} G' },
  combo: { en: 'Combo x{n}!', ja: 'コンボ x{n}！', vi: 'Combo x{n}!', th: 'คอมโบ x{n}!' },
  resultTitle: { en: 'Quiz complete!', ja: 'クイズ完了！', vi: 'Hoàn thành!', th: 'ทำเสร็จแล้ว!' },
  resultGold: { en: 'You earned {n} G', ja: '{n}G を獲得', vi: 'Bạn nhận {n} G', th: 'คุณได้รับ {n} G' },
  resultScore: { en: '{c}/{t} correct', ja: '{c}/{t} 正解', vi: 'Đúng {c}/{t}', th: 'ถูก {c}/{t}' },
  streakTitle: { en: '{n}-day streak 🔥', ja: '{n}日連続 🔥', vi: 'Chuỗi {n} ngày 🔥', th: 'ต่อเนื่อง {n} วัน 🔥' },
  tomorrow: { en: 'Come back tomorrow for more', ja: '明日もチャレンジ', vi: 'Quay lại ngày mai', th: 'กลับมาพรุ่งนี้' },
  playAgain: { en: 'Play again tomorrow', ja: '明日また挑戦', vi: 'Chơi lại ngày mai', th: 'เล่นอีกพรุ่งนี้' },
  backToFeed: { en: 'Back to feed', ja: 'フィードへ', vi: 'Về bảng tin', th: 'กลับหน้าข่าว' },
} satisfies Record<string, L>;
```

- [ ] **Step 5: 타입체크**

Run: `npx tsc --noEmit`
Expected: data.ts 관련 에러 없음(다른 파일이 옛 export를 참조해 생기는 에러는 다음 태스크에서 해소).

---

## Task 2: 상태 스토어 (`state.ts`)

**Files:**
- Modify(전면 재작성): `src/demos/treazer/ai-daily-quiz/state.ts`

- [ ] **Step 1: 스토어 작성**

```ts
import { create } from 'zustand';
import { getLang, type Lang } from '../_shared/i18n';
import { INITIAL_GOLD, SOLVABLE_ARTICLE } from './data';

type Screen = 'feed' | 'article' | 'result';

interface AnswerState {
  selected: number;   // 선택한 보기 index
  correct: boolean;
}

interface State {
  screen: Screen;
  lang: Lang;
  gold: number;                 // 헤더 보유 골드(적립 시 증가 → CountUp)
  earnedGold: number;           // 이번 세션 획득 합계
  answers: Record<number, AnswerState>; // quizIndex → 결과
  combo: number;                // v2: 현재 연속 정답 수
  comboMode: boolean;           // v2 variant 여부(콤보/스트릭 연출)
  flash: boolean;               // 골드 필 플래시 트리거

  goToFeed: () => void;
  openArticle: () => void;
  /** 보기 선택 → 채점 + 골드 적립(+v2 콤보 보너스) */
  selectAnswer: (quizIndex: number, optIndex: number) => void;
  finish: () => void;
  setLang: (lang: Lang) => void;
  setComboMode: (on: boolean) => void;
  reset: () => void;
}

let runId = 0;

export const useAiDailyQuiz = create<State>((set, get) => ({
  screen: 'feed',
  lang: getLang(),
  gold: INITIAL_GOLD,
  earnedGold: 0,
  answers: {},
  combo: 0,
  comboMode: false,
  flash: false,

  goToFeed: () => set({ screen: 'feed' }),
  openArticle: () => set({ screen: 'article' }),

  selectAnswer: (quizIndex, optIndex) => {
    const s = get();
    if (s.answers[quizIndex]) return; // 이미 푼 문제
    const quiz = SOLVABLE_ARTICLE.quizzes[quizIndex];
    const correct = optIndex === quiz.correctIndex;
    const combo = correct ? s.combo + 1 : 0;
    // v2: 2연속부터 콤보 배수(2,3,…), v1: 항상 1배
    const mult = s.comboMode && combo >= 2 ? combo : 1;
    const gain = correct ? quiz.reward * mult : 0;
    set({
      answers: { ...s.answers, [quizIndex]: { selected: optIndex, correct } },
      combo,
      earnedGold: s.earnedGold + gain,
      gold: s.gold + gain,
      flash: gain > 0,
    });
    if (gain > 0) setTimeout(() => set({ flash: false }), 500);
  },

  finish: () => set({ screen: 'result' }),
  setLang: (lang) => set({ lang }),
  setComboMode: (on) => set({ comboMode: on }),

  reset: () => {
    runId++;
    set({
      screen: 'feed',
      lang: getLang(),
      gold: INITIAL_GOLD,
      earnedGold: 0,
      answers: {},
      combo: 0,
      flash: false,
      // comboMode는 variant가 scenario 첫 스텝에서 세팅하므로 reset에서 건드리지 않음
    });
  },
}));
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: state.ts 자체 에러 없음(화면 파일 미작성으로 인한 에러는 무시).

---

## Task 3: 공용 소품 (`widgets.tsx`)

**Files:**
- Create: `src/demos/treazer/ai-daily-quiz/widgets.tsx`

- [ ] **Step 1: 작성**

다음 컴포넌트 export(framer-motion + Tailwind, `cn` from `../../../lib/cn`, `Coin` from `../_shared/ui`):

- `Thumbnail({ thumb, className })` — `linear-gradient(135deg, from, to)` 배경 div + 가운데 큰 이모지. 라운드.
- `AdBanner()` — 파란 배경 + 흰 텍스트("우리 가족 안심생활 / 시작하기 >") 비인터랙티브 장식 배너(실제 화면 재현).
- `GoldFloat({ show, amount })` — `show`일 때 "+{amount} G" 칩이 아래→위로 떠오르며 fade out(`AnimatePresence`, y: 0→-40, opacity 1→0). amber 컬러 + `Coin`.
- `ComboBadge({ combo })` — `combo >= 2`일 때 "🔥 콤보 x{combo}!" 작은 배지(scale pop 애니메이션).

각 컴포넌트는 props 타입을 명시. 색/사이즈는 기존 데모 톤(둥근 모서리 `rounded-2xl`, 그림자 `shadow-sm`).

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: widgets.tsx 자체 에러 없음.

---

## Task 4: 피드 화면 (`FeedScreen.tsx`)

**Files:**
- Create: `src/demos/treazer/ai-daily-quiz/FeedScreen.tsx`

- [ ] **Step 1: 작성**

레이아웃(위→아래):
- 헤더: `Wordmark` + `GoldPill amount={gold} flash={flash}` (from `_shared/ui`).
- 타이틀 영역: `STR.dailyQuizTitle` + `STR.feedSubtitle` (`pick(_, lang)`).
- `demo-scroll` 스크롤 컨테이너에 `FEED_ARTICLES.map` 카드:
  - 각 카드: `Thumbnail` + 제목 2줄(`line-clamp-2`) + 하단 "up to {reward} G"(`fmt(pick(STR.upTo,lang),{n})` + `Coin`).
  - `solvable` 카드에 `data-demo-id="feed-article-{id}"`, `onClick={openArticle}`.
  - 3번째 카드 뒤에 `<AdBanner />` 삽입.
- 하단 `BottomNav active="home"`.

framer-motion: 카드들 stagger fade-in(`delay = index * 0.05`).

상태: `const { gold, flash, lang, openArticle } = useAiDailyQuiz();`

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: FeedScreen 자체 에러 없음.

---

## Task 5: 기사+퀴즈 화면 (`ArticleQuizScreen.tsx`)

**Files:**
- Create: `src/demos/treazer/ai-daily-quiz/ArticleQuizScreen.tsx`

- [ ] **Step 1: 기사 헤더 + 본문 섹션**

- 상단 바: 뒤로가기(`ChevronLeft`, `onClick={goToFeed}`) + `Wordmark` + `GoldPill amount={gold} flash={flash}`.
- 기사 헤더: `Thumbnail`(큰 사이즈) + `headline`(`pick`) + source · time.
- 본문: `summary`(`pick`, `whitespace-pre-line`).
- 구분선 + "✨ {STR.aiQuizHeader}" 섹션 헤더(`Sparkles`).

- [ ] **Step 2: 퀴즈 카드 + 풀이 인터랙션**

`SOLVABLE_ARTICLE.quizzes.map((quiz, i) => <QuizBlock index={i} />)`. `QuizBlock`:
- 상단: "AI Quiz" + "up to {reward} G".
- 질문(`pick(quiz.question, lang)`).
- 2×2 그리드 보기 버튼 4개. 각 버튼 `data-demo-id="quiz-{i}-opt-{j}"`, `onClick={() => selectAnswer(i, j)}`.
- 채점 상태(`answers[i]`)에 따른 스타일:
  - 미응답: 회색 보더.
  - 정답 보기(correctIndex): 응답 후 **녹색**(emerald) 배경/체크.
  - 선택한 오답: **빨강**(rose).
- 응답 후: `STR.correct`/`STR.wrong` 라벨 + `GoldFloat show amount={적립액}` + 해설(`pick(quiz.explanation, lang)`) `motion` 슬라이드 다운.
- comboMode면 정답 시 `ComboBadge combo={combo}` 노출.

마지막 문제까지 풀면 하단에 "결과 보기" 버튼(`data-demo-id="see-result"`, `onClick={finish}`) 등장(framer-motion).

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

---

## Task 6: 결과 화면 (`ResultScreen.tsx`)

**Files:**
- Create: `src/demos/treazer/ai-daily-quiz/ResultScreen.tsx`

- [ ] **Step 1: 작성**

- 중앙 카드: 🎉 + `STR.resultTitle`.
- `STR.resultGold`에 `CountUp value={earnedGold}` (from `../../../ui/CountUp`).
- `STR.resultScore`(정답 수 = `Object.values(answers).filter(a=>a.correct).length` / 총 문제 수).
- comboMode(v2)일 때만: `STR.streakTitle`(고정 7) 스트릭 카드 + `STR.tomorrow`.
- CTA 버튼: `STR.playAgain`(또는 `backToFeed`, `data-demo-id="result-cta"`).
- 진입 애니메이션: scale/opacity pop.

상태: `const { earnedGold, answers, comboMode, lang } = useAiDailyQuiz();`

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

---

## Task 7: 화면 라우팅 (`screens.tsx`)

**Files:**
- Modify(전면 재작성): `src/demos/treazer/ai-daily-quiz/screens.tsx`

- [ ] **Step 1: 작성**

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useAiDailyQuiz } from './state';
import { FeedScreen } from './FeedScreen';
import { ArticleQuizScreen } from './ArticleQuizScreen';
import { ResultScreen } from './ResultScreen';

export function AppScreens() {
  const screen = useAiDailyQuiz((s) => s.screen);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f6]">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {screen === 'feed' && <FeedScreen />}
          {screen === 'article' && <ArticleQuizScreen />}
          {screen === 'result' && <ResultScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Mobile.tsx / Desktop.tsx 확인**

두 파일이 `import { AppScreens } from './screens'` 후 `<AppScreens />` 렌더하는지 확인. 변경 불필요면 그대로 둠.

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

---

## Task 8: 시나리오 + FeatureDefinition (`scenario.ts`, `index.ts`)

**Files:**
- Modify(전면 재작성): `src/demos/treazer/ai-daily-quiz/scenario.ts`
- Modify: `src/demos/treazer/ai-daily-quiz/index.ts`

- [ ] **Step 1: `scenario.ts` 작성**

```ts
import type { Scenario } from '../../../engine/types';
import { SOLVABLE_ARTICLE } from './data';
import { useAiDailyQuiz } from './state';

const st = () => useAiDailyQuiz.getState();
const N = SOLVABLE_ARTICLE.quizzes.length; // 3
const correctOf = (i: number) => SOLVABLE_ARTICLE.quizzes[i].correctIndex;

/** v1 — 풀이+적립 루프: 피드 → 기사 → 정답 풀이 → 결과 */
export const solveEarnScenario: Scenario = {
  id: 'tz-daily-quiz-solve-earn',
  steps: [
    { kind: 'do', run: () => st().setComboMode(false) },
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'feed-article-fed-rate', ms: 700 },
    { kind: 'wait', ms: 600 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1400 },
    // 문제 순차 풀이(정답)
    { kind: 'click', target: 'quiz-0-opt-' + correctOf(0), run: () => st().selectAnswer(0, correctOf(0)) },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'quiz-1-opt-' + correctOf(1), run: () => st().selectAnswer(1, correctOf(1)) },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'quiz-2-opt-' + correctOf(2), run: () => st().selectAnswer(2, correctOf(2)) },
    { kind: 'wait', ms: 1400 },
    { kind: 'click', target: 'see-result', run: () => st().finish() },
    { kind: 'wait', ms: 2400 },
  ],
};

/** v2 — 콤보/스트릭: 동일 흐름이되 연속 정답으로 콤보 강조 */
export const comboStreakScenario: Scenario = {
  id: 'tz-daily-quiz-combo-streak',
  steps: [
    { kind: 'do', run: () => st().setComboMode(true) },
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'quiz-0-opt-' + correctOf(0), run: () => st().selectAnswer(0, correctOf(0)) },
    { kind: 'wait', ms: 1500 },
    { kind: 'click', target: 'quiz-1-opt-' + correctOf(1), run: () => st().selectAnswer(1, correctOf(1)) }, // 콤보 x2
    { kind: 'wait', ms: 1700 },
    { kind: 'click', target: 'quiz-2-opt-' + correctOf(2), run: () => st().selectAnswer(2, correctOf(2)) }, // 콤보 x3
    { kind: 'wait', ms: 1700 },
    { kind: 'click', target: 'see-result', run: () => st().finish() },
    { kind: 'wait', ms: 2600 },
  ],
};
```

- [ ] **Step 2: `index.ts` variant 교체**

`import { solveEarnScenario, comboStreakScenario } from './scenario';`로 교체. variants 2개:
```ts
variants: [
  { id: 'solve-earn', label: '풀고 골드 적립', version: 'v1', sellingPoint: 'Learn & Earn',
    url: 'treazer.app/daily-quiz', background: TZ_BACKGROUND, scenario: solveEarnScenario },
  { id: 'combo-streak', label: '연속 정답 콤보', version: 'v2', sellingPoint: '데일리 리텐션',
    url: 'treazer.app/daily-quiz', background: TZ_BACKGROUND, scenario: comboStreakScenario },
],
```
`id`(`tz-ai-daily-quiz`), `title`, `description`(필요 시 "풀이→골드 적립" 톤으로 갱신), `icon`, `accent`, `resetState`는 유지/소폭 수정.

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: **전체 프로젝트 에러 0**.

---

## Task 9: 통합 빌드 & 브라우저 검증

**Files:** 없음(검증 전용)

- [ ] **Step 1: 프로덕션 빌드**

Run: `npm run build`
Expected: `tsc --noEmit` 통과 + `vite build` 성공(청크 크기 경고는 무시).

- [ ] **Step 2: dev 서버 + 브라우저 스모크**

`npm run dev`(백그라운드, `localhost:5173`) → Treazer 탭 → "AI 데일리 퀴즈" v1 열기 → 자동 재생.
확인 항목:
- 피드 렌더(기사 카드 + 썸네일 + up to N G + 광고 배너), 콘솔 에러 0.
- 기사 카드 클릭 → 기사 상세+퀴즈 전환.
- 보기 클릭 → 정답 녹색/해설 슬라이드/+N G 플로팅/헤더 골드 카운트업.
- 마지막 문제 후 "결과 보기" → 결과 화면(총 골드 CountUp, 정답 수).
- v2 열기 → 콤보 배지(x2, x3) + 결과 스트릭 카드 노출.
- 언어 전환(상단 컨트롤 ja/vi/th) 시 콘텐츠 반영.

- [ ] **Step 3: (사용자 승인 시) 커밋**

```bash
git checkout -b feat/treazer-quiz-upgrade
git add src/demos/treazer/ai-daily-quiz docs/superpowers/specs/2026-06-09-treazer-ai-daily-quiz-design.md docs/superpowers/plans/2026-06-09-treazer-ai-daily-quiz.md
git commit -m "feat(treazer): AI 데일리 퀴즈를 피드→풀이→적립 루프로 고도화"
```
(end commit message with the Co-Authored-By trailer per repo convention)

---

## Self-Review (작성자 점검 완료)

- **스펙 커버리지:** 피드(Task4)·기사+퀴즈/풀이(Task5)·결과(Task6)·v1/v2(Task2 comboMode + Task8 시나리오)·4언어(Task1 데이터)·파일분리(Task3~7)·시나리오(Task8)·빌드검증(Task9) 모두 태스크로 매핑됨.
- **플레이스홀더:** 데이터 본문(2·3번 문제, 5개 피드 기사, summary 번역)은 "동일 구조로 N개"로 위임 — 구조/예시/언어 키가 명시되어 실행 가능. 로직(state/scenario)은 완전 코드.
- **타입 일관성:** `selectAnswer(quizIndex, optIndex)`, `openArticle`/`goToFeed`/`finish`/`setComboMode`/`setLang`/`reset`, `comboMode`/`combo`/`flash`/`earnedGold` 명칭이 state·scenario·화면 전반에서 일치. `data-demo-id`: `feed-article-fed-rate`, `quiz-{i}-opt-{j}`, `see-result`, `result-cta`, `gold-pill`(공용).
