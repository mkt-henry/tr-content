import { AnimatePresence, motion } from 'framer-motion';
import { Check, Home, ListChecks, Newspaper, RefreshCcw, Sparkles, Trophy } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { DemoComponentProps } from '../../../registry/types';
import { useShellStore } from '../../../store/shellStore';
import type { L } from '../_shared/i18n';
import { pick, useLang } from '../_shared/i18n';
import { FINDLE_GREEN } from '../_shared/ui';
import { DailyQuizApp } from './screens';
import { useDailyQuiz } from './state';

const COPY = {
  kicker: { ko: 'FINDLE · 데일리 퀴즈', en: 'FINDLE · DAILY QUIZ' },
  headline1: { ko: '오늘의 뉴스가', en: "Today's news" },
  headline2: { ko: '오늘의 수업이 됩니다', en: 'becomes the lesson' },
  lead: {
    ko: '매일 아침, 학생 스스로 여는 3분 금융 학습 루프.',
    en: 'A three-minute finance habit students open every morning.',
  },
} satisfies Record<string, L>;

const FEATURES: { icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; title: L; desc: L }[] = [
  {
    icon: Newspaper,
    title: { ko: '매일 아침, 새 금융 뉴스', en: 'A fresh finance headline every morning' },
    desc: {
      ko: 'AI가 그날의 시사 이슈를 학생 눈높이 퀴즈로 자동 변환합니다.',
      en: "AI turns the day's headline into a quiz pitched at student level.",
    },
  },
  {
    icon: Sparkles,
    title: { ko: '정답 맞히면 XP·Fins 적립', en: 'Correct answers earn XP and Fins' },
    desc: {
      ko: '게임처럼 쌓이는 보상으로 매일 아침 학습 습관을 만듭니다.',
      en: 'Game-like rewards build a daily habit of reading the news.',
    },
  },
  {
    icon: RefreshCcw,
    title: { ko: '오답은 AI 맞춤 복습으로', en: 'Wrong answers trigger an AI review' },
    desc: {
      ko: '틀린 개념만 골라 다시 풀게 해 학습 효과를 높입니다.',
      en: 'AI re-quizzes only the weak concept, right when it matters.',
    },
  },
];

/** 데스크탑 = 기능 설명 레이아웃 — 폰 목업 + 카피를 한 쌍으로 중앙 정렬(chromeless).
 *  variant 'narrated'면 우측 카피가 데모 흐름(홈→뉴스→퀴즈→복습→결과)에 맞춰 실시간 전환된다. */
export function Desktop(_: DemoComponentProps) {
  const variantId = useShellStore((s) => s.variantId);
  return <Shell>{variantId === 'narrated' ? <FlowCopy /> : <StaticCopy />}</Shell>;
}

/** 폰 목업 + 카피를 무대 중앙에 배치.
 *  유동(flex) 레이아웃 — CSS transform을 두지 않아 가짜 커서 좌표(offset 기반)가
 *  실제 화면 위치와 정확히 일치한다. 폰 높이는 무대 높이에 비례(%)해 자연스럽게 스케일한다. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-[4%] overflow-hidden bg-[#0e1512] px-[4%] text-zinc-200">
      {/* 폰 목업 — 비율(9:19.5) 유지하며 무대 높이의 ~90%로 크게. minWidth:0로 폭이 aspect-ratio를 따르게 한다 */}
      <div
        className="relative h-[90%] shrink-0 rounded-[3rem] bg-[#0c0b0e] p-[12px] ring-1 ring-white/15 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]"
        style={{ aspectRatio: '9 / 19.5', minWidth: 0, width: 'auto' }}
      >
        <div className="absolute left-1/2 top-[20px] z-30 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/[0.06]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2.45rem] bg-[#131216]">
          <DailyQuizApp />
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-24 -translate-x-1/2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* 카피 */}
      <div className="w-[42%] max-w-[560px] shrink-0">{children}</div>
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.28em]"
      style={{ background: 'rgba(21,160,106,0.12)', color: FINDLE_GREEN }}
    >
      {children}
    </span>
  );
}

/** 정적 버전 — 헤드라인 + 기능 3포인트 카드 */
function StaticCopy() {
  const lang = useLang();
  return (
    <>
      <Kicker>{pick(COPY.kicker, lang)}</Kicker>
      <h1 className="mt-5 text-[42px] font-extrabold leading-[1.13] tracking-tight text-white">
        {pick(COPY.headline1, lang)}
        <br />
        <span style={{ color: FINDLE_GREEN }}>{pick(COPY.headline2, lang)}</span>
      </h1>
      <p className="mt-4 text-[15.5px] leading-relaxed text-zinc-400">{pick(COPY.lead, lang)}</p>

      <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="flex items-start gap-3.5 border-t border-white/[0.06] px-4 py-4 first:border-t-0">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(21,160,106,0.14)' }}
            >
              <Icon className="h-[19px] w-[19px]" style={{ color: FINDLE_GREEN }} />
            </span>
            <div>
              <p className="text-[16px] font-bold leading-snug text-white">{pick(title, lang)}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-zinc-400">{pick(desc, lang)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

type Step = 'home' | 'news' | 'quiz' | 'review' | 'result';

/** 데모 상태 → 현재 흐름 단계 */
const selectStep = (s: ReturnType<typeof useDailyQuiz.getState>): Step => {
  if (s.screen === 'news') return 'news';
  if (s.screen === 'quiz') return s.questions[s.currentQuiz]?.id === 'fu' ? 'review' : 'quiz';
  if (s.screen === 'result') return 'result';
  return 'home';
};

const STEP_COPY: Record<Step, { tag: L; title: L; desc: L }> = {
  home: {
    tag: { ko: '홈', en: 'HOME' },
    title: { ko: '매일 여는 학습 홈', en: 'The daily learning home' },
    desc: {
      ko: '레벨·연속 출석·오늘의 뉴스 퀴즈가 한 화면에 모입니다.',
      en: 'Level, streak, and today’s news quiz — all in one place.',
    },
  },
  news: {
    tag: { ko: '뉴스', en: 'NEWS' },
    title: { ko: '오늘의 금융 뉴스', en: "Today's finance headline" },
    desc: {
      ko: 'AI가 핵심 포인트와 지표로 정리해 학생 눈높이로 보여줍니다.',
      en: 'AI distills it into key points and stats at student level.',
    },
  },
  quiz: {
    tag: { ko: '퀴즈', en: 'QUIZ' },
    title: { ko: '뉴스가 곧 퀴즈', en: 'The news becomes the quiz' },
    desc: {
      ko: '방금 읽은 개념을 바로 문제로 풀며 이해를 확인합니다.',
      en: 'Answer questions on the concept you just read.',
    },
  },
  review: {
    tag: { ko: 'AI 복습', en: 'AI REVIEW' },
    title: { ko: '약점은 AI가 복습', en: 'AI reviews your weak spot' },
    desc: {
      ko: '틀린 개념만 골라 복습 문항을 더해 다시 풀게 합니다.',
      en: 'AI adds a review question on exactly what you missed.',
    },
  },
  result: {
    tag: { ko: '보상', en: 'REWARD' },
    title: { ko: '배움이 곧 보상', en: 'Learning turns into rewards' },
    desc: {
      ko: 'XP와 Fins가 쌓여 내일도 다시 열게 만듭니다.',
      en: 'XP and Fins stack up, bringing students back tomorrow.',
    },
  },
};

const RAIL: { key: Step; icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; label: L }[] = [
  { key: 'home', icon: Home, label: { ko: '홈', en: 'Home' } },
  { key: 'news', icon: Newspaper, label: { ko: '뉴스', en: 'News' } },
  { key: 'quiz', icon: ListChecks, label: { ko: '퀴즈', en: 'Quiz' } },
  { key: 'result', icon: Trophy, label: { ko: '보상', en: 'Reward' } },
];

/** 흐름의 rail 활성 인덱스 — 'review'는 quiz 단계에 속함 */
const RAIL_INDEX: Record<Step, number> = { home: 0, news: 1, quiz: 2, review: 2, result: 3 };

const DIM_LINE = 'rgba(255,255,255,0.09)';

/** 흐름 내레이션 버전 — 데모 상태에 따라 우측 카피가 전환된다 */
function FlowCopy() {
  const lang = useLang();
  const step = useDailyQuiz(selectStep);
  const copy = STEP_COPY[step];
  const activeIdx = RAIL_INDEX[step];

  return (
    <>
      <Kicker>{pick(COPY.kicker, lang)}</Kicker>

      {/* 단계별로 전환되는 카피 블록 */}
      <div className="mt-6 min-h-[172px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-6 items-center rounded-md px-2 font-mono text-[11px] font-bold tracking-[0.14em] text-white"
                style={{ background: FINDLE_GREEN }}
              >
                STEP {activeIdx + 1}
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: FINDLE_GREEN }}>
                {pick(copy.tag, lang)}
              </span>
            </div>
            <h1 className="mt-3 text-[41px] font-extrabold leading-[1.13] tracking-tight text-white">
              {pick(copy.title, lang)}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-zinc-400">{pick(copy.desc, lang)}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 진행 스텝퍼 — 노드 + 연결선, 현재 단계 강조 */}
      <div className="mt-8 flex items-start">
        {RAIL.map((r, i) => {
          const Icon = r.icon;
          const done = i < activeIdx;
          const active = i === activeIdx;
          const leftFilled = i <= activeIdx;
          const rightFilled = i < activeIdx;
          return (
            <div key={r.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className="h-[2px] flex-1 rounded-full"
                  style={{ background: i === 0 ? 'transparent' : leftFilled ? FINDLE_GREEN : DIM_LINE }}
                />
                <motion.span
                  animate={{ scale: active ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: done || active ? FINDLE_GREEN : 'rgba(255,255,255,0.05)',
                    boxShadow: active ? `0 0 0 4px rgba(21,160,106,0.22)` : 'none',
                    border: done || active ? 'none' : `1px solid ${DIM_LINE}`,
                  }}
                >
                  {done ? (
                    <Check className="h-[19px] w-[19px] text-white" strokeWidth={3} />
                  ) : (
                    <Icon
                      className="h-[19px] w-[19px]"
                      style={{ color: active ? '#ffffff' : '#6b7280' }}
                    />
                  )}
                </motion.span>
                <span
                  className="h-[2px] flex-1 rounded-full"
                  style={{ background: i === RAIL.length - 1 ? 'transparent' : rightFilled ? FINDLE_GREEN : DIM_LINE }}
                />
              </div>
              <span
                className="mt-2.5 text-[13px] font-semibold transition-colors"
                style={{ color: active ? '#ffffff' : done ? '#d4d4d8' : '#52525b' }}
              >
                {pick(r.label, lang)}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
