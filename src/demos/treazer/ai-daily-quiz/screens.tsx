import { ChevronLeft, Newspaper, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { BottomNav, Coin, GoldPill, Wordmark } from '../_shared/ui';
import { fmt, pick, type Lang } from '../_shared/i18n';
import { GENERATED_QUIZZES, LANGS, STR, TODAY_ARTICLE } from './data';
import { useAiDailyQuiz } from './state';

/** 오늘의 뉴스 기사 카드 — AI 퀴즈의 소스. 현재 데모 언어로 표시 */
function ArticleCard({ lang }: { lang: Lang }) {
  return (
    <div data-demo-id="article-card" className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-orange-500">
        <Newspaper className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-wide">{pick(STR.todaysNews, lang)}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <h3 className="mt-2.5 text-[15px] font-bold leading-snug text-zinc-900">
            {pick(TODAY_ARTICLE.headline, lang)}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-600">
            {pick(TODAY_ARTICLE.summary, lang)}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10.5px] text-zinc-400">
            <span className="font-semibold text-zinc-500">{TODAY_ARTICLE.source}</span>
            <span>·</span>
            <span>{pick(TODAY_ARTICLE.time, lang)}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** AI 분석 중 상태 — shimmer 스켈레톤 + thinking dot */
function AnalyzingCard({ lang }: { lang: Lang }) {
  return (
    <motion.div
      data-demo-id="analyzing-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4"
    >
      <div className="flex items-center gap-2 text-orange-600">
        <Sparkles className="h-4 w-4" />
        <span className="text-[13px] font-bold">{pick(STR.analyzing, lang)}</span>
        <span className="flex gap-1 pl-0.5">
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-orange-500" />
        </span>
      </div>
      {/* shimmer 스켈레톤 라인들 */}
      <div className="mt-3.5 space-y-2.5">
        <div className="shimmer h-3.5 w-4/5 rounded-full bg-orange-200/50" />
        <div className="shimmer h-3.5 w-3/5 rounded-full bg-orange-200/50" />
        <div className="shimmer h-9 w-full rounded-lg bg-orange-200/40" />
      </div>
    </motion.div>
  );
}

/** 생성된 퀴즈 카드 1개 — 현재 언어로 텍스트 표시 */
function QuizCard({ index, lang }: { index: number; lang: Lang }) {
  const q = GENERATED_QUIZZES[index];
  return (
    <motion.div
      data-demo-id={`quiz-card-${index}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500">
          <Sparkles className="h-3.5 w-3.5" /> AI Quiz
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
          <Coin className="h-3.5 w-3.5 text-[8px]" /> {fmt(pick(STR.upTo, lang), { n: q.reward })}
        </span>
      </div>
      {/* 언어 전환 시 텍스트가 부드럽게 교체되도록 key에 lang 포함 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mt-2.5 text-[14px] font-bold leading-snug text-zinc-900">
            {pick(q.question, lang)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pick(q.options, lang).map((opt, i) => (
              <div
                key={i}
                className="rounded-lg border-2 border-zinc-100 bg-zinc-100 px-3 py-2 text-[12px] font-medium text-zinc-600"
              >
                {opt}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/** 언어 칩 행 — EN/JA/VI/TH (글로벌 i18n과 동일) */
function LangChips() {
  const { lang, setLang } = useAiDailyQuiz();
  return (
    <div className="flex items-center gap-2">
      {LANGS.map(({ id, label, flag }) => {
        const active = id === lang;
        return (
          <button
            key={id}
            type="button"
            data-demo-id={`lang-chip-${id}`}
            onClick={() => setLang(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors',
              active
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-zinc-200 bg-white text-zinc-500',
            )}
          >
            <span className="text-[13px] leading-none">{flag}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function DailyQuizScreen() {
  const { gold, phase, visibleCount, lang, startGenerate } = useAiDailyQuiz();

  return (
    <div className="flex h-full flex-col bg-[#f4f4f6]">
      <header className="relative flex shrink-0 items-center justify-between bg-[#f4f4f6] px-5 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
          <Wordmark className="text-[18px]" />
        </div>
        <GoldPill amount={gold} />
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        <div className="px-1 pb-2 pt-1">
          <h1 className="text-[20px] font-bold text-zinc-900">{pick(STR.dailyQuizTitle, lang)}</h1>
          <p className="text-[12px] text-zinc-500">{pick(STR.dailyQuizSubtitle, lang)}</p>
        </div>

        {/* 1) 오늘의 뉴스 기사 카드 */}
        <ArticleCard lang={lang} />

        {/* 2) idle — 생성 버튼 / analyzing — shimmer */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.button
                key="gen-btn"
                type="button"
                data-demo-id="generate-btn"
                onClick={startGenerate}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-[14px] font-bold text-white"
              >
                <Sparkles className="h-4 w-4" />
                {pick(STR.generateQuiz, lang)}
              </motion.button>
            )}
            {phase === 'analyzing' && <AnalyzingCard key="analyzing" lang={lang} />}
          </AnimatePresence>
        </div>

        {/* 3) done — 언어 칩 + 생성된 퀴즈 카드 순차 등장 */}
        {phase === 'done' && (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-[12px] font-bold text-zinc-700">{pick(STR.chooseLanguage, lang)}</span>
            </div>
            <LangChips />

            <div className="mt-3 space-y-2.5">
              {GENERATED_QUIZZES.slice(0, visibleCount).map((_, i) => (
                <QuizCard key={i} index={i} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="mission" />
    </div>
  );
}

/** 화면 래퍼 — Mobile/Desktop 공용 (단일 화면) */
export function AppScreens() {
  return <DailyQuizScreen />;
}
